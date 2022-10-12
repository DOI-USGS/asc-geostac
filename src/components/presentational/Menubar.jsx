import React from "react";
import { SvgIcon } from "@mui/material";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import GeoStacWhiteIcon from "../../images/logos/geostac-logo-white.svg";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function MenuBar(props) {
  const [showAbout, setShowAbout] = React.useState(false);

  const handleOpenAbout = () => {
    setShowAbout(true);
  };

  const handleCloseAbout = () => {
    setShowAbout(false);
  };

  return (
    <div id="menu-bar">
      <div className="menu-item" onClick={handleOpenAbout}>
        <SvgIcon
          viewBox="15 15 375 375"
          style={{
            width: 20,
            height: 20,
            position: "relative",
          }}
          component={GeoStacWhiteIcon}
        />
        <span className="menu-item-text">GeoSTAC</span>
      </div>
      <a
        className="menu-link"
        target="_blank"
        href="https://www.ceias.nau.edu/capstone/projects/CS/2022/GeoSTAC/documents/usermanual.pdf"
      >
        <div className="menu-item">
          <HelpOutlineIcon fontSize="small" />
          <span className="menu-item-text">Help</span>
        </div>
      </a>
      <div className="menu-item" onClick={props.handleAppViewChange}>
        {props.appFullWindow ? (
          <>
            <OpenInFullIcon fontSize="small" />
            <span className="menu-item-text">Expand</span>
          </>
        ) : (
          <>
            <CloseFullscreenIcon fontSize="small" />
            <span className="menu-item-text">Collapse</span>
          </>
        )}
      </div>

      <Dialog open={showAbout} onClose={handleCloseAbout} scroll="paper">
        <DialogTitle id="scroll-dialog-title">About</DialogTitle>
        <DialogContent dividers={scroll === "paper"}>
          <DialogContentText id="scroll-dialog-description" tabIndex={-1}>
            GeoSTAC is a map for finding planetary data. It was created
            initially as a series of Capstone projects at NAU by the CartoCosmos
            and GeoSTAC teams, using React and Leaflet. It is now maintained by
            the USGS.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAbout}>Dismiss</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
