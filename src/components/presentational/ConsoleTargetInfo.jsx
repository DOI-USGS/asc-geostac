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
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Collapse from '@mui/material/Collapse';
import { blue } from "@mui/material/colors";

// Icons
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot'; // Systems
import PublicIcon from "@mui/icons-material/Public"; // Planets
import DarkModeIcon from "@mui/icons-material/DarkMode"; // Moons
import CookieIcon from '@mui/icons-material/Cookie'; // Asteroids
import TravelExploreIcon from '@mui/icons-material/TravelExplore'; // Footprints.
// import PetsIcon from '@mui/icons-material/Pets';                 // Other
// import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt'; // possible
// import ViewTimelineIcon from '@mui/icons-material/ViewTimeline'; // footprint
// import WhereToVoteIcon from '@mui/icons-material/WhereToVote';   // icons.
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { textTransform } from "@mui/system";

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


// Delete if new data loading works
// Unless we add images here
// Why is Puck/Titania not on this list?

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

  const [openSys, setOpenSys] = React.useState(Array(props.mapList.systems.length).fill(false));

  function handleSysOpen(index){
    const nextOpenSys = openSys.map((isOpen, curIndex) => {
      if (index === curIndex) {
        return !isOpen;
      }
      return false;
    });
    setOpenSys(nextOpenSys);
  }

  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };

  return (
    <Dialog PaperProps={{sx: {overflowY: "scroll"}}} onClose={handleClose} open={open}>
      <DialogTitle sx={{ minWidth: 225 }}>Select Target Body</DialogTitle>
      <List sx={{ pt: 0 }}>
        <ListSubheader value="None">Systems</ListSubheader>
        {props.mapList.systems.map((system, sysIndex) => (
          <React.Fragment key={system.name}>
            <ListItemButton
              onClick={() => handleSysOpen(sysIndex)}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: blue[100] }}>
                  <ScatterPlotIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText sx={{ textTransform: "capitalize"}} primary={system.name.toLowerCase()} />
              {props.mapList.systems[sysIndex].bodies.map(bod => bod.hasFootprints).includes(true) ? <TravelExploreIcon/> : null}
              {openSys[sysIndex] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSys[sysIndex]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {props.mapList.systems[sysIndex].bodies.map((body, bodIndex) => (
                  <ListItemButton
                    sx={{ pl: 4 }}
                    onClick={() => handleListItemClick(body)}
                    key={body.name}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: blue[100] }}>
                        {system.name === "ASTEROIDS" ? <CookieIcon/> : body.name === system.name ? <PublicIcon /> : <DarkModeIcon/>}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText sx={{textTransform: "capitalize"}} primary={body.name.toLowerCase()} secondary={"Maps: " + body.layers.base.length} />
                    {body.hasFootprints ? <TravelExploreIcon/> : null}
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Dialog>
  );
}

PlanetDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.object.isRequired,
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
  const [selectedValue, setSelectedValue] = React.useState(props.mapList.systems[4].bodies[0]);

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
          {props.target.name.toUpperCase()} <ArrowDropDownIcon fontSize="large" />
        </Typography>
      </Grid>
      <PlanetDialog
        mapList={props.mapList}
        selectedValue={selectedValue}
        open={open}
        onClose={handleClose}
      />
    </Grid>
  );
}
