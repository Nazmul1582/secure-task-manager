import mongoose from 'mongoose'

import { USER_ROLES, User } from '../models/User.js'
import { Task } from '../models/Task.js'
import { ApiError } from '../utils/apiError.js'

const userPublicFields = 'name email avatar role'

export async function createTaskForUser(user, input) {
  const assignedTo = input.assignedTo || user.id

  await assertCanAssignTask(user, assignedTo)

  const task = await Task.create({
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    dueDate: input.dueDate,
    position: input.position,
    tags: input.tags,
    assignedTo,
    createdBy: user._id,
  })

  await populateTaskUsers(task)
  return task.toJSON()
}

export async function listTasksForUser(user, query) {
  const taskVisibilityFilter = await buildVisibleTaskFilter(user)
  const filter = {
    ...taskVisibilityFilter,
  }

  if (query.status) {
    filter.status = query.status
  }

  if (query.priority) {
    filter.priority = query.priority
  }

  if (query.assignedTo) {
    filter.assignedTo = query.assignedTo
  }

  if (query.tags?.length) {
    filter.tags = { $all: query.tags.map((tag) => tag.trim().toLowerCase()) }
  }

  if (query.search) {
    filter.$text = { $search: query.search }
  }

  const skip = (query.page - 1) * query.limit
  const sortDirection = query.sortOrder === 'asc' ? 1 : -1
  const projection = query.search ? { score: { $meta: 'textScore' } } : undefined
  const sort = query.search
    ? { score: { $meta: 'textScore' }, [query.sortBy]: sortDirection }
    : { [query.sortBy]: sortDirection }

  const tasksQuery = Task.find(filter, projection)
  const totalQuery = Task.countDocuments(filter)

  if (query.search) {
    tasksQuery.setOptions({ sanitizeFilter: false })
    totalQuery.setOptions({ sanitizeFilter: false })
  }

  const [tasks, total] = await Promise.all([
    tasksQuery
      .populate('createdBy', userPublicFields)
      .populate('assignedTo', userPublicFields)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .lean(),
    totalQuery,
  ])

  return {
    tasks,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  }
}

export async function getTaskForUser(user, taskId) {
  const task = await Task.findOne({
    _id: taskId,
    ...buildTaskAccessFilter(user),
  })
    .populate('createdBy', userPublicFields)
    .populate('assignedTo', userPublicFields)
    .lean()

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  return task
}

export async function updateTaskForUser(user, taskId, input) {
  const task = await Task.findOne({
    _id: taskId,
    ...buildTaskAccessFilter(user),
  })

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  if (Object.hasOwn(input, 'assignedTo')) {
    await assertCanAssignTask(user, input.assignedTo)
  }

  for (const field of [
    'title',
    'description',
    'status',
    'priority',
    'dueDate',
    'position',
    'tags',
    'assignedTo',
  ]) {
    if (Object.hasOwn(input, field)) {
      task[field] = input[field]
    }
  }

  await task.save()
  await populateTaskUsers(task)

  return task.toJSON()
}

export async function deleteTaskForUser(user, taskId) {
  const task = await Task.findOne({
    _id: taskId,
    ...buildTaskAccessFilter(user),
  })

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  await task.deleteOne()
}

async function populateTaskUsers(task) {
  await task.populate([
    { path: 'createdBy', select: userPublicFields },
    { path: 'assignedTo', select: userPublicFields },
  ])
}

function buildTaskAccessFilter(user) {
  if (user.role === USER_ROLES.ADMIN) {
    return {}
  }

  return {
    $or: [{ createdBy: user._id }, { assignedTo: user._id }],
  }
}

async function buildVisibleTaskFilter(user) {
  const accessFilter = buildTaskAccessFilter(user)
  const deletedUserFilter = mongoose.trusted({ deletedAt: { $ne: null } })
  const deletedUserIds = await User.find(deletedUserFilter).setOptions({ sanitizeFilter: false }).distinct('_id')

  if (deletedUserIds.length === 0) {
    return accessFilter
  }

  return {
    $and: [
      accessFilter,
      {
        assignedTo: { $nin: deletedUserIds },
        createdBy: { $nin: deletedUserIds },
      },
    ],
  }
}

async function assertCanAssignTask(user, assignedTo) {
  if (!assignedTo) {
    return
  }

  if (user.role !== USER_ROLES.ADMIN && assignedTo !== user.id) {
    throw new ApiError(403, 'Members can only assign tasks to themselves')
  }

  const assigneeExists = await User.exists({ _id: assignedTo })

  if (!assigneeExists) {
    throw new ApiError(400, 'Assigned user does not exist')
  }
}
