import Task from '../models/Task.js';

/**
 * GraphQL Resolvers
 * 
 * Resolvers provide the implementation for the schema fields.
 * Each resolver function maps to a Query or Mutation defined in typeDefs.
 */
export const resolvers = {
  Query: {
    /**
     * Retrieve all tasks with optional server-side filtering and search
     */
    getTasks: async (_, { status, priority, search }) => {
      try {
        const query = {};

        // Filter by status if provided (e.g. 'Pending' or 'Completed')
        if (status && status !== 'All') {
          query.status = status;
        }

        // Filter by priority if provided (e.g. 'High', 'Medium', 'Low')
        if (priority && priority !== 'All') {
          query.priority = priority;
        }

        // Search in title or subject using case-insensitive regex
        if (search && search.trim() !== '') {
          const searchRegex = new RegExp(search.trim(), 'i');
          query.$or = [{ title: searchRegex }, { subject: searchRegex }];
        }

        // Sort tasks: high priority first, or latest created first
        const tasks = await Task.find(query).sort({ createdAt: -1 });

        return tasks.map((t) => ({
          id: t._id.toString(),
          title: t.title,
          description: t.description || '',
          subject: t.subject,
          priority: t.priority,
          dueDate: t.dueDate,
          status: t.status,
          createdAt: t.createdAt ? t.createdAt.toISOString() : new Date().toISOString(),
        }));
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw new Error(`Failed to fetch tasks: ${error.message}`);
      }
    },

    /**
     * Retrieve single task by ID
     */
    getTask: async (_, { id }) => {
      try {
        const task = await Task.findById(id);
        if (!task) {
          throw new Error(`Task with ID ${id} not found`);
        }
        return {
          id: task._id.toString(),
          title: task.title,
          description: task.description || '',
          subject: task.subject,
          priority: task.priority,
          dueDate: task.dueDate,
          status: task.status,
          createdAt: task.createdAt ? task.createdAt.toISOString() : new Date().toISOString(),
        };
      } catch (error) {
        console.error(`Error fetching task ${id}:`, error);
        throw new Error(`Failed to fetch task: ${error.message}`);
      }
    },

    /**
     * Retrieve aggregate task statistics for dashboard cards
     */
    getTaskStats: async () => {
      try {
        const allTasks = await Task.find({});
        const total = allTasks.length;
        const completed = allTasks.filter((t) => t.status === 'Completed').length;
        const pending = allTasks.filter((t) => t.status === 'Pending').length;

        // Calculate overdue tasks (Pending tasks where dueDate < today's date YYYY-MM-DD)
        const todayStr = new Date().toISOString().split('T')[0];
        const overdue = allTasks.filter(
          (t) => t.status === 'Pending' && t.dueDate && t.dueDate < todayStr
        ).length;

        return {
          total,
          completed,
          pending,
          overdue,
        };
      } catch (error) {
        console.error('Error calculating stats:', error);
        throw new Error(`Failed to compute task statistics: ${error.message}`);
      }
    },
  },

  Mutation: {
    /**
     * Add a new assignment/task
     */
    addTask: async (_, { title, description, subject, priority, dueDate }) => {
      try {
        if (!title || !subject || !priority || !dueDate) {
          throw new Error('Title, subject, priority, and due date are required fields.');
        }

        const newTask = new Task({
          title: title.trim(),
          description: (description || '').trim(),
          subject: subject.trim(),
          priority,
          dueDate,
          status: 'Pending',
        });

        const savedTask = await newTask.save();

        return {
          id: savedTask._id.toString(),
          title: savedTask.title,
          description: savedTask.description,
          subject: savedTask.subject,
          priority: savedTask.priority,
          dueDate: savedTask.dueDate,
          status: savedTask.status,
          createdAt: savedTask.createdAt ? savedTask.createdAt.toISOString() : new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error adding task:', error);
        throw new Error(`Failed to add task: ${error.message}`);
      }
    },

    /**
     * Update an existing task
     */
    updateTask: async (_, { id, title, description, subject, priority, dueDate, status }) => {
      try {
        const updateFields = {};
        if (title !== undefined) updateFields.title = title.trim();
        if (description !== undefined) updateFields.description = description.trim();
        if (subject !== undefined) updateFields.subject = subject.trim();
        if (priority !== undefined) updateFields.priority = priority;
        if (dueDate !== undefined) updateFields.dueDate = dueDate;
        if (status !== undefined) updateFields.status = status;

        const updatedTask = await Task.findByIdAndUpdate(id, updateFields, {
          new: true,
          runValidators: true,
        });

        if (!updatedTask) {
          throw new Error(`Task with ID ${id} not found.`);
        }

        return {
          id: updatedTask._id.toString(),
          title: updatedTask.title,
          description: updatedTask.description,
          subject: updatedTask.subject,
          priority: updatedTask.priority,
          dueDate: updatedTask.dueDate,
          status: updatedTask.status,
          createdAt: updatedTask.createdAt ? updatedTask.createdAt.toISOString() : new Date().toISOString(),
        };
      } catch (error) {
        console.error(`Error updating task ${id}:`, error);
        throw new Error(`Failed to update task: ${error.message}`);
      }
    },

    /**
     * Delete a task by ID
     */
    deleteTask: async (_, { id }) => {
      try {
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
          throw new Error(`Task with ID ${id} not found for deletion.`);
        }

        return {
          id: deletedTask._id.toString(),
          title: deletedTask.title,
          description: deletedTask.description,
          subject: deletedTask.subject,
          priority: deletedTask.priority,
          dueDate: deletedTask.dueDate,
          status: deletedTask.status,
          createdAt: deletedTask.createdAt ? deletedTask.createdAt.toISOString() : new Date().toISOString(),
        };
      } catch (error) {
        console.error(`Error deleting task ${id}:`, error);
        throw new Error(`Failed to delete task: ${error.message}`);
      }
    },

    /**
     * Toggle status between 'Pending' and 'Completed'
     */
    toggleTaskStatus: async (_, { id }) => {
      try {
        const task = await Task.findById(id);
        if (!task) {
          throw new Error(`Task with ID ${id} not found.`);
        }

        task.status = task.status === 'Completed' ? 'Pending' : 'Completed';
        const savedTask = await task.save();

        return {
          id: savedTask._id.toString(),
          title: savedTask.title,
          description: savedTask.description,
          subject: savedTask.subject,
          priority: savedTask.priority,
          dueDate: savedTask.dueDate,
          status: savedTask.status,
          createdAt: savedTask.createdAt ? savedTask.createdAt.toISOString() : new Date().toISOString(),
        };
      } catch (error) {
        console.error(`Error toggling task ${id}:`, error);
        throw new Error(`Failed to toggle task status: ${error.message}`);
      }
    },
  },
};
