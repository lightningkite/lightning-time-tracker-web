import {Autocomplete, IconButton, Stack, TextField} from "@mui/material"
import {useState, type FC, useContext} from "react"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff"
import {
  HoverHelp,
  RestAutocompleteInput
} from "@lightningkite/mui-lightning-components"
import {AuthContext} from "utils/context"
import {User} from "api/sdk"

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
  smallScreen,
  tags,
  filterTags,
  setFilterTags,
  user,
  selectedUser,
  setSelectedUser
}) => {
  const {session, activeUsers} = useContext(AuthContext)

  const [showFilter, setShowFilter] = useState<boolean>(false)

  const onClose = () => {
    setFilterTags([])
    setShowFilter(false)
  }

  return (
    <Stack
      direction={smallScreen ? "column-reverse" : "row"}
      alignItems={"center"}
    >
      {showFilter && (
        <>
          <Autocomplete
            renderInput={(params) => <TextField {...params} label={"Tags"} />}
            options={tags ?? []}
            multiple
            onChange={(_, e) => setFilterTags(e)}
            value={filterTags}
            sx={{minWidth: 300}}
          />
          <Autocomplete
            renderInput={(params) => <TextField {...params} label={"Users"} />}
            options={user ?? []}
            multiple
            onChange={(_, e) => setSelectedUser(e)}
            value={selectedUser}
            sx={{minWidth: 300}}
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
