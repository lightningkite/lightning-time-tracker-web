import {Typography} from "@mui/material"
import {Attachment} from "api/sdk"
import React, {FC, useContext, useState} from "react"
import {uploadToS3} from "utils/helpers"
import {AuthContext} from "../../utils/context"

export interface AttachmentUploadProps {
  onUpload: (attachments: Attachment[]) => void
}

export const AttachmentUpload: FC<AttachmentUploadProps> = (props) => {
  const {onUpload} = props
  const {session} = useContext(AuthContext)

  const [isUploading, setIsUploading] = useState(false)

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const {files} = event.target

    if (!files || files.length === 0) {
      return
    }

    const filesArray = Array.from(files)
    const fileNames = filesArray.map((file) => file.name)
    setIsUploading(true)

    try {
      const uploadInformationArray = await Promise.all(
        filesArray.map(() => session.uploadFileForRequest())
      )

      await Promise.all(
        uploadInformationArray.map(({uploadUrl}, index) =>
          uploadToS3(uploadUrl, files[index])
        )
      )

      onUpload(
        uploadInformationArray.map(({futureCallToken}, index) => ({
          name: fileNames[index],
          file: futureCallToken
        }))
      )
    } catch (e) {
      console.error("Error uploading file", e)
      alert("Error uploading file")
    } finally {
      setIsUploading(false)
    }
  }

  if (isUploading) {
    return <Typography>Uploading...</Typography>
  }

  return (
    <input
      type="file"
      multiple
      onChange={(e) => {
        handleChange(e)
      }}
      style={{marginBlock: 4}}
    />
  )
}
