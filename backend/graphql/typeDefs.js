/**
 * GraphQL Type Definitions (Schema)
 * 
 * Defines the contract between frontend client and backend server:
 * - Data types (Task, TaskStats)
 * - Queries (Read operations)
 * - Mutations (Create, Update, Delete operations)
 */
export const typeDefs = `#graphql
  """
  Represents a single academic student assignment or coursework task
  """
  type Task {
    id: ID!
    title: String!
    description: String
    subject: String!
    priority: String!
    dueDate: String!
    status: String!
    createdAt: String
  }

  """
  Summary statistics for task dashboard cards
  """
  type TaskStats {
    total: Int!
    completed: Int!
    pending: Int!
    overdue: Int!
  }

  """
  Root Query type - Read operations
  """
  type Query {
    """
    Retrieve all tasks, optionally filtered by status, priority, or search keyword
    """
    getTasks(status: String, priority: String, search: String): [Task!]!

    """
    Retrieve an individual task by unique ID
    """
    getTask(id: ID!): Task

    """
    Retrieve aggregated task statistics (total, completed, pending, overdue)
    """
    getTaskStats: TaskStats!
  }

  """
  Root Mutation type - Write and Modify operations
  """
  type Mutation {
    """
    Create a new student task/assignment
    """
    addTask(
      title: String!
      description: String
      subject: String!
      priority: String!
      dueDate: String!
    ): Task!

    """
    Update details of an existing task
    """
    updateTask(
      id: ID!
      title: String
      description: String
      subject: String
      priority: String
      dueDate: String
      status: String
    ): Task!

    """
    Delete a task by ID
    """
    deleteTask(id: ID!): Task!

    """
    Toggle task status between 'Pending' and 'Completed'
    """
    toggleTaskStatus(id: ID!): Task!
  }
`;
