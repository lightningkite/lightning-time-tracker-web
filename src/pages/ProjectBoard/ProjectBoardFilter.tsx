import {Autocomplete, Hidden, IconButton, Stack, TextField} from "@mui/material"
import {useState, type FC} from "react"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff"
import {HoverHelp} from "@lightningkite/mui-lightning-components"

interface ProjectBoardFilterProps {
  smallScreen: boolean
  tags: string[]
  filterTags: string[]
  setFilterTags: (tags: string[]) => void
  user: string[]
  selectedUser: string[]
  setSelectedUser: (selectedUser: string[]) => void
}

export const ProjectBoardFilter: FC<ProjectBoardFilterProps> = ({
  tags,
  filterTags,
  setFilterTags,
  user,
  selectedUser,
  setSelectedUser
}) => {
  const [showFilter, setShowFilter] = useState<boolean>(false)

  const onClose = () => {
    setFilterTags([])
    setShowFilter(false)
  }

  return (
    <Stack direction={"row"} alignItems={"center"}>
      {showFilter && (
        <>
          <Autocomplete
            renderInput={(params) => <TextField {...params} label={"Tags"} />}
            options={tags ?? []}
            multiple
            onChange={(_, e) => setFilterTags(e)}
            value={filterTags}
            sx={{
              width: "100%",
              minWidth: 250,
              mr: 2
            }}
          />
          <Autocomplete
            renderInput={(params) => <TextField {...params} label={"Users"} />}
            options={user ?? []}
            multiple
            onChange={(_, e) => setSelectedUser(e)}
            value={selectedUser}
            sx={{
              width: "100%",
              minWidth: 250,
              mr: 2
            }}
          />
        </>
      )}

      <HoverHelp description="Filter by tag" enableWrapper>
        <IconButton
          onClick={() => (showFilter ? onClose() : setShowFilter(true))}
        >
          {showFilter ? <FilterAltOffIcon /> : <FilterAltIcon />}
        </IconButton>
      </HoverHelp>
    </Stack>
  )
}
