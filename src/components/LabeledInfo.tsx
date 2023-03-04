import {ListItem, ListItemButton, ListItemText} from "@mui/material"
import React, {FC, PropsWithChildren, ReactElement} from "react"

export interface LabeledInfoProps {
  label: string
  onClick?: () => void
}

export const LabeledInfo: FC<PropsWithChildren<LabeledInfoProps>> = (props) => {
  const {label, onClick, children} = props

  return (
    <LabeledInfoWrapper onClick={onClick}>
      <ListItemText
        primary={label}
        secondary={children}
        primaryTypographyProps={{fontWeight: 700, fontSize: 12, color: "#888"}}
        secondaryTypographyProps={{fontSize: 16, color: "text.primary"}}
      />
    </LabeledInfoWrapper>
  )
}

export const NotProvidedValue: FC = () => <i>Not provided</i>

function LabeledInfoWrapper(
  props: PropsWithChildren<{onClick?: () => void}>
): ReactElement {
  return props.onClick ? (
    <ListItemButton onClick={props.onClick} disableGutters>
      {props.children}
    </ListItemButton>
  ) : (
    <ListItem disablePadding>{props.children}</ListItem>
  )
}
