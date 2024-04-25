import {Add, Clear} from "@mui/icons-material"
import {Autocomplete, TextField, IconButton, Stack} from "@mui/material"
import type {Project} from "api/sdk"
import type {FC} from "react"
import React, {useContext, useState} from "react"
import {AuthContext} from "utils/context"

export interface ProjectSwitcherProps {
  projects: Project[]
  selected: Project[]
  onSelect: (projects: Project[]) => void
  // disabled: boolean
}

export const ProjectSwitcher: FC<ProjectSwitcherProps> = (props) => {
  const {projects, selected, onSelect} = props
  const {currentUser} = useContext(AuthContext)
  const [multiple, setMultiple] = useState(false)

  const handleSetMultiple = (newMultiple: boolean) => {
    setMultiple(newMultiple)

    if (!newMultiple) onSelect([selected[0]])
  }

  function isMyProject(project: Project) {
    return [
      ...currentUser.projectFavorites,
      ...(currentUser.limitToProjects ?? [])
    ].includes(project._id)
  }

  return (
    <>
      <Autocomplete
        disableClearable
        options={projects.sort((a, _) => (isMyProject(a) ? -1 : 1))}
        onChange={(_, e) => onSelect(Array.isArray(e) ? e : [e])}
        value={multiple ? selected : selected[0]}
        sx={{width: 300, minWidth: 200, mt: 1, mb: 2, ml: 2}}
        renderInput={(params) => <TextField {...params} />}
        getOptionLabel={(options) => options.name}
        isOptionEqualToValue={(options, value) => options._id === value._id}
        groupBy={(options) =>
          isMyProject(options) ? "My Projects" : "Other Projects"
        }
        multiple={multiple}
        // disabled={disabled}
      />
    </>
  )
}
1
