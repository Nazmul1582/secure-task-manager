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

async function populateTaskUsers(task) {
  await task.populate([
    { path: 'createdBy', select: userPublicFields },
    { path: 'assignedTo', select: userPublicFields },
  ]);
}

