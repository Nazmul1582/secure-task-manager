import { Router } from 'express';

import { createTask } from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTaskSchema } from '../validators/taskValidators.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createTaskSchema), createTask);

export default router;

