import {Box, Skeleton, Stack, Typography} from "@mui/material"
import type {Project, Task} from "api/sdk"
import {TaskState} from "api/sdk"
import {AddTaskButton} from "components/AddTaskButton"
import {TaskModal} from "components/TaskModal"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import type {AnnotatedTask} from "hooks/useAnnotatedEndpoints"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react"
import {useDrop} from "react-dnd"
import {taskStateLabels} from "utils/helpers"
import {TaskCard} from "./TaskCard"
import {useSearchParams} from "react-router-dom"

dayjs.extend(duration)

export interface TaskStateColumnProps {
  project: Project[]
  state: TaskState
  tasks: AnnotatedTask[] | undefined
  updateTask: (task: Task) => void
  handleDrop: (task: AnnotatedTask, newState: TaskState) => void
  onAddedTask: (task: AnnotatedTask) => void
}

export const TaskStateColumn: FC<TaskStateColumnProps> = (props) => {
  const {state, tasks, handleDrop, project, onAddedTask, updateTask} = props
  const permissions = usePermissions()

  const [urlParams, setUrlParams] = useSearchParams()

  const selectedTask =
    tasks?.find((t) => t._id === urlParams.get("task")) ?? null

  const changeSelectedTask = (task: AnnotatedTask | null) => {
    task ? urlParams.set("task", task?._id ?? "") : urlParams.delete("task")
    setUrlParams(urlParams)
  }

  const [{isOver, canDrop}, drop] = useDrop({
    accept: permissions.canManageAllTasks
      ? Object.values(TaskState).filter((s) => s !== state)
      : [],
    drop: (task) => handleDrop(task as AnnotatedTask, state),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })

  return (
    <>
      <Box
        sx={{
          minWidth: 300,
          flexGrow: 1,
          flexBasis: 0,
          bgcolor: isOver && canDrop ? "primary.dark" : "transparent",
          borderRadius: 1,
          p: 1
        }}
        ref={drop}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{mb: 2}}
        >
          <Typography variant="h3">{taskStateLabels[state]}</Typography>

          {tasks && (
            <Typography variant="h3" color="text.secondary">
              {tasks.length}
            </Typography>
          )}
        </Stack>

        {(() => {
          if (tasks === undefined)
            return (
              <Stack spacing={1}>
                {Array.from({length: 3}).map((_, i) => (
                  <Skeleton key={i} height={60} variant="rounded" />
                ))}
              </Stack>
            )

          const canCreateTask =
            permissions.canManageAllTasks ||
            (permissions.canReportNewTasks && state === TaskState.Hold)

          return (
            <>
              {canCreateTask && (
                <AddTaskButton
                  afterSubmit={onAddedTask}
                  sx={{mb: 1.5}}
                  fullWidth
                  variant="outlined"
                  projects={project}
                  state={state}
                />
              )}

              {tasks.length === 0 && (
                <Typography color="text.disabled" fontStyle="italic">
                  No tasks
                </Typography>
              )}

              <Stack
                spacing={1.5}
                sx={{
                  opacity: isOver && canDrop ? 0.5 : 1,
                  mb: 2
                }}
              >
                {tasks
                  .filter((t) => t.state === state)
                  .map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onClick={() => changeSelectedTask(task)}
                    />
                  ))}
              </Stack>
            </>
          )
        })()}
      </Box>

      <TaskModal
        task={selectedTask}
        handleClose={() => changeSelectedTask(null)}
        setTask={updateTask}
      />
    </>
  )
}
