import {type Project} from "api/sdk"
import {AddTagButton} from "components/AddTagButton"
import TagTable from "components/Tags/TagTable"
import {type FC} from "react"

export interface TagTabProps {
  project: Project
}

export const TagTab: FC<TagTabProps> = ({project}) => {
  return (
    <>
      <div style={{textAlign: "right"}}>
        <AddTagButton project={project} sx={{mb: 1}} />
      </div>
      <TagTable project={project} />
    </>
  )
}
export default TagTab
