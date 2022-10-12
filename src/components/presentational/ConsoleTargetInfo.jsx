import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

// Planet Selection Dialog
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import { blue } from "@mui/material/colors";

// Icons
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PublicIcon from "@mui/icons-material/Public";
import DarkModeIcon from "@mui/icons-material/DarkMode";

/**
 * Controls css styling for this component using js to css
 */
let css = {
  grid: {
    width: "100%",
    maxHeight: 45,
  },
  title: {
    color: "#343a40",
    fontWeight: 900,
    fontSize: 42,
    letterSpacing: "0rem",
    paddingLeft: "10px",
    paddingRight: "10px",
    cursor: "pointer",
    "&:hover": {
      background: "#efefef",
      textDecoration: "underline",
    },
  },
};

const planets = [
  ["Mercury"],
  ["Venus"],
  ["Earth"],
  ["Mars"],
  ["Jupiter"],
  ["Saturn"],
  ["Uranus"],
  ["Neptune"],
  ["Pluto"],
];
const moons = [
  "Moon",
  "Ceres",
  "Mimas",
  "Titan",
  "Deimos",
  "Tethys",
  "Phoebe",
  "Iapetus",
  "Dione",
  "Enceladus",
  "Hyperion",
  "Io",
  "Callisto",
  "Europa",
  "Ganymede",
  "Rhea",
  "Phobos",
  "Vesta",
  "Charon",
];

/**
 * Dialog for selecting planets
 * @param {open, onClose, selectedValue} props
 * @returns Planet Selection Dialog
 */
function PlanetDialog(props) {
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Select Target Body</DialogTitle>
      <List sx={{ pt: 0 }}>
        <ListSubheader value="Mars">Planets</ListSubheader>
        {planets.map((planet) => (
          <ListItem
            button
            onClick={() => handleListItemClick(planet[0])}
            key={planet[0]}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: blue[100] }}>
                <PublicIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={planet[0]} />
          </ListItem>
        ))}
        <ListSubheader value="Moon">Moons and Other Bodies</ListSubheader>
        {moons.map((moon) => (
          <ListItem button onClick={() => handleListItemClick(moon)} key={moon}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: blue[100] }}>
                <DarkModeIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={moon} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}

PlanetDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};

/**
 * Component that displays target body name in console.
 * Retrieves target name from target selector
 *
 * @component
 * @example
 * const target = Mars
 * return (
 *   <ConsoleTargetInfo target={target}/>
 * )
 */
export default function ConsoleTargetInfo(props) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(planets[3][0]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
    setSelectedValue(value);
    props.bodyChange(value);
  };

  return (
    <Grid
      container
      item
      justifyContent="center"
      alignItems="center"
      sx={css.grid}
      xs
    >
      <Grid item>
        <Typography
          id="targetName"
          sx={css.title}
          variant="h4"
          onClick={handleClickOpen}
        >
          {props.target.toUpperCase()} <ArrowDropDownIcon fontSize="large" />
        </Typography>
      </Grid>
      <PlanetDialog
        selectedValue={selectedValue}
        open={open}
        onClose={handleClose}
      />
    </Grid>
  );
}
