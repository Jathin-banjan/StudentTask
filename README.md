# 🎓 Student Task Manager - MCA Full Stack Micro Project

A complete, modern, fully functional MERN + GraphQL academic web application designed for students to organize assignments, track academic deadlines, monitor task status, and boost productivity.

Built specifically for the **MCA Full Stack Web Development** individual micro project and viva evaluation.

---

## 🌟 Tech Stack Highlights

- **Frontend**: React.js (v18) initialized with Vite, modern CSS3 custom properties & responsive layout
- **Backend**: Node.js & Express.js with Apollo Server v4 GraphQL engine
- **API Architecture**: GraphQL Schema, Queries & Mutations
- **Client-to-Server Communication**: **Native JavaScript `fetch()` API** (No Apollo Client, No Axios)
- **Database**: MongoDB with Mongoose ODM (includes automatic in-memory fallback for instant viva demos!)
- **Icons**: Lucide React

---

## 📁 Project Structure

```text
student-task-manager/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & in-memory fallback
│   ├── graphql/
│   │   ├── typeDefs.js           # GraphQL Schema definition
│   │   └── resolvers.js          # GraphQL query & mutation resolvers
│   ├── models/
│   │   └── Task.js               # Mongoose Task model schema
│   ├── .env                      # Backend environment variables
│   ├── .env.example              # Example environment template
│   ├── package.json              # Backend dependencies & scripts
│   └── server.js                 # Express + Apollo Server entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FilterBar.jsx     # Stateless: Filters & search input
│   │   │   ├── Navbar.jsx        # Stateless: Navigation header & actions
│   │   │   ├── Statistics.jsx    # Stateless: Metric cards & progress
│   │   │   ├── TaskCard.jsx      # Stateless: Assignment card & actions
│   │   │   ├── TaskForm.jsx      # Stateful: Add & edit assignment modal
│   │   │   └── TaskList.jsx      # Stateful: List/grid view controller
│   │   ├── pages/
│   │   │   └── Dashboard.jsx     # Stateful: Main coordinator & state hub
│   │   ├── services/
│   │   │   └── graphqlService.js # Native Fetch API GraphQL client
│   │   ├── App.jsx               # Root React component
│   │   ├── index.css             # Modern Navy & Violet CSS3 styling
│   │   └── main.jsx              # React DOM entrypoint
│   ├── index.html                # Vite HTML shell
│   ├── package.json              # Frontend dependencies & scripts
│   ├── vite.config.js            # Vite configuration & proxy
│   └── .env                      # Frontend environment variables
├── README.md                     # Quickstart & setup guide
└── DOCUMENTATION.md              # Full academic report, architecture & viva Q&A
```

---

## 🚀 Quick Start Guide (Windows PowerShell)

### 1. Prerequisites
- **Node.js**: v18 or higher (tested on v25.x)
- **MongoDB**: Local MongoDB Service OR MongoDB Atlas cluster (a built-in fallback also ensures zero-configuration demonstration if no local daemon is running)

---

### 2. Backend Setup & Startup

Open a Windows PowerShell terminal:

```powershell
# Navigate to backend directory
cd "E:\MERN PROJ\student-task-manager\backend"

# Install backend dependencies (if not already installed)
npm install

# Start the GraphQL backend server
npm start
```

Backend will start at:
- **GraphQL Endpoint**: `http://localhost:5000/graphql`
- **Health Check**: `http://localhost:5000/`

---

### 3. Frontend Setup & Startup

Open a second Windows PowerShell terminal:

```powershell
# Navigate to frontend directory
cd "E:\MERN PROJ\student-task-manager\frontend"

# Install frontend dependencies (if not already installed)
npm install

# Start Vite React development server
npm run dev
```

Frontend will open at:
- **Application URL**: `http://localhost:3000` (or `http://localhost:5173`)

---

## 🔌 GraphQL Schema Reference

### Types
```graphql
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

type TaskStats {
  total: Int!
  completed: Int!
  pending: Int!
  overdue: Int!
}
```

### Queries
1. `getTasks(status: String, priority: String, search: String): [Task!]!`
2. `getTask(id: ID!): Task`
3. `getTaskStats: TaskStats!`

### Mutations
1. `addTask(title: String!, description: String, subject: String!, priority: String!, dueDate: String!): Task!`
2. `updateTask(id: ID!, title: String, description: String, subject: String, priority: String, dueDate: String, status: String): Task!`
3. `deleteTask(id: ID!): Task!`
4. `toggleTaskStatus(id: ID!): Task!`

---

## 🧪 Testing with Apollo Sandbox / Native cURL

You can test queries and mutations directly in your browser by opening `http://localhost:5000/graphql` in Apollo Studio Sandbox, or by sending a POST request:

```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getTaskStats { total completed pending overdue } }"}'
```

---

## 📝 Academic Viva Highlights
- **Stateful Components**: `Dashboard.jsx`, `TaskForm.jsx`, `TaskList.jsx`
- **Stateless Components**: `Navbar.jsx`, `Statistics.jsx`, `FilterBar.jsx`, `TaskCard.jsx`
- **Event Handlers**:
  - `onClick`: Add, edit, delete, mark completed, view switcher
  - `onChange`: Controlled inputs, select dropdowns, search query
  - `onSubmit`: Form validation and GraphQL dispatch
- **Native Fetch Integration**: Located cleanly in `src/services/graphqlService.js`

Refer to `DOCUMENTATION.md` for the complete 15 Viva Questions and In-Depth Architecture Report.
