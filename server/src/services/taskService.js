import { USER_ROLES, User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/apiError.js';

const userPublicFields = 'name email avatar role';

export async function createTaskForUser(user, input) {
  const assignedTo = input.assignedTo || user.id;

  if (user.role !== USER_ROLES.ADMIN && assignedTo !== user.id) {
    throw new ApiError(403, 'Members can only assign tasks to themselves');
  }

  const assigneeExists = await User.exists({ _id: assignedTo });

  if (!assigneeExists) {
    throw new ApiError(400, 'Assigned user does not exist');
  }

  const task = await Task.create({
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    dueDate: input.dueDate,
    tags: input.tags,
    assignedTo,
    createdBy: user._id,
  });

  await populateTaskUsers(task);
  return task.toJSON();
}

export async function listTasksForUser(user, query) {
  const filter = {
    ...buildTaskAccessFilter(user),
  };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.assignedTo) {
    filter.assignedTo = query.assignedTo;
  }

  if (query.tags?.length) {
    filter.tags = { $all: query.tags.map((tag) => tag.trim().toLowerCase()) };
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  const skip = (query.page - 1) * query.limit;
  const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
  const projection = query.search ? { score: { $meta: 'textScore' } } : undefined;
  const sort = query.search
    ? { score: { $meta: 'textScore' }, [query.sortBy]: sortDirection }
    : { [query.sortBy]: sortDirection };

  const [tasks, total] = await Promise.all([
    Task.find(filter, projection)
      .populate('createdBy', userPublicFields)
      .populate('assignedTo', userPublicFields)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Task.countDocuments(filter),
  ]);

  return {
    tasks,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  };
}

async function populateTaskUsers(task) {
  await task.populate([
    { path: 'createdBy', select: userPublicFields },
    { path: 'assignedTo', select: userPublicFields },
  ]);
}

function buildTaskAccessFilter(user) {
  if (user.role === USER_ROLES.ADMIN) {
    return {};
  }

  return {
    $or: [{ createdBy: user._id }, { assignedTo: user._id }],
  };
}
