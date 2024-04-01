import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {
  DeleteOutline,
  GitHub,
  MoreVert,
  Pause,
  PlayArrow,
  UnfoldLess
} from "@mui/icons-material"
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme
} from "@mui/material"
import type {Project, Task, Timer} from "api/sdk"
import {TaskState} from "api/sdk"
import {AutoLoadingButton} from "components/AutoLoadingButton"
import type {FC} from "react"
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react"
import {AuthContext, TimerContext} from "utils/context"
import {ContentCollapsed} from "./ContentCollapsed"
import HmsInputGroup from "./hmsInputGroup"
import {useThrottle} from "@lightningkite/react-lightning-helpers"
import DialogForm from "components/DialogForm"
import {CalendarIcon, DatePicker} from "@mui/x-date-pickers"
import dayjs from "dayjs"
import {usePermissions} from "hooks/usePermissions"
import {parsePreferences} from "utils/helpers"

export interface TimerItemProps {
  timer: Timer
  projectOptions: Project[] | undefined
}

export const TimerItem: FC<TimerItemProps> = ({timer, projectOptions}) => {
  const {session, currentUser} = useContext(AuthContext)
  const {removeTimer, submitTimer, updateTimer, toggleTimer} =
    useContext(TimerContext)
  const theme = useTheme()
  const permissions = usePermissions()
  const preferences = parsePreferences(currentUser.webPreferences)

  const [summary, setSummary] = useState(timer.summary)
  const [expanded, setExpanded] = useState(!timer.project || !timer.task)
  const [sortedTaskOptions, setSortedTaskOptions] = useState<Task[]>([])
  const [isCreatingNewTask, setIsCreatingNewTask] = useState(false)
  const [reactivateModal, setReactivateModal] = useState(false)
  const [taskSearch, setTaskSearch] = useState("")
  const [openPRLink, setOpenPRLink] = useState(false)
  const [prLinks, setPRLinks] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState(dayjs(timer.date))
  const [shownDate, setShownDate] = useState(dayjs(timer.date))
  const [openDateModal, setOpenDateModal] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const throttledSummary = useThrottle(summary, 1000)
  const throttledTaskSearch = useThrottle(taskSearch, 1000)

  const sortedProjects = useMemo(() => {
    return projectOptions?.sort((p) =>
      currentUser.projectFavorites.includes(p._id) ? -1 : 1
    )
  }, [projectOptions])

  const project = useMemo(
    () => projectOptions?.find((p) => p._id === timer.project),
    [timer.project, projectOptions]
  )

  const task = useMemo(
    () => sortedTaskOptions?.find((t) => t._id === timer.task),
    [timer.task, sortedTaskOptions]
  )

  useEffect(() => {
    if (!timer.project) {
      setSortedTaskOptions([])
      return
    }

    session.task
      .query({
        limit: 50,
        condition: {
          And: [
            {project: {Equal: timer.project}},
            {
              summary: {
                StringContains: {value: throttledTaskSearch, ignoreCase: true}
              }
            },
            throttledTaskSearch === ""
              ? {
                  state: {NotInside: [TaskState.Delivered, TaskState.Cancelled]}
                }
              : {Always: true}
          ]
        }
      })
      .then((tasks) =>
        setSortedTaskOptions(
          tasks.sort((a, b) => {
            if (isMyActiveTask(a)) return -1
            if (isMyActiveTask(b)) return 1
            if (isOpenTask(a)) return -1
            if (isOpenTask(b)) return 1
            return 0
          })
        )
      )
  }, [timer.project, throttledTaskSearch])

  useEffect(() => {
    updateTimer(timer._id, {summary: throttledSummary})
  }, [throttledSummary])

  useEffect(() => {
    if (!task || !project) return

    setExpanded(false)

    if (task.project !== project._id) updateTimer(timer._id, {task: undefined})
    if (task.pullRequestLink) {
      setPRLinks(task.pullRequestLink)
    }
  }, [timer.task, timer.project, task?.pullRequestLink])

  const isMyActiveTask = useCallback((task: Task): boolean => {
    return (
      task.users.map((u) => u === currentUser._id) &&
      task.state === TaskState.Active
    )
  }, [])

  const isOpenTask = useCallback((task: Task): boolean => {
    return (
      task.state !== TaskState.Delivered && task.state !== TaskState.Cancelled
    )
  }, [])

  const open = !!anchorEl

  const today = dayjs()
  const findDate =
    shownDate.format("MM/DD/YY") === today.format("MM/DD/YY")
      ? "Today"
      : shownDate.format("MM/DD/YY") ===
        today.subtract(1, "day").format("MM/DD/YY")
      ? "Yesterday"
      : dayjs(shownDate).format("MM/DD/YY")

  const createTask = useCallback(
    (summary: string) => {
      if (!project) return

      setIsCreatingNewTask(true)

      session.task
        .insert({
          _id: crypto.randomUUID(),
          project: project._id,
          projectName: project.name,
          organization: project.organization,
          organizationName: undefined,
          users: [currentUser._id],
          userNames: [currentUser.name],
          state: TaskState.Active,
          summary,
          description: "",
          attachments: [],
          estimate: undefined,
          emergency: false,
          priority: 0.0,
          createdAt: new Date().toISOString(),
          createdBy: currentUser._id,
          creatorName: currentUser.name,
          pullRequestLink: null,
          tags: []
        })
        .then((task) => {
          setSortedTaskOptions((tasks) => (tasks ? [task, ...tasks] : []))
          updateTimer(timer._id, {task: task._id})
        })
        .catch(console.error)
        .finally(() => setIsCreatingNewTask(false))
    },
    [project]
  )

  return (
    <>
      <Paper sx={{p: 1}}>
        {expanded ? (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center">
              <HmsInputGroup timer={timer} />
              {timer.project && (
                <HoverHelp description="Collapse">
                  <IconButton onClick={() => setExpanded(false)}>
                    <UnfoldLess />
                  </IconButton>
                </HoverHelp>
              )}
              <HoverHelp description="Options">
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <MoreVert />
                </IconButton>
              </HoverHelp>
            </Stack>
            <Typography variant="body2" color="text.disabled">
              {findDate}
            </Typography>
            <Autocomplete
              options={sortedProjects ?? []}
              disabled={!sortedProjects}
              loading={!sortedProjects}
              value={project ?? null}
              onChange={(e, value) => {
                updateTimer(timer._id, {project: value?._id, task: null})
              }}
              getOptionLabel={(project) => project.name}
              renderInput={(params) => (
                <TextField {...params} label="Project" />
              )}
              groupBy={(project) =>
                currentUser.projectFavorites.includes(project._id)
                  ? "Favorites"
                  : "All"
              }
            />

            <Autocomplete<Task | string, false, false, true>
              options={sortedTaskOptions}
              disabled={!timer.project || isCreatingNewTask}
              loading={isCreatingNewTask}
              value={task ?? null}
              inputValue={taskSearch}
              onInputChange={(e, value) => {
                setTaskSearch(value)
              }}
              onChange={(e, value) => {
                if (typeof value === "string") {
                  createTask(value)
                  return
                }
                updateTimer(timer._id, {task: value?._id})
                if (
                  value?.state === TaskState.Delivered ||
                  value?.state === TaskState.Cancelled
                ) {
                  setReactivateModal(true)
                }
              }}
              getOptionLabel={(task) =>
                typeof task === "string"
                  ? `Create task "${task}"`
                  : task.summary
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={isCreatingNewTask ? "Creating new task..." : "Task"}
                  placeholder={
                    isCreatingNewTask ? "Creating task..." : undefined
                  }
                />
              )}
              groupBy={(task) => {
                if (typeof task === "string") return "New Task"
                if (isMyActiveTask(task)) return "My Active Tasks"
                if (isOpenTask(task)) return "Open Tasks"
                return "Closed"
              }}
              filterOptions={(options, {inputValue, getOptionLabel}) => {
                const filtered = options.filter((option) =>
                  getOptionLabel(option)
                    .toLowerCase()
                    .includes(inputValue.toLowerCase())
                )

                const isExistingTask = filtered.some(
                  (option) => getOptionLabel(option) === inputValue
                )

                if (inputValue !== "" && !isExistingTask) {
                  filtered.push(inputValue)
                }

                return filtered
              }}
              freeSolo
              clearOnBlur
              selectOnFocus
            />
          </Stack>
        ) : (
          <Box sx={{cursor: "pointer"}} onClick={() => setExpanded(true)}>
            <ContentCollapsed
              task={task ?? null}
              project={project ?? null}
              timer={timer}
              dateValue={findDate ?? ""}
            />
          </Box>
        )}

        <TextField
          label="Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          multiline
          sx={{my: 2}}
          fullWidth
        />

        {preferences.timerPR === "show" &&
          task?.pullRequestLink &&
          permissions.doesCareAboutPRs &&
          (expanded ? (
            <Typography
              onClick={() => window.open(`${task?.pullRequestLink}`, "_blank")}
              sx={{
                "&:hover": {textDecoration: "underline"},
                cursor: "pointer",
                width: "fit-content",
                mb: 2
              }}
              color="text.disabled"
            >
              {task.pullRequestLink}
            </Typography>
          ) : (
            <Typography sx={{mb: 2}} color="text.disabled" variant="body2">
              {task.pullRequestLink}
            </Typography>
          ))}

        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Button
            variant={timer.lastStarted ? "contained" : "outlined"}
            onClick={() => toggleTimer(timer._id)}
            fullWidth
            sx={{maxWidth: 100}}
          >
            {timer.lastStarted ? <Pause /> : <PlayArrow />}
          </Button>

          <AutoLoadingButton
            onClick={() =>
              submitTimer(timer._id).catch(() =>
                alert("Error submitting timer")
              )
            }
            variant="contained"
            disabled={!timer.project || !summary}
            fullWidth
            sx={{maxWidth: 100}}
          >
            Submit
          </AutoLoadingButton>
        </Stack>
      </Paper>
      <Menu anchorEl={anchorEl} open={open} onClick={() => setAnchorEl(null)}>
        {timer.task && permissions.doesCareAboutPRs && (
          <MenuItem onClick={() => setOpenPRLink(!openPRLink)}>
            <ListItemIcon>
              <GitHub />
            </ListItemIcon>
            {"Pull Request"}
          </MenuItem>
        )}
        <MenuItem onClick={() => setOpenDateModal(!openDateModal)}>
          <ListItemIcon>
            <CalendarIcon />
          </ListItemIcon>
          {"Select Date"}
        </MenuItem>
        <MenuItem
          onClick={() =>
            confirm("Are you sure you want to delete this timer?") &&
            removeTimer(timer._id)
          }
          sx={{
            "&:hover": {
              color: theme.palette.error.main
            }
          }}
        >
          <ListItemIcon>
            <DeleteOutline />
          </ListItemIcon>
          {"Delete Timer"}
        </MenuItem>
      </Menu>
      <DialogForm
        open={openPRLink}
        onClose={() => setOpenPRLink(false)}
        onSubmit={() =>
          session.task
            .modify(timer.task!, {pullRequestLink: {Assign: prLinks}})
            .then((newTask) => {
              setSortedTaskOptions((prev) =>
                prev.map((t) => (t._id === newTask._id ? newTask : t))
              )
            })
        }
        title={
          task?.pullRequestLink
            ? "Edit Pull Request Link"
            : "Create Pull Request Link"
        }
        submitLabel="Save PR"
      >
        <Typography sx={{mb: 2}}>{`This will ${
          task?.pullRequestLink ? "edit the current " : "create a "
        } pull request link on the selected task`}</Typography>
        <TextField
          label="Pull Request Link"
          value={prLinks}
          onChange={(e) => setPRLinks((prev) => [...prev, e.target.value])}
          fullWidth
          sx={{my: 2}}
        />
      </DialogForm>
      <DialogForm
        open={openDateModal}
        onClose={() => setOpenDateModal(false)}
        onSubmit={() =>
          session.timer
            .modify(timer._id, {
              date: {Assign: selectedDate.format("YYYY-MM-DD").toString()}
            })
            .then((result) => {
              updateTimer(timer._id, result)
            })
            .then(setShownDate(selectedDate)!)
        }
        title="Set Date"
        submitLabel="Save Date"
      >
        <Typography mb={3}>
          This timer will be submitted for the selected date
        </Typography>
        <Stack>
          <DatePicker
            {...DatePicker}
            onChange={(value) => setSelectedDate(value!)}
            defaultValue={selectedDate}
            label={"Timer Date"}
            maxDate={dayjs()}
          />
        </Stack>
      </DialogForm>
      <DialogForm
        title="Reactivate Task?"
        onClose={() => setReactivateModal(false)}
        onSubmit={() =>
          session.task.modify(task?._id ?? "", {
            Chain: [
              {state: {Assign: TaskState.Active}},
              {users: {Assign: [currentUser._id]}}
            ]
          })
        }
        open={reactivateModal}
        submitLabel="Reactivate"
        cancelLabel="No"
      >
        <Link href={`/projects/${project?._id}/tasks/${task?._id}`}>
          {task?.summary}
        </Link>
        {" is currently "}
        {task?.state === TaskState.Delivered ? "delivered" : "cancelled"}
        {", would you like to reactivate it?"}
      </DialogForm>
    </>
  )
}
