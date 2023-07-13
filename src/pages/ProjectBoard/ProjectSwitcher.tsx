import {Autocomplete, TextField} from "@mui/material"
import type {Project} from "api/sdk"
import type {FC} from "react";
import React, { useContext} from "react"
import {AuthContext} from "utils/context"

export interface ProjectSwitcherProps {
  projects: Project[]
  selected: Project
  onSelect: (project: Project) => void
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
      onChange={(_, newValue) => onSelect(newValue)}
      value={selected}
      sx={{width: 300, mt: 1, mb: 2, mx: 2}}
      renderInput={(params) => <TextField {...params} />}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      groupBy={(option) =>
        isMyProject(option) ? "My Projects" : "Other Projects"
      }
    />
  )
}
