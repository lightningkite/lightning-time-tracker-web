import {randUuid} from "@ngneat/falso"
import {type Project} from "api/sdk"
import {AddTagButton} from "components/AddTagButton"
import TagTable from "components/Tags/TagTable"
import {useState, type FC} from "react"

export interface TagTabProps {
  project: Project
}

export interface Tag {
  id: string
  name: string
}

export const TagTab: FC<TagTabProps> = ({project}) => {
  const [mappedProjectTags, setProjectTags] = useState<Tag[]>(
    project.projectTags.map((tag) => ({
      id: randUuid(),
      name: tag
    }))
  )

  return (
    <>
      <div style={{textAlign: "right"}}>
        <AddTagButton
          project={project}
          sx={{mb: 1}}
          tags={mappedProjectTags}
          setTags={setProjectTags}
        />
      </div>
      <TagTable
        project={project}
        tags={mappedProjectTags}
        setTags={setProjectTags}
      />
    </>
  )
}
export default TagTab
