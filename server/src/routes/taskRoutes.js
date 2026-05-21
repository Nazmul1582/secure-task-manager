import { Router } from 'express'

import { createTask, deleteTask, getTask, listTasks, updateTask } from '../controllers/taskController.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  createTaskSchema,
  listTasksSchema,
  taskIdParamSchema,
  updateTaskSchema,
} from '../validators/taskValidators.js'

const router = Router()

router.use(authenticate)

router.get('/', validate(listTasksSchema), listTasks)
router.post('/', validate(createTaskSchema), createTask)
router.get('/:id', validate(taskIdParamSchema), getTask)
router.patch('/:id', validate(updateTaskSchema), updateTask)
router.delete('/:id', validate(taskIdParamSchema), deleteTask)

export default router
