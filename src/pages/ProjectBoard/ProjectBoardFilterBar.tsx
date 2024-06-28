import type {Condition} from "@lightningkite/lightning-server-simplified"
import type {FilterOption} from "@lightningkite/mui-lightning-components"
import {FilterBar} from "@lightningkite/mui-lightning-components"
import {Skeleton} from "@mui/material"
import type {Project, Task, User} from "api/sdk"
import {usePermissions} from "hooks/usePermissions"
import {
  type Dispatch,
  type FC,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react"
import {AuthContext} from "utils/context"

export interface ProjectBoardFilterBarValues {
  tags: string[] | null
  users: User[] | null
  projects: Project[] | null
}

enum FilterNames {
  TAGS = "Tags",
  USERS = "Users",
  PROJECTS = "Projects"
}

export const ProjectBoardFilterBar: FC<{
  setProjectBoardFilterValues: Dispatch<
    SetStateAction<ProjectBoardFilterBarValues | undefined>
  >
  selectedProjects: Project[]
}> = ({setProjectBoardFilterValues, selectedProjects}) => {
  const {session, currentUser} = useContext(AuthContext)
  const permissions = usePermissions()

  const [users, setUsers] = useState<User[]>()
  const [projects, setProjects] = useState<Project[]>(selectedProjects)
  const [tags, setTags] = useState<string[]>()

  useEffect(() => {
    session.user
      .query({condition: {organization: {Equal: currentUser.organization}}})
      .then(setUsers)
      .catch(console.error)
    session.project
      .query({condition: {organization: {Equal: currentUser.organization}}})
      .then(setProjects)
      .catch(console.error)
    session.project
      .query({
        condition: {
          And: [
            {_id: {Inside: selectedProjects.map((p) => p._id)}},
            {organization: {Equal: currentUser.organization}}
          ]
        }
      })
      .then((projects) => setTags(projects.flatMap((p) => p.projectTags)))
  }, [selectedProjects])

  const filterOptions = useMemo(() => {
    if (!users || !projects) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: FilterOption<any>[] =
      tags?.length !== 0 && tags !== undefined
        ? [
            {
              type: "multiSelect",
              name: FilterNames.TAGS,
              placeholder: "Tags",
              options: tags!.sort((a, b) => a.localeCompare(b)),
              optionToID: (t) => t,
              optionToLabel: (t) => t
            },
            {
              type: "multiSelect",
              name: FilterNames.USERS,
              placeholder: "Users",
              options: users.sort((a, b) => a.name.localeCompare(b.name)),
              optionToID: (u) => u._id,
              optionToLabel: (u) => u.name
            },
            {
              type: "multiSelect",
              name: FilterNames.PROJECTS,
              placeholder: "Projects",
              options: projects.sort((a, b) => a.name.localeCompare(b.name)),
              optionToID: (p) => p._id,
              optionToLabel: (p) => p.name
            }
          ]
        : [
            {
              type: "multiSelect",
              name: FilterNames.USERS,
              placeholder: "Users",
              options: users.sort((a, b) => a.name.localeCompare(b.name)),
              optionToID: (u) => u._id,
              optionToLabel: (u) => u.name
            },
            {
              type: "multiSelect",
              name: FilterNames.PROJECTS,
              placeholder: "Projects",
              options: projects.sort((a, b) => a.name.localeCompare(b.name)),
              optionToID: (p) => p._id,
              optionToLabel: (p) => p.name
            }
          ]

    return options.filter(
      (o) => permissions.canViewIndividualUsers || o.name !== FilterNames.USERS
    )
  }, [users, projects, selectedProjects, tags])

  if (!users || !projects) return <Skeleton height={70} />

  return (
    <>
      <FilterBar
        sx={{m: 2}}
        filterOptions={filterOptions}
        onActiveFiltersChange={(activeFilters) => {
          const users: User[] | undefined = activeFilters.find(
            (filter) => filter.filterOption.name === FilterNames.USERS
          )?.value

          const projects: Project[] | undefined = activeFilters.find(
            (filter) => filter.filterOption.name === FilterNames.PROJECTS
          )?.value

          const tags: string[] | undefined = activeFilters.find(
            (filter) => filter.filterOption.name === FilterNames.TAGS
          )?.value

          setProjectBoardFilterValues({
            tags: tags ?? null,
            users: users ?? null,
            projects: projects ?? null
          })
        }}
      />
    </>
  )
}

export function filtersToTaskProjectCondition(
  pfilters: ProjectBoardFilterBarValues
): Condition<Task> {
  const {projects} = pfilters

  return {project: {Inside: projects!.map((p) => p._id)}}
}

export function filtersToTaskUserCondition(
  ufilters: ProjectBoardFilterBarValues
): Condition<Task> {
  const {users} = ufilters

  return users ? {userName: {Inside: users.map((u) => u.name)}} : {Always: true}
}

export function filtersToTaskTagsCondition(
  tfilters: ProjectBoardFilterBarValues
): Condition<Task> {
  const {tags} = tfilters

  return tags
    ? {tags: {SetAnyElements: {Inside: tags.map((t) => t)}}}
    : {Always: true}
}
