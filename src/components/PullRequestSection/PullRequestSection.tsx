import {type FC, useState} from "react"
import {Add, Delete} from "@mui/icons-material"
import {Button, IconButton, Stack, TextField, Typography} from "@mui/material"

export const PullRequestSection: FC<{
  urls?: string[]
  setUrls: (url: string[]) => void
  edit: boolean
}> = ({urls, setUrls, edit}) => {
  // const [prLinks, setPrLinks] = useState<string[]>(url ?? [])

  return (
    <>
      <Stack direction="column">
        {urls?.map((pr, index) => (
          <>
            {edit ? (
              <Stack
                sx={{
                  "&:hover .MuiIconButton-root": {
                    visibility: "visible"
                  }
                }}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                key={index}
              >
                <TextField
                  label="Add Pull Request"
                  value={pr}
                  sx={{mb: 3}}
                  fullWidth
                  onChange={({target}) =>
                    setUrls(
                      urls.map((value, i) =>
                        i === index ? target.value : value
                      )
                    )
                  }
                />

                <IconButton
                  color="error"
                  onClick={() => setUrls(urls.filter((_, i) => i !== index))}
                  size="small"
                  sx={{
                    visibility: "hidden"
                  }}
                >
                  <Delete />
                </IconButton>
              </Stack>
            ) : (
              <Stack>
                <Typography
                  onClick={() => window.open(`${pr}`, "_blank")}
                  sx={{
                    "&:hover": {textDecoration: "underline"},
                    cursor: "pointer",
                    width: "fit-content"
                  }}
                >
                  {pr}
                </Typography>
              </Stack>
            )}
          </>
        ))}
        {edit && (
          <Button
            startIcon={<Add />}
            size="large"
            onClick={() => setUrls([...(urls ?? []), ""])}
          >
            Add Another PR
          </Button>
        )}
      </Stack>
    </>
  )
}
