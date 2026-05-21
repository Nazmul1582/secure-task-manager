import mongoose from 'mongoose'

export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  DONE: 'done',
}

export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
}

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [140, 'Title must be 140 characters or less'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description must be 2000 characters or less'],
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUSES),
      default: TASK_STATUSES.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITIES),
      default: TASK_PRIORITIES.MEDIUM,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
      set(tags) {
        if (!Array.isArray(tags)) {
          return []
        }

        return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))]
      },
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v
        return ret
      },
    },
  },
)

taskSchema.index({ createdBy: 1, status: 1 })
taskSchema.index({ createdBy: 1, priority: 1 })
taskSchema.index({ createdBy: 1, dueDate: 1 })
taskSchema.index({ assignedTo: 1, status: 1 })
taskSchema.index({ title: 'text', description: 'text', tags: 'text' })

export const Task = mongoose.model('Task', taskSchema)
