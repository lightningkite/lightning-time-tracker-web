import {Autocomplete, type SxProps, TextField} from "@mui/material"
import type {Project} from "api/sdk"
import type {FC} from "react"
import React, {useContext} from "react"
import {AuthContext} from "utils/context"

export interface ProjectSwitcherProps {
  projects: Project[]
  selected: Project[]
  onSelect: (projects: Project[]) => void
  sx?: SxProps
}

export const ProjectSwitcher: FC<ProjectSwitcherProps> = (props) => {
  const {projects, selected, onSelect} = props
  const {currentUser} = useContext(AuthContext)

  function isMyProject(project: Project) {
    return [
      ...currentUser.projectFavorites,
      ...(currentUser.limitToProjects ?? [])
    ].includes(project._id)
  }

  return (
    <Autocomplete
      disableClearable
      options={projects.sort((a, _) => (isMyProject(a) ? -1 : 1))}
      onChange={(_, newValue) => onSelect([newValue])}
      value={selected[0]}
      sx={{width: 300, minWidth: 200, mt: 1, mb: 2, ml: 2}}
      renderInput={(params) => <TextField {...params} />}
      getOptionLabel={(options) => options.name}
      isOptionEqualToValue={(options, value) => options._id === value._id}
      groupBy={(options) =>
        isMyProject(options) ? "My Projects" : "Other Projects"
      }
    />
  )
}
1
