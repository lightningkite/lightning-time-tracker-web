import {Condition} from "@lightningkite/lightning-server-simplified"
import {ExpandMore} from "@mui/icons-material"
import {Accordion, AccordionDetails, AccordionSummary, Box, Chip, List, Typography} from "@mui/material"
import {Project, TaskState} from "api/sdk"
import {AddTaskButton} from "components/AddTaskButton"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import React, {FC, useContext, useEffect, useMemo, useState} from "react"
import {AuthContext, TimerContext} from "utils/context"
import {booleanCompare, compareTasksByState} from "utils/helpers"
import {AnnotatedTask, useAnnotatedEndpoints} from "utils/useAnnotatedEndpoints"
import {TaskListItem} from "./TaskListItem"

export const ProjectsTasks: FC<{ onlyMine: boolean }> = ({onlyMine}) => {
    const {session, currentOrganization, currentUser} = useContext(AuthContext)
    const {timers} = useContext(TimerContext)
    const {annotatedTaskEndpoint} = useAnnotatedEndpoints()

    const [projects, setProjects] = useState<Project[] | null>()
    const [annotatedTasks, setAnnotatedTasks] = useState<AnnotatedTask[] | null>()
    const [initialSorting, setInitialSorting] = useState<string[]>()

    const refreshDashboardData = async () => {
        session.project
            .query({condition: {organization: {Equal: currentOrganization._id}}})
            .then(setProjects)
            .catch(() => setProjects(null))

        let stateCondition: Condition<AnnotatedTask>
        if (currentUser.defaultFilters.states.length === 0) {
            stateCondition = {
                state: {Equal: TaskState.Active}
            }
        } else {
            stateCondition = {
                state: {Inside: currentUser.defaultFilters.states}
            }
        }

        if (currentUser.defaultFilters.projects.length === 0) {

            await annotatedTaskEndpoint
                .query({
                    condition: {
                        And: [
                            {organization: {Equal: currentOrganization._id}},
                            {user: {Equal: currentUser._id}},
                            stateCondition,
                        ]
                    }
                })
                .then(setAnnotatedTasks)
                .catch(() => setAnnotatedTasks(null))

        } else {

            const conditions: Condition<AnnotatedTask>[] = [
                {organization: {Equal: currentOrganization._id}},
                stateCondition,
            ]

            await annotatedTaskEndpoint
                .query({
                    condition: {
                        Or: [
                            {
                                And: [
                                    ...conditions,
                                    {project: {Inside: currentUser.defaultFilters.projects}}
                                ]
                            },
                            {
                                And: [
                                    {user: {Equal: currentUser._id}},
                                    stateCondition
                                ]
                            }
                        ]
                    }
                })
                .then(setAnnotatedTasks)
                .catch(() => setAnnotatedTasks(null))

        }

    }

    useEffect(() => {
        refreshDashboardData()
    }, [Object.values(timers).length])

    const tasksByProject = useMemo(() => {
        if (!annotatedTasks || !projects) return {}

        const tasksByProject: Record<
            string,
            { projectTasks: AnnotatedTask[]; myTasksCount: number }
        > = {}

        projects.forEach((project) => {
            const projectTasks = annotatedTasks.filter(
                (task) =>
                    task.project === project._id &&
                    (!onlyMine || task.user === currentUser._id)
            )

            const myTasksCount = projectTasks.filter(
                (task) => task.user === currentUser._id
            ).length

            tasksByProject[project._id] = {projectTasks, myTasksCount}
        })

        return tasksByProject
    }, [annotatedTasks, projects, onlyMine])

    useEffect(() => {
        if (!annotatedTasks || !projects || initialSorting) return

        setInitialSorting(
            Object.entries(tasksByProject)
                .sort((a, b) => a[1].myTasksCount - b[1].myTasksCount)
                .map(([projectName]) => projectName)
        )
    }, [tasksByProject])

    if (
        projects === undefined ||
        annotatedTasks === undefined ||
        !initialSorting
    ) {
        return <Loading/>
    }

    if (projects === null || annotatedTasks === null) {
        return <ErrorAlert>Error loading tasks</ErrorAlert>
    }

    return (
        <Box>
            {Object.entries(tasksByProject)
                .filter(([_, {projectTasks}]) => projectTasks.length > 0)
                .sort(
                    (a, b) => initialSorting.indexOf(b[0]) - initialSorting.indexOf(a[0])
                )
                .map(([projectId, {projectTasks, myTasksCount}]) => {
                    const project = projects.find((p) => p._id === projectId)

                    return (
                        <Accordion key={projectId} defaultExpanded={myTasksCount > 0}>
                            <AccordionSummary expandIcon={<ExpandMore/>}>
                                <Chip
                                    label={myTasksCount}
                                    size="small"
                                    color="primary"
                                    sx={{mr: 2, visibility: myTasksCount ? "visible" : "hidden"}}
                                />
                                <Typography variant="h2">{project?.name}</Typography>
                                <AddTaskButton
                                    project={project}
                                    afterSubmit={(newAnnotatedTask) =>
                                        setAnnotatedTasks([
                                            ...(annotatedTasks ?? []),
                                            newAnnotatedTask
                                        ])
                                    }
                                    sx={{ml: "auto", mr: 2}}
                                />
                            </AccordionSummary>
                            <AccordionDetails sx={{p: 0}}>
                                <List>
                                    {projectTasks
                                        // Sort by emergency, state, then by is current user
                                        .sort((a, b) => {
                                            return (
                                                booleanCompare(a, b, (t) => t.emergency) ||
                                                compareTasksByState(a, b) ||
                                                booleanCompare(a, b, (t) => t.user === currentUser._id)
                                            )
                                        })
                                        .map((task) => (
                                            <TaskListItem
                                                annotatedTask={task}
                                                refreshDashboard={refreshDashboardData}
                                                key={task._id}
                                            />
                                        ))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    )
                })}
        </Box>
    )
}
