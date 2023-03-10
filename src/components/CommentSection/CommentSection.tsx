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
import Loading from "components/Loading"
import {usePermissions} from "hooks/usePermissions"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {CommentItem} from "./CommentItem"

export interface CommentSectionProps {
  task: Task
}

export const CommentSection: FC<CommentSectionProps> = (props) => {
  const {task} = props
  const {session, currentUser} = useContext(AuthContext)
  const permissions = usePermissions()

  const [comments, setComments] = useState<Comment[] | null>()
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    session.comment
      .query({
        condition: {
          And: [
            {task: {Equal: task._id}},
            {organization: {Equal: currentUser.organization}}
          ]
        },
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

  function handleDeleteComment(commentId: string) {
    if (!comments) return
    const prevComments = [...comments]
    setComments((comments) => comments?.filter((c) => c._id !== commentId))
    session.comment.delete(commentId).catch(() => {
      alert("Error deleting comment")
      setComments(prevComments)
    })
  }

  if (!comments) return <Loading />

  return (
    <>
      {permissions.comments && (
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
      )}

      <List disablePadding>
        {isSubmitting && (
          <>
            <ListItem disableGutters>
              <ListItemText
                primary={`You - sending...`}
                secondary={newComment}
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
            </ListItem>
            <Divider />
          </>
        )}
        {comments.map((comment) => {
          return (
            <CommentItem
              comment={comment}
              handleDeleteComment={handleDeleteComment}
              key={comment._id}
            />
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
