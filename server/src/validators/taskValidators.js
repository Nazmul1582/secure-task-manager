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

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(140),
    description: z.string().trim().max(2000).optional().default(''),
    status: z.enum(Object.values(TASK_STATUSES)).optional().default(TASK_STATUSES.TODO),
    priority: z.enum(Object.values(TASK_PRIORITIES)).optional().default(TASK_PRIORITIES.MEDIUM),
    dueDate: dateSchema,
    tags: z.array(z.string().trim().min(1).max(32)).max(10).optional().default([]),
    assignedTo: objectIdSchema.optional().nullable(),
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
