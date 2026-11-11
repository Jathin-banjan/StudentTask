import mongoose from 'mongoose';

/**
 * Task Mongoose Model for Student Task Manager
 * 
 * Standard Mongoose Schema with strict validation, indexes,
 * timestamps, and virtual id mapping.
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [80, 'Subject cannot exceed 80 characters'],
    },
    priority: {
      type: String,
      required: [true, 'Priority level is required'],
      enum: {
        values: ['High', 'Medium', 'Low'],
        message: 'Priority must be either High, Medium, or Low',
      },
      default: 'Medium',
    },
    dueDate: {
      type: String,
      required: [true, 'Due date is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Completed'],
        message: 'Status must be either Pending or Completed',
      },
      default: 'Pending',
    },
  },
  {
    timestamps: true, // Automatically creates and updates createdAt & updatedAt
  }
);

// Virtual property 'id' to map MongoDB '_id' to GraphQL 'id'
taskSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized in JSON and Object outputs
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task;
