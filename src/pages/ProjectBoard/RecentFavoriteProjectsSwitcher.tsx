import {
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
  useMediaQuery
} from "@mui/material"
import {type Project} from "api/sdk"
import {type FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"

export interface RecentFavoriteProjectsSwitcherProps {
  projects: Project[]
  onSelect: (project: Project[]) => void
}

export const RecentFavoriteProjectsSwitcher: FC<
  RecentFavoriteProjectsSwitcherProps
> = ({projects, onSelect}) => {
  const {currentUser, session} = useContext(AuthContext)
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [favoritesProjects, setFavoritesProjects] = useState<Project[]>([])
  const smallScreen = useMediaQuery("(max-width: 400px)")

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

  if (smallScreen) return null

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
        justifyContent="flex-start"
        alignItems="center"
        sx={{ml: 2}}
      >
        <Typography>{title}:</Typography>
        {projects.map((project) => (
          <Card key={project._id}>
            <CardActionArea onClick={() => onSelect([project])}>
              <CardContent sx={{width: "100%", maxWidth: "150px"}}>
                <Typography
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {project.name}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    )
  })
}
