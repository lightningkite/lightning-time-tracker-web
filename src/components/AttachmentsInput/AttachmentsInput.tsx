import {AttachFile, Delete} from "@mui/icons-material"
import {
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from "@mui/material"
import {Attachment} from "api/sdk"
import React from "react"
import {AttachmentUpload} from "./AttachmentUpload"

export interface AttachmentsInputProps {
  error: string | undefined
  attachments: Attachment[]
  onChange: (value: Attachment[]) => void
}

export function AttachmentsInput(props: AttachmentsInputProps) {
  const {error, attachments, onChange} = props

  return (
    <FormControl error={!!error}>
      <FormLabel>Attachments</FormLabel>

      {attachments.length > 0 && (
        <List>
          {attachments.map(({file, name}) => (
            <ListItem
              key={file}
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() =>
                    onChange(attachments.filter((d) => d.file !== file))
                  }
                >
                  <Delete />
                </IconButton>
              }
            >
              <ListItemButton
                component="a"
                dense
                href={file}
                target="_blank"
                rel="noreferrer"
              >
                <ListItemIcon>
                  <AttachFile />
                </ListItemIcon>

                <ListItemText primary={name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      <AttachmentUpload
        onUpload={(newAttachments) =>
          onChange([...attachments, ...newAttachments] as any)
        }
      />

      {error && <FormHelperText sx={{m: 0}}>{error}</FormHelperText>}
    </FormControl>
  )
}
