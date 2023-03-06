import {Autocomplete, TextField} from "@mui/material"
import {Project} from "api/sdk"
import React, {FC, useContext} from "react"
import {AuthContext} from "utils/context"

export interface ProjectSwitcherProps {
  projects: Project[]
  selected: Project
  onSelect: (project: Project) => void
}

export const ProjectSwitcher: FC<ProjectSwitcherProps> = (props) => {
  const {projects, selected, onSelect} = props
  const {currentUser} = useContext(AuthContext)

  return (
    <Autocomplete
      disableClearable
      options={projects.sort((a, _) =>
        currentUser.defaultFilters.projects.includes(a._id) ? -1 : 1
      )}
      onChange={(_, newValue) => onSelect(newValue)}
      value={selected}
      sx={{width: 300, mt: 1, mb: 2, mx: 2}}
      renderInput={(params) => <TextField {...params} />}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      groupBy={(option) =>
        currentUser.defaultFilters.projects.includes(option._id)
          ? "My Projects"
          : "Other Projects"
      }
    />
  )
}
