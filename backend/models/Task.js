import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { isConnectedToMongoDB } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/* ==========================================================================
   1. STANDARD MONGOOSE SCHEMA & MODEL
   ========================================================================== */
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
    timestamps: true,
  }
);

taskSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

const MongooseTask = mongoose.models.Task || mongoose.model('Task', taskSchema);

/* ==========================================================================
   2. PERSISTENT STORAGE ENGINE (FALLBACK WHEN MONGODB DAEMON IS OFFLINE)
   ========================================================================== */

const defaultInitialTasks = [
  {
    title: 'Design ER Diagram for Library Management System',
    description: 'Draw detailed Crow-foot notation ER diagram with all cardinalities and attributes for MCA-103 Database Lab.',
    subject: 'Database Management Systems',
    priority: 'High',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Pending',
  },
  {
    title: 'Implement Dijkstra Algorithm in Java',
    description: 'Write clean Java code to find the shortest path in a weighted graph and submit the analysis report.',
    subject: 'Data Structures & Algorithms',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Pending',
  },
  {
    title: 'Full Stack MERN Micro Project Viva Preparation',
    description: 'Review React component hierarchy, GraphQL queries/mutations, and Apollo Server integration.',
    subject: 'Web Technologies',
    priority: 'High',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Pending',
  },
  {
    title: 'Operating Systems Process Scheduling Quiz',
    description: 'Completed unit test on Round Robin, FCFS, and Shortest Job First scheduling algorithms.',
    subject: 'Operating Systems',
    priority: 'Low',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Completed',
  },
  {
    title: 'Cloud Computing Research Paper Summary',
    description: 'Submit a 2-page critical review of serverless computing architectures and performance trade-offs.',
    subject: 'Cloud Computing',
    priority: 'Medium',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Pending',
  },
];

let inMemoryStore = null;

const readTasksFromFile = () => {
  if (inMemoryStore !== null) {
    return inMemoryStore;
  }
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const seeded = defaultInitialTasks.map((t) => {
        const id = crypto.randomBytes(12).toString('hex');
        return {
          ...t,
          _id: id,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
      fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
      inMemoryStore = seeded;
      return seeded;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    inMemoryStore = JSON.parse(raw || '[]');
    return inMemoryStore;
  } catch (err) {
    console.warn('Storage fallback warning:', err.message);
    if (!inMemoryStore) {
      inMemoryStore = defaultInitialTasks.map((t) => {
        const id = crypto.randomBytes(12).toString('hex');
        return {
          ...t,
          _id: id,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
    }
    return inMemoryStore;
  }
};

const writeTasksToFile = (tasks) => {
  inMemoryStore = tasks;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch {
    // Ignored in read-only filesystems
  }
};

const wrapDocument = (rawTask) => {
  if (!rawTask) return null;
  const doc = {
    ...rawTask,
    _id: rawTask._id || rawTask.id,
    id: rawTask._id || rawTask.id,
    createdAt: rawTask.createdAt ? new Date(rawTask.createdAt) : new Date(),
    async save() {
      const all = readTasksFromFile();
      const idx = all.findIndex((t) => t._id === this._id || t.id === this._id);
      const toSave = {
        _id: this._id,
        id: this.id,
        title: this.title,
        description: this.description || '',
        subject: this.subject,
        priority: this.priority,
        dueDate: this.dueDate,
        status: this.status,
        createdAt: this.createdAt instanceof Date ? this.createdAt.toISOString() : this.createdAt,
        updatedAt: new Date().toISOString(),
      };

      if (idx >= 0) {
        all[idx] = toSave;
      } else {
        all.push(toSave);
      }
      writeTasksToFile(all);
      return wrapDocument(toSave);
    },
  };
  return doc;
};

class FileQuery {
  constructor(query = {}) {
    this.query = query;
    this.sortCriteria = null;
  }

  sort(criteria) {
    this.sortCriteria = criteria;
    return this;
  }

  async exec() {
    let tasks = readTasksFromFile();

    if (this.query.status && this.query.status !== 'All') {
      tasks = tasks.filter((t) => t.status === this.query.status);
    }

    if (this.query.priority && this.query.priority !== 'All') {
      tasks = tasks.filter((t) => t.priority === this.query.priority);
    }

    if (this.query.$or && Array.isArray(this.query.$or)) {
      tasks = tasks.filter((t) => {
        return this.query.$or.some((condition) => {
          if (condition.title) {
            return condition.title.test(t.title || '');
          }
          if (condition.subject) {
            return condition.subject.test(t.subject || '');
          }
          return false;
        });
      });
    }

    if (this.sortCriteria) {
      if (this.sortCriteria.createdAt === -1) {
        tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (this.sortCriteria.createdAt === 1) {
        tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }
    }

    return tasks.map(wrapDocument);
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

/**
 * Universal Task Model
 * Uses native Mongoose when MongoDB is connected,
 * or persistent document store when running in demonstration/standby mode.
 */
class Task {
  constructor(data = {}) {
    if (isConnectedToMongoDB) {
      return new MongooseTask(data);
    }

    const id = crypto.randomBytes(12).toString('hex');
    this._id = id;
    this.id = id;
    this.title = data.title;
    this.description = data.description || '';
    this.subject = data.subject;
    this.priority = data.priority || 'Medium';
    this.dueDate = data.dueDate;
    this.status = data.status || 'Pending';
    this.createdAt = new Date().toISOString();
  }

  async save() {
    return wrapDocument(this).save();
  }

  static find(query = {}) {
    if (isConnectedToMongoDB) {
      return MongooseTask.find(query);
    }
    return new FileQuery(query);
  }

  static async findById(id) {
    if (isConnectedToMongoDB) {
      return MongooseTask.findById(id);
    }
    const tasks = readTasksFromFile();
    const match = tasks.find((t) => t._id === id || t.id === id);
    return match ? wrapDocument(match) : null;
  }

  static async findByIdAndUpdate(id, updates, options = {}) {
    if (isConnectedToMongoDB) {
      return MongooseTask.findByIdAndUpdate(id, updates, options);
    }
    const tasks = readTasksFromFile();
    const idx = tasks.findIndex((t) => t._id === id || t.id === id);
    if (idx === -1) return null;

    tasks[idx] = {
      ...tasks[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeTasksToFile(tasks);
    return wrapDocument(tasks[idx]);
  }

  static async findByIdAndDelete(id) {
    if (isConnectedToMongoDB) {
      return MongooseTask.findByIdAndDelete(id);
    }
    const tasks = readTasksFromFile();
    const idx = tasks.findIndex((t) => t._id === id || t.id === id);
    if (idx === -1) return null;

    const deleted = tasks.splice(idx, 1)[0];
    writeTasksToFile(tasks);
    return wrapDocument(deleted);
  }

  static async countDocuments(query = {}) {
    if (isConnectedToMongoDB) {
      return MongooseTask.countDocuments(query);
    }
    const tasks = readTasksFromFile();
    return tasks.length;
  }

  static async insertMany(docs) {
    if (isConnectedToMongoDB) {
      return MongooseTask.insertMany(docs);
    }
    const tasks = readTasksFromFile();
    const newDocs = docs.map((d) => ({
      ...d,
      _id: d._id || crypto.randomBytes(12).toString('hex'),
      id: d.id || d._id || crypto.randomBytes(12).toString('hex'),
      createdAt: d.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    tasks.push(...newDocs);
    writeTasksToFile(tasks);
    return newDocs.map(wrapDocument);
  }
}

export default Task;
