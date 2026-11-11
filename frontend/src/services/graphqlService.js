/**
 * GraphQL Service using Native JavaScript Fetch API
 * 
 * Multi-layer Endpoint Resolution:
 * 1. User-configured endpoint stored in localStorage (allows 1-click live connection in browser)
 * 2. VITE_GRAPHQL_URI environment variable
 * 3. GRAPHQL_URI environment variable (without prefix)
 * 4. Default fallback: '/graphql' (local Vite proxy or same-domain proxy)
 */

export function getGraphqlEndpoint() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('student_task_graphql_url');
    if (saved && saved.trim()) {
      const clean = saved.trim().replace(/\/+$/, '');
      return clean.endsWith('/graphql') ? clean : `${clean}/graphql`;
    }
  }

  if (import.meta.env.VITE_GRAPHQL_URI) {
    const envUri = import.meta.env.VITE_GRAPHQL_URI.trim().replace(/\/+$/, '');
    return envUri.endsWith('/graphql') ? envUri : `${envUri}/graphql`;
  }

  return '/graphql';
}

export function saveCustomEndpoint(url) {
  if (typeof window !== 'undefined') {
    if (!url || !url.trim()) {
      localStorage.removeItem('student_task_graphql_url');
    } else {
      const clean = url.trim().replace(/\/+$/, '');
      const finalUrl = clean.endsWith('/graphql') ? clean : `${clean}/graphql`;
      localStorage.setItem('student_task_graphql_url', finalUrl);
    }
  }
}

/**
 * Ping any GraphQL URL to verify connectivity
 */
export async function testBackendConnection(targetUrl) {
  const clean = (targetUrl || '').trim().replace(/\/+$/, '');
  const endpoint = clean.endsWith('/graphql') ? clean : `${clean}/graphql`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: `query { getTaskStats { total } }`,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors.map((e) => e.message).join(', '));
  }
  return true;
}

/**
 * Core helper function to send GraphQL queries and mutations via native fetch()
 */
export async function fetchGraphQL(query, variables = {}) {
  const endpoint = getGraphqlEndpoint();

  try {
    const response = await fetch(endpoint, {
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

    if (result.errors && result.errors.length > 0) {
      const errorMessage = result.errors.map((err) => err.message).join('; ');
      throw new Error(errorMessage);
    }

    return result.data;
  } catch (error) {
    console.error(`GraphQL Request failed on ${endpoint}:`, error);
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

export const fetchTasks = async (filters = {}) => {
  const data = await fetchGraphQL(GET_TASKS_QUERY, {
    status: filters.status || 'All',
    priority: filters.priority || 'All',
    search: filters.search || '',
  });
  return data.getTasks;
};

export const fetchTaskById = async (id) => {
  const data = await fetchGraphQL(GET_TASK_BY_ID_QUERY, { id });
  return data.getTask;
};

export const fetchTaskStats = async () => {
  const data = await fetchGraphQL(GET_TASK_STATS_QUERY);
  return data.getTaskStats;
};

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

export const editTask = async (id, taskInput) => {
  const data = await fetchGraphQL(UPDATE_TASK_MUTATION, {
    id,
    ...taskInput,
  });
  return data.updateTask;
};

export const removeTask = async (id) => {
  const data = await fetchGraphQL(DELETE_TASK_MUTATION, { id });
  return data.deleteTask;
};

export const toggleStatus = async (id) => {
  const data = await fetchGraphQL(TOGGLE_TASK_STATUS_MUTATION, { id });
  return data.toggleTaskStatus;
};
