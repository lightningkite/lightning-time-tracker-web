import { Box, Card, CardActionArea, CardContent, Paper, Stack, Tooltip, Typography } from "@mui/material"
import { Project } from "api/sdk"
import { on } from "events"
import { FC } from "react"
import HistoryIcon from '@mui/icons-material/History';


export interface RecentFavoriteProjectsSwitcherProps {
    recentProjects: Project[]
    favoritesProjects: Project[]
    onSelect: (project: Project) => void
    }

export const RecentFavoriteProjectsSwitcher: FC<RecentFavoriteProjectsSwitcherProps> = (props) => {
    
    return (
        <>
        {props.recentProjects.length != 0 && (
        <Stack direction="row"  spacing={1} justifyContent="flex-start">
            <Box 
            sx={{
                display: "flex",
                alignItems: "center",
            }}>
            <Typography >Recent:</Typography>
            </Box>
            { props.recentProjects.map((project) => (
                            <Box key={project._id}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                            }}>
            <Card  >
                <CardActionArea sx={{height:"100%"}} onClick={()=>{
                props.onSelect(project)
            }} >
                <CardContent sx={{width:"100%"}}>
                  <Typography >{project.name}</Typography>
                </CardContent>
                </CardActionArea>
            </Card>
                     </Box>
            ))}
        </Stack>
        )}
        {props.favoritesProjects.length > 0 &&(
        <Stack direction="row" sx={{ml:4}} spacing={1} justifyContent="flex-end">
            <Box 
            sx={{
                display: "flex",
                alignItems: "center",
            }}>
                <Tooltip title="Shows the first Three Favorites">
            <Typography >Favorites:</Typography>
            </Tooltip>
            </Box>
            { props.favoritesProjects.map((project) => (
                            <Box key={project._id}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                            }}>
            <Card  >
                <CardActionArea sx={{height:"100%"}} onClick={()=>{
                props.onSelect(project)
            }} >
                <CardContent sx={{width:"100%"}}>
                  <Typography >{project.name}</Typography>
                </CardContent>
                </CardActionArea>
            </Card>
                     </Box>
            ))}
        </Stack>
        )}
        </>
           )
}