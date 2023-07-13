import {Delete} from "@mui/icons-material"
import {
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText
} from "@mui/material"
import {Box} from "@mui/system"
import type {Comment} from "api/sdk"
import dayjs, {extend} from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import type {FC} from "react";
import React, { useContext} from "react"
import {AuthContext} from "utils/context"

extend(relativeTime)

export interface CommentItemProps {
  comment: Comment
  handleDeleteComment: (commentId: string) => void
}

export const CommentItem: FC<CommentItemProps> = (props) => {
  const {comment, handleDeleteComment} = props
  const {currentUser} = useContext(AuthContext)

  const displayTime = dayjs(comment.createdAt).fromNow()
  const displayName =
    comment.user === currentUser._id
      ? "You"
      : comment.userName ?? "Unknown User"

  return (
    <Box
      key={comment._id}
      sx={
        comment.user === currentUser._id
          ? {
              "&:hover .MuiListItemSecondaryAction-root": {
                visibility: "visible"
              }
            }
          : undefined
      }
    >
      <ListItem disableGutters>
        <ListItemText
          primary={`${displayName} - ${displayTime}`}
          secondary={comment.content}
          primaryTypographyProps={{
            variant: "body2",
            color: "textSecondary"
          }}
          secondaryTypographyProps={{
            variant: "body1",
            color: "text",
            whiteSpace: "pre-wrap"
          }}
        />
        <ListItemSecondaryAction
          sx={{
            visibility: "hidden"
          }}
        >
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              handleDeleteComment(comment._id)
            }}
          >
            <Delete />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    </Box>
  )
}
