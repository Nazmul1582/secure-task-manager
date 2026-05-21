import { createTaskForUser, getTaskForUser, listTasksForUser } from '../services/taskService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const createTask = asyncHandler(async (req, res) => {
  const task = await createTaskForUser(req.user, req.validated.body);

  sendSuccess(res, {
    statusCode: 201,
    message: 'Task created',
    data: {
      task,
    },
  });
});

export const listTasks = asyncHandler(async (req, res) => {
  const { tasks, meta } = await listTasksForUser(req.user, req.validated.query);

  sendSuccess(res, {
    message: 'Tasks loaded',
    data: {
      tasks,
    },
    meta,
  });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await getTaskForUser(req.user, req.validated.params.id);

  sendSuccess(res, {
    message: 'Task loaded',
    data: {
      task,
    },
  });
});
