import Loading from "components/Loading"
import React, {FC, Suspense} from "react"
import {Navigate, Route, Routes} from "react-router-dom"

// Code Splitting: This downloads the code for each page the first time the user
// navigates to it. This is highly recommended for large apps since it reduces
// the initial bundle size and improves performance.
const Dashboard = React.lazy(() => import("pages/Dashboard"))
const ProjectView = React.lazy(() => import("pages/ProjectView"))
const UserIndex = React.lazy(() => import("pages/UserIndex"))
const UserDetail = React.lazy(() => import("pages/UserDetail"))
const Settings = React.lazy(() => import("pages/Settings"))
const ProjectIndex = React.lazy(() => import("pages/ProjectIndex"))
const ProjectDetail = React.lazy(() => import("pages/ProjectDetail"))
const TaskDetail = React.lazy(() => import("pages/TaskDetail"))
const MyTimeEntries = React.lazy(() => import("pages/MyTimeEntries"))
const Reports = React.lazy(() => import("pages/ReportsPage"))

const AuthRoutes: FC = () => {
  return (
    // The Suspense component is used to show a loading indicator while the
    // code for the page is being downloaded. (see above)
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/tasks/:taskId" element={<TaskDetail />} />
          <Route path="/project-view" element={<ProjectView />} />
          <Route path="/users" element={<UserIndex />} />
          <Route path="/users/:userId" element={<UserDetail />} />
          <Route path="/users/:userId/tasks/:taskId" element={<TaskDetail />} />
          <Route path="/projects" element={<ProjectIndex />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
          <Route
            path="/projects/:projectId/tasks/:taskId"
            element={<TaskDetail />}
          />
          <Route path="/my-time" element={<MyTimeEntries />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reports" element={<Reports />} />

          {/* If page doesn't exist, redirect to home */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AuthRoutes
