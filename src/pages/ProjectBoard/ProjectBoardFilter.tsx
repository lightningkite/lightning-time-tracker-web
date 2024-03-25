import {Autocomplete, IconButton, Stack, TextField} from "@mui/material"
import {useState, type FC, useContext} from "react"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff"
import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {usePermissions} from "hooks/usePermissions"
import type {Project} from "api/sdk"
import {AuthContext} from "utils/context"

interface ProjectBoardFilterProps {
  smallScreen: boolean
  tags: string[]
  filterTags: string[]
  setFilterTags: (tags: string[]) => void
  user: string[]
  selectedUser: string[]
  setSelectedUser: (selectedUser: string[]) => void
  projects: Project[]
  selectedProjects: Project[]
  setSelectedProjects: (projects: Project[]) => void
}

export const ProjectBoardFilter: FC<ProjectBoardFilterProps> = ({
  tags,
  filterTags,
  setFilterTags,
  user,
  selectedUser,
  setSelectedUser,
  projects,
  selectedProjects,
  setSelectedProjects
}) => {
  const [showFilter, setShowFilter] = useState<boolean>(false)
  const {currentUser} = useContext(AuthContext)

  const permissions = usePermissions()

  const onClose = () => {
    setFilterTags([])
    setShowFilter(false)
    setSelectedProjects([])
  }

  function isMyProject(project: Project) {
    return [
      ...currentUser.projectFavorites,
      ...(currentUser.limitToProjects ?? [])
    ].includes(project._id)
  }

  return (
    <Stack direction={"row"} alignItems={"center"}>
      <HoverHelp description="Filter by tag" enableWrapper>
        <IconButton
          onClick={() => (showFilter ? onClose() : setShowFilter(true))}
        >
          {showFilter ? <FilterAltOffIcon /> : <FilterAltIcon />}
        </IconButton>
      </HoverHelp>
      {showFilter && (
        <>
          <Autocomplete
            renderInput={(params) => (
              <TextField {...params} label={"Other Projects"} />
            )}
            options={projects.sort((a, _) => (isMyProject(a) ? -1 : 1))}
            getOptionLabel={(p) => p.name}
            multiple
            onChange={(_, e) => setSelectedProjects(e)}
            value={selectedProjects}
            sx={{
              width: "100%",
              minWidth: 250,
              ml: 2
            }}
            groupBy={(options) =>
              isMyProject(options) ? "My Projects" : "Other Projects"
            }
          />
          <Autocomplete
            renderInput={(params) => <TextField {...params} label={"Tags"} />}
            options={tags ?? []}
            multiple
            onChange={(_, e) => setFilterTags(e)}
            value={filterTags}
            sx={{
              width: "100%",
              minWidth: 250,
              mr: 2,
              ml: 2
            }}
          />
          {permissions.canViewIndividualUsers && (
            <Autocomplete
              renderInput={(params) => (
                <TextField {...params} label={"Users"} />
              )}
              options={user ?? []}
              multiple
              onChange={(_, e) => setSelectedUser(e)}
              value={selectedUser}
              sx={{
                width: "100%",
                minWidth: 250
              }}
            />
          )}
        </>
      )}
    </Stack>
  )
}
