import { z } from 'zod';

import { TASK_PRIORITIES, TASK_STATUSES } from '../models/Task.js';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const tagListSchema = z.preprocess((value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return String(value).split(',');
}, z.array(z.string().trim().min(1).max(32)).max(10).default([]));

const dateSchema = z.preprocess((value) => {
  if (value === '' || value === undefined) {
    return undefined;
  }

  return value;
}, z.coerce.date().optional().nullable());

const taskFields = {
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().max(2000),
  status: z.enum(Object.values(TASK_STATUSES)),
  priority: z.enum(Object.values(TASK_PRIORITIES)),
  dueDate: dateSchema,
  tags: z.array(z.string().trim().min(1).max(32)).max(10),
  assignedTo: objectIdSchema.optional().nullable(),
};

export const createTaskSchema = z.object({
  body: z.object({
    ...taskFields,
    description: taskFields.description.optional().default(''),
    status: taskFields.status.optional().default(TASK_STATUSES.TODO),
    priority: taskFields.priority.optional().default(TASK_PRIORITIES.MEDIUM),
    tags: taskFields.tags.optional().default([]),
  }),
});

export const listTasksSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    status: z.enum(Object.values(TASK_STATUSES)).optional(),
    priority: z.enum(Object.values(TASK_PRIORITIES)).optional(),
    assignedTo: objectIdSchema.optional(),
    tags: tagListSchema,
    search: z.string().trim().max(100).optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title', 'status']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    ...taskFields,
    title: taskFields.title.optional(),
    description: taskFields.description.optional(),
    status: taskFields.status.optional(),
    priority: taskFields.priority.optional(),
    dueDate: dateSchema,
    tags: taskFields.tags.optional(),
  }).refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field is required',
  }),
});
