import {randUuid} from "@ngneat/falso"
import {type Project} from "api/sdk"
import {AddTagButton} from "components/AddTagButton"
import TagTable from "components/Tags/TagTable"
import {useState, type FC, useEffect} from "react"

export interface TagTabProps {
  project: Project
  refreshProject: () => void
}

export interface Tag {
  id: string
  name: string
}

export const TagTab: FC<TagTabProps> = ({project, refreshProject}) => {
  const [mappedProjectTags, setProjectTags] = useState<Tag[]>([])

  useEffect(() => {
    setProjectTags(
      project.projectTags.map((tag) => ({
        id: randUuid(),
        name: tag
      }))
    )
  }, [project])

  return (
    <>
      <div style={{textAlign: "right"}}>
        <AddTagButton
          project={project}
          sx={{mb: 1}}
          updateTable={refreshProject}
        />
      </div>
      <TagTable
        project={project}
        tags={mappedProjectTags}
        updateTable={refreshProject}
      />
    </>
  )
}
export default TagTab
