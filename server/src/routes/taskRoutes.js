import { Router } from 'express';

import { createTask, getTask, listTasks } from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTaskSchema, listTasksSchema, taskIdParamSchema } from '../validators/taskValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listTasksSchema), listTasks);
router.post('/', validate(createTaskSchema), createTask);
router.get('/:id', validate(taskIdParamSchema), getTask);

export default router;
