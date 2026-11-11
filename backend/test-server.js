import connectDB from './config/db.js';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';
import Task from './models/Task.js';

async function testGraphQL() {
  console.log('Testing Apollo Server & GraphQL Resolvers...');
  await connectDB();

  // Test Task creation
  const created = await Task.insertMany([
    {
      title: 'Lab 1: React Component Hierarchy',
      description: 'Document stateful vs stateless components',
      subject: 'Web Technologies',
      priority: 'High',
      dueDate: '2026-11-20',
      status: 'Pending',
    },
  ]);
  console.log('Inserted task count:', created.length);

  // Test getTasks query resolver
  const tasks = await resolvers.Query.getTasks(null, { status: 'All', priority: 'All', search: '' });
  console.log('getTasks count:', tasks.length);

  // Test getTaskStats query resolver
  const stats = await resolvers.Query.getTaskStats();
  console.log('getTaskStats:', stats);

  // Test addTask mutation resolver
  const added = await resolvers.Mutation.addTask(null, {
    title: 'Lab 2: GraphQL Schema & Resolvers',
    description: 'Build queries and mutations',
    subject: 'Web Technologies',
    priority: 'Medium',
    dueDate: '2026-11-25',
  });
  console.log('Mutation addTask success:', added.title, 'ID:', added.id);

  // Test toggleTaskStatus mutation resolver
  const toggled = await resolvers.Mutation.toggleTaskStatus(null, { id: added.id });
  console.log('Mutation toggleTaskStatus:', toggled.status);

  // Test updateTask mutation resolver
  const updated = await resolvers.Mutation.updateTask(null, {
    id: added.id,
    priority: 'High',
  });
  console.log('Mutation updateTask priority:', updated.priority);

  // Test deleteTask mutation resolver
  const deleted = await resolvers.Mutation.deleteTask(null, { id: added.id });
  console.log('Mutation deleteTask success:', deleted.title);

  console.log('🎉 ALL GRAPHQL QUERIES & MUTATIONS PASSED PERFECTLY!');
  process.exit(0);
}

testGraphQL().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
