/**
 * GraphQL Service using Native JavaScript Fetch API
 * 
 * NOTE FOR VIVA:
 * As required by the academic micro-project guidelines, this service demonstrates
 * integrating a GraphQL backend using standard browser Fetch API without heavy
 * external client libraries like Apollo Client or Axios.
 * 
 * Every GraphQL request is an HTTP POST request sending JSON with:
 * {
 *   query: "query or mutation string",
 *   variables: { ... }
 * }
 */

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_URI || '/graphql';

/**
 * Core helper function to send GraphQL queries and mutations via native fetch()
 * 
 * @param {string} query - GraphQL query or mutation string
 * @param {object} variables - Variables object
 * @returns {Promise<any>} Data returned by the GraphQL server
 */
export async function fetchGraphQL(query, variables = {}) {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // Check if GraphQL returned application-level errors
    if (result.errors && result.errors.length > 0) {
      const errorMessage = result.errors.map((err) => err.message).join('; ');
      throw new Error(errorMessage);
    }

    return result.data;
  } catch (error) {
    console.error('GraphQL Request failed:', error);
    throw error;
  }
}

/* ==========================================================================
   GRAPHQL QUERY DEFINITIONS
   ========================================================================== */

export const GET_TASKS_QUERY = `
  query GetTasks($status: String, $priority: String, $search: String) {
    getTasks(status: $status, priority: $priority, search: $search) {
      id
      title
      description
      subject
      priority
      dueDate
      status
      createdAt
    }
  }
`;

export const GET_TASK_BY_ID_QUERY = `
  query GetTask($id: ID!) {
    getTask(id: $id) {
      id
      title
      description
      subject
      priority
      dueDate
      status
      createdAt
    }
  }
`;

export const GET_TASK_STATS_QUERY = `
  query GetTaskStats {
    getTaskStats {
      total
      completed
      pending
      overdue
    }
  }
`;

/* ==========================================================================
   GRAPHQL MUTATION DEFINITIONS
   ========================================================================== */

export const ADD_TASK_MUTATION = `
  mutation AddTask(
    $title: String!
    $description: String
    $subject: String!
    $priority: String!
    $dueDate: String!
  ) {
    addTask(
      title: $title
      description: $description
      subject: $subject
      priority: $priority
      dueDate: $dueDate
    ) {
      id
      title
      description
      subject
      priority
      dueDate
      status
      createdAt
    }
  }
`;

export const UPDATE_TASK_MUTATION = `
  mutation UpdateTask(
    $id: ID!
    $title: String
    $description: String
    $subject: String
    $priority: String
    $dueDate: String
    $status: String
  ) {
    updateTask(
      id: $id
      title: $title
      description: $description
      subject: $subject
      priority: $priority
      dueDate: $dueDate
      status: $status
    ) {
      id
      title
      description
      subject
      priority
      dueDate
      status
      createdAt
    }
  }
`;

export const DELETE_TASK_MUTATION = `
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
      title
    }
  }
`;

export const TOGGLE_TASK_STATUS_MUTATION = `
  mutation ToggleTaskStatus($id: ID!) {
    toggleTaskStatus(id: $id) {
      id
      title
      status
    }
  }
`;

/* ==========================================================================
   SERVICE FUNCTIONS EXPORTED TO REACT COMPONENTS
   ========================================================================== */

/**
 * Fetch all tasks matching optional filters
 */
export const fetchTasks = async (filters = {}) => {
  const data = await fetchGraphQL(GET_TASKS_QUERY, {
    status: filters.status || 'All',
    priority: filters.priority || 'All',
    search: filters.search || '',
  });
  return data.getTasks;
};

/**
 * Fetch single task by ID
 */
export const fetchTaskById = async (id) => {
  const data = await fetchGraphQL(GET_TASK_BY_ID_QUERY, { id });
  return data.getTask;
};

/**
 * Fetch dashboard task counts and statistics
 */
export const fetchTaskStats = async () => {
  const data = await fetchGraphQL(GET_TASK_STATS_QUERY);
  return data.getTaskStats;
};

/**
 * Create a new task via GraphQL mutation
 */
export const createTask = async (taskInput) => {
  const data = await fetchGraphQL(ADD_TASK_MUTATION, {
    title: taskInput.title,
    description: taskInput.description,
    subject: taskInput.subject,
    priority: taskInput.priority,
    dueDate: taskInput.dueDate,
  });
  return data.addTask;
};

/**
 * Update an existing task via GraphQL mutation
 */
export const editTask = async (id, taskInput) => {
  const data = await fetchGraphQL(UPDATE_TASK_MUTATION, {
    id,
    ...taskInput,
  });
  return data.updateTask;
};

/**
 * Delete a task by ID via GraphQL mutation
 */
export const removeTask = async (id) => {
  const data = await fetchGraphQL(DELETE_TASK_MUTATION, { id });
  return data.deleteTask;
};

/**
 * Toggle task status between Pending & Completed via GraphQL mutation
 */
export const toggleStatus = async (id) => {
  const data = await fetchGraphQL(TOGGLE_TASK_STATUS_MUTATION, { id });
  return data.toggleTaskStatus;
};
