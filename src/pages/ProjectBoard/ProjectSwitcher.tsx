import {Autocomplete, TextField} from "@mui/material"
import type {Project} from "api/sdk"
import type {FC} from "react"
import React, {useContext} from "react"
import {AuthContext} from "utils/context"

export interface ProjectSwitcherProps {
  projects: Project[]
  selected: Project
  onSelect: (projects: Project[]) => void
  disabled: boolean
}

export const ProjectSwitcher: FC<ProjectSwitcherProps> = (props) => {
  const {projects, selected, onSelect, disabled} = props
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
      onChange={(_, e) => onSelect(Array.isArray(e) ? e : [e])}
      value={selected}
      sx={{width: 300, minWidth: 200, mt: 1, mb: 2, ml: 2}}
      renderInput={(params) => <TextField {...params} />}
      getOptionLabel={(options) => options.name}
      isOptionEqualToValue={(options, value) => options._id === value._id}
      groupBy={(options) =>
        isMyProject(options) ? "My Projects" : "Other Projects"
      }
      disabled={disabled}
    />
  )
}
1
