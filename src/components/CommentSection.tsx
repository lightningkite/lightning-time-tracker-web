import {SessionRestEndpoint} from "@lightningkite/lightning-server-simplified"
import {Send} from "@mui/icons-material"
import {
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography
} from "@mui/material"
import {Comment, Task} from "api/sdk"
import dayjs, {extend} from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {dateFromISO} from "utils/helpers"
import Loading from "./Loading"

extend(relativeTime)

export interface CommentSectionProps {
  task: Task
}

export const CommentSection: FC<CommentSectionProps> = (props) => {
  const {task} = props
  const {session, currentUser} = useContext(AuthContext)

  const [comments, setComments] = useState<Comment[] | null>()
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    session.comment
      .query({
        condition: {task: {Equal: task._id}},
        orderBy: ["-createdAt"]
      })
      .then(setComments)
      .catch(() => setComments(null))
      .finally(() => setIsSubmitting(false))
  }, [])

  function handleAddComment() {
    if (!newComment) return
    setIsSubmitting(true)

    session.comment
      .insert({
        _id: crypto.randomUUID(),
        user: currentUser._id,
        userName: "",
        task: task._id,
        taskSummary: "",
        project: task.project,
        projectName: "",
        organization: task.organization,
        organizationName: "",
        createdAt: new Date().toISOString(),
        content: newComment
      })
      .then((insertedComment) => {
        setNewComment("")
        setComments((comments) => [insertedComment, ...(comments ?? [])])
      })
      .catch((e) => alert("Error adding comment"))
      .finally(() => setIsSubmitting(false))
  }

  if (!comments) return <Loading />

  return (
    <>
      <form
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          marginBottom: 16
        }}
        onSubmit={(e) => {
          e.preventDefault()
          handleAddComment()
        }}
      >
        <TextField
          variant="outlined"
          multiline
          fullWidth
          label="Add a comment"
          value={isSubmitting ? "" : newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isSubmitting}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={!newComment || isSubmitting}
          sx={{mt: 1}}
        >
          <Send />
        </IconButton>
      </form>

      <List disablePadding>
        {isSubmitting && (
          <>
            <ListItem disableGutters>
              <ListItemText
                primary={`You - sending...`}
                secondary={newComment}
              />
            </ListItem>
            <Divider />
          </>
        )}
        {comments.map((comment, index) => {
          const displayTime = dayjs(comment.createdAt).fromNow()
          const displayName =
            comment.user === currentUser._id
              ? "You"
              : comment.userName ?? "Unknown User"

          return (
            <>
              <ListItem key={comment._id} disableGutters>
                <ListItemText
                  primary={`${displayName} - ${displayTime}`}
                  secondary={comment.content}
                  primaryTypographyProps={{
                    variant: "body2",
                    color: "textSecondary"
                  }}
                  secondaryTypographyProps={{variant: "body1", color: "text"}}
                />
              </ListItem>
              {index + 1 < comments.length && <Divider />}
            </>
          )
        })}
      </List>

      {comments.length === 0 && !isSubmitting && (
        <Typography variant="body2" fontStyle="italic">
          No comments
        </Typography>
      )}
    </>
  )
}
