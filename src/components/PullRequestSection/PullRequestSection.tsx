import {type FC, useState} from "react"
import {Add, Delete} from "@mui/icons-material"
import {Button, IconButton, Stack, TextField} from "@mui/material"

export const PullRequestSection: FC<{
  url?: string[]
  setUrl: (url: string[]) => void
  edit: boolean
}> = ({url, setUrl, edit}) => {
  const [prLinks, setPrLinks] = useState<string[]>(url ?? [])
  const [prField, setPrField] = useState("")

  return (
    <>
      <Stack direction="column">
        {edit && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <TextField
              label="Add Pull Request"
              value={prField}
              sx={{mb: 3}}
              fullWidth
              onChange={(e) => setPrField(e.target.value)}
            />
          </Stack>
        )}
        {prLinks?.map((pr) => (
          <Stack
            sx={{
              "&:hover .MuiIconButton-root": {
                visibility: "visible"
              }
            }}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            key={pr}
          >
            <TextField
              label="Add Pull Request"
              value={pr}
              sx={{mb: 3}}
              fullWidth
              onChange={(e) => setPrLinks((prev) => [...prev, e.target.value])}
            />

            <IconButton
              color="error"
              onClick={() => {
                setPrLinks((prev) => prev.filter((v) => v !== pr))
              }}
              size="small"
              sx={{
                visibility: "hidden"
              }}
            >
              <Delete />
            </IconButton>
          </Stack>
        ))}
        <Button
          startIcon={<Add />}
          disabled={prField === ""}
          size="large"
          onClick={() => {
            setPrLinks((prev) => [...prev, prField])
            setPrField("")
            setUrl(prLinks)
          }}
        >
          Add Another PR
        </Button>
      </Stack>
    </>
  )
}
