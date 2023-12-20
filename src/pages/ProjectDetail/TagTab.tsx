import {type Project} from "api/sdk"
import {AddTagButton} from "components/AddTagButton"
import TagTable from "components/Tags/TagTable"
import {useState, type FC, useEffect} from "react"

export interface TagTabProps {
  project: Project
  refreshProject: () => void
}

export const TagTab: FC<TagTabProps> = ({project, refreshProject}) => {
  const [mappedProjectTags, setProjectTags] = useState<string[]>([])

  useEffect(() => {
    setProjectTags(project.projectTags)
  }, [project])

  return (
    <>
      <div style={{textAlign: "right"}}>
        <AddTagButton project={project} updateTable={refreshProject} />
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
