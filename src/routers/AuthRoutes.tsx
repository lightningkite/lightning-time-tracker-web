import Loading from "components/Loading"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react";
import React, { Suspense} from "react"
import {Navigate, Route, Routes} from "react-router-dom"

// Code Splitting: This downloads the code for each page the first time the user
// navigates to it. This is highly recommended for large apps since it reduces
// the initial bundle size and improves performance.
const Dashboard = React.lazy(() => import("pages/Dashboard"))
const ProjectView = React.lazy(() => import("pages/ProjectBoard"))
const UserIndex = React.lazy(() => import("pages/UserIndex"))
const UserDetail = React.lazy(() => import("pages/UserDetail"))
const Settings = React.lazy(() => import("pages/Settings"))
const ProjectIndex = React.lazy(() => import("pages/ProjectIndex"))
const ProjectDetail = React.lazy(() => import("pages/ProjectDetail"))
const TaskDetail = React.lazy(() => import("pages/TaskDetail"))
const MyTimeEntries = React.lazy(() => import("pages/MyTimeEntries"))
const Reports = React.lazy(() => import("pages/ReportsPage"))

const AuthRoutes: FC = () => {
  const permissions = usePermissions()

  return (
    // The Suspense component is used to show a loading indicator while the
    // code for the page is being downloaded. (see above)
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/tasks/:taskId" element={<TaskDetail />} />

          <Route path="/project-boards" element={<ProjectView />} />
          <Route
            path="/project-boards/tasks/:taskId"
            element={<TaskDetail />}
          />

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
          <Route
            path="*"
            element={
              <Navigate
                to={
                  getUrlFromNextParam() ??
                  (permissions.canBeAssignedTasks
                    ? "/dashboard"
                    : "/project-boards")
                }
                replace
              />
            }
          />
        </Route>
      </Routes>
    </Suspense>
  )
}

/**
 *
 * @returns a URL where the path is from the next query parameter, preserve the other query parameters
 */
function getUrlFromNextParam(): string | null {
  if (location.pathname !== "/login") return null

  // Return a URL where the path is from the next query parameter, preserve the other query parameters
  const url = new URL(location.href)
  const nextPath = url.searchParams.get("next")
  if (!nextPath) return null

  url.pathname = nextPath
  url.searchParams.delete("next")

  return url.pathname + url.search
}

export default AuthRoutes
