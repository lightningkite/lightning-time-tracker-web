import {ExpandMore, PauseCircle, PlayCircle} from "@mui/icons-material"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Typography
} from "@mui/material"
import {Project, Task, TaskState} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import React, {FC, useContext, useEffect, useMemo, useState} from "react"
import {AuthContext, TimerContext} from "utils/context"

export const ProjectsTasks: FC = () => {
  const {session} = useContext(AuthContext)
  const {timers, getTimerForTask, toggleTimer, newTimer} =
    useContext(TimerContext)

  const [projects, setProjects] = useState<Project[] | null>()
  const [tasks, setTasks] = useState<Task[] | null>()

  useEffect(() => {
    session.project
      .query({})
      .then(setProjects)
      .catch(() => setProjects(null))
  }, [])

  useEffect(() => {
    session.task
      .query({condition: {state: {Inside: [TaskState.Active]}}})
      .then(setTasks)
      .catch(() => setTasks(null))
  }, [])

  const tasksByProject: Record<string, Task[]> = useMemo(() => {
    if (!tasks || !projects) return {}

    const tasksByProject: Record<string, Task[]> = {}

    projects.forEach((project) => {
      const projectTasks = tasks
        .filter((task) => task.project === project._id)
        .sort((a, b) => a.description.localeCompare(b.description))

      tasksByProject[project.name] = projectTasks
    })

    return tasksByProject
  }, [tasks, projects])

  const handlePlay = (params: {project: string; task: string}) => {
    const key = getTimerForTask(params.task)
    if (key) {
      toggleTimer(key)
    } else {
      newTimer({project: params.project, task: params.task})
    }
  }

  const handlePause = (key: string) => {
    toggleTimer(key)
  }

  if (projects === undefined || tasks === undefined) {
    return <Loading />
  }

  if (projects === null || tasks === null) {
    return <ErrorAlert>Error loading tasks</ErrorAlert>
  }

  return (
    <Box>
      {Object.entries(tasksByProject).map(([projectName, projectTasks]) => (
        <Accordion key={projectName}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>{projectName}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {projectTasks.map((task) => {
                const timerKey = getTimerForTask(task._id)
                const timer = timerKey ? timers[timerKey] : undefined
                const isPlaying = !!timer?.lastStarted
                const isPaused = timer && !isPlaying

                return (
                  <ListItem
                    key={task._id}
                    secondaryAction={
                      isPlaying ? (
                        <IconButton
                          edge="end"
                          onClick={() => handlePause(timerKey as string)}
                          color="primary"
                        >
                          <PauseCircle fontSize="large" />
                        </IconButton>
                      ) : (
                        <IconButton
                          edge="end"
                          onClick={() =>
                            handlePlay({project: task.project, task: task._id})
                          }
                          sx={{
                            color: "text.disabled",
                            "&:hover": {color: "text.primary"}
                          }}
                        >
                          <PlayCircle fontSize="large" />
                        </IconButton>
                      )
                    }
                    disablePadding
                    sx={{
                      "& > *:last-child": {
                        display: isPlaying || isPaused ? "block" : "none"
                      },
                      "&:hover": {
                        "& > *:last-child": {
                          display: "block !important"
                        }
                      }
                    }}
                  >
                    <ListItemButton sx={{py: 2}}>
                      <Typography
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          mr: 2
                        }}
                      >
                        {task.description}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}
