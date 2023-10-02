import {
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography
} from "@mui/material"
import {type Project} from "api/sdk"
import {type FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"

export interface RecentFavoriteProjectsSwitcherProps {
  projects: Project[]
  onSelect: (project: Project) => void
}

export const RecentFavoriteProjectsSwitcher: FC<
  RecentFavoriteProjectsSwitcherProps
> = (props) => {
  const {projects, onSelect} = props
  const {currentUser, session} = useContext(AuthContext)
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [favoritesProjects, setFavoritesProjects] = useState<Project[]>([])

  const fetchRecentProjects = () => {
    session.task
      .query({
        condition: {
          And: [{user: {Equal: currentUser._id}}]
        },
        limit: 100,
        orderBy: ["-createdAt"]
      })
      .then((tasks) => {
        const projectNames = tasks.map((task) => task.projectName)
        const uniqueProjectNames = [...new Set(projectNames)]

        const recentProjects = projects
          .filter((project) => uniqueProjectNames.includes(project.name))
          .splice(0, 3)

        if (recentProjects.length > 0) {
          onSelect(projects[0])
        }

        setRecentProjects(recentProjects)
      })
  }

  const fetchFavoriteProjects = () => {
    const favorites = projects
      .filter((project) => currentUser.projectFavorites.includes(project._id))
      .splice(0, 3)

    setFavoritesProjects(favorites)
  }

  useEffect(() => {
    fetchRecentProjects()
    fetchFavoriteProjects()
  }, [projects])

  return [
    {projects: recentProjects, title: "Recent"},
    {projects: favoritesProjects, title: "Favorites"}
  ].map(({projects, title}) => {
    if (recentProjects.length === 0) return null
    return (
      <Stack
        key={title}
        direction="row"
        spacing={1}
        mr="2rem"
        justifyContent="flex-start"
        alignItems="center"
      >
        <Typography>{title}:</Typography>
        {projects.map((project) => (
          <Card key={project._id}>
            <CardActionArea onClick={() => onSelect(project)}>
              <CardContent sx={{width: "100%"}}>
                <Typography>{project.name}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    )
  })
}
