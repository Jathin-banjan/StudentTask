import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import connectDB from './config/db.js';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';
import Task from './models/Task.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Seed initial academic student tasks if the database is newly initialized
 */
const seedInitialDataIfEmpty = async () => {
  try {
    const count = await Task.countDocuments();
    if (count === 0) {
      console.log('🌱 Database is empty. Seeding sample student assignments...');
      const sampleTasks = [
        {
          title: 'Design ER Diagram for Library Management System',
          description: 'Draw detailed Crow-foot notation ER diagram with all cardinalities and attributes for MCA-103 Database Lab.',
          subject: 'Database Management Systems',
          priority: 'High',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ahead
          status: 'Pending',
        },
        {
          title: 'Implement Dijkstra Algorithm in Java',
          description: 'Write clean Java code to find the shortest path in a weighted graph and submit the analysis report.',
          subject: 'Data Structures & Algorithms',
          priority: 'Medium',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ahead
          status: 'Pending',
        },
        {
          title: 'Full Stack MERN Micro Project Viva Preparation',
          description: 'Review React component hierarchy, GraphQL queries/mutations, and Apollo Server integration.',
          subject: 'Web Technologies',
          priority: 'High',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ahead
          status: 'Pending',
        },
        {
          title: 'Operating Systems Process Scheduling Quiz',
          description: 'Completed unit test on Round Robin, FCFS, and Shortest Job First scheduling algorithms.',
          subject: 'Operating Systems',
          priority: 'Low',
          dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Overdue/past
          status: 'Completed',
        },
        {
          title: 'Cloud Computing Research Paper Summary',
          description: 'Submit a 2-page critical review of serverless computing architectures and performance trade-offs.',
          subject: 'Cloud Computing',
          priority: 'Medium',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Overdue pending task
          status: 'Pending',
        },
      ];

      await Task.insertMany(sampleTasks);
      console.log(`✅ Seeded ${sampleTasks.length} initial student tasks successfully!`);
    }
  } catch (err) {
    console.warn('⚠️ Seeding skipped or encountered error:', err.message);
  }
};

/**
 * Initialize Express Application and Apollo GraphQL Server
 */
const startServer = async () => {
  const app = express();

  // Connect to Database
  await connectDB();

  // Populate sample student data if collection is blank
  await seedInitialDataIfEmpty();

  // Initialize Apollo Server instance with GraphQL schema and resolvers
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Start Apollo Server engine
  await apolloServer.start();

  // Configure Middlewares
  app.use(cors());
  app.use(express.json());

  // Mount Apollo GraphQL Express middleware at '/graphql'
  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({ req }),
    })
  );

  // Health check endpoint
  app.get('/', (req, res) => {
    res.json({
      project: 'Student Task Manager - GraphQL Backend',
      status: 'Active',
      graphqlEndpoint: `http://localhost:${PORT}/graphql`,
    });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Student Task Manager GraphQL Server running at: http://localhost:${PORT}/graphql`);
    console.log(`📌 REST Health check available at: http://localhost:${PORT}/`);
  });
};

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
});
