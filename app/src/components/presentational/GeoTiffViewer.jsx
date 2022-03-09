import React from "react";
import Typography from "@mui/material/Typography";
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import ButtonBase from "@mui/material/ButtonBase";
import imageAsset from "../../assets/img/ImageIcon.png";
import { alpha } from "@mui/material/styles";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import PropTypes from 'prop-types';
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid";


let css = {
    img: {
      width: "100%",
      height: "100%"
    },
    button: {
        display: "inline",
        width: "10%",
        height: "10%"
    },
  };



function DisplayGeoTiff(props) {

  const { open, onClose } = props;

  const handleClose = () => {
    onClose();
  };

    
    return (
      <Dialog onClose={handleClose} open = {open}>
        <DialogTitle>
          Cloud Optimized GeoTiff
        </DialogTitle>
        <Container>
          <div id = "geoTiff-Asset">
          </div>
        </Container>
      </Dialog>
      /*
        <div id="geoTiff-Container">
        <Container>
          <AppBar position="relative">
            <Container sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}>
              <Typography 
                variant="h6"
                id="geoTiff-Asset-name"
                noWrap
                component="div"
                align="center"
                sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
                >
                  Displayed GeoTiff
                </Typography>
            </Container>
          </AppBar>
          <div id = "geoTiff-Asset">
          </div>
        </Container>
      </div>
      */
        );

}

DisplayGeoTiff.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  GeoTiffURL: PropTypes.string.isRequired
};


/**
 * Main component that displays the geoTiff Viewer
 * user click events.
 *
 * @component
 */
 export default function GeoTiffViewer(props) {
  
  const [dialogOpen, setDialogOpen] = React.useState(false);
  
  const handleDialogOpen = () => {
    setDialogOpen(true);
  }

  const handleClose = () => {
    setDialogOpen(false);
    props.close();
  }



    return (
        <Grid
        container
        item
        justifyContent="center"
        alignItems="center"
        xs
      >
          <ButtonBase
                id="geoTiffViewerButton"
                focusRipple
                sx={css.button}
                onClick={handleDialogOpen}
              >
                <img style={css.img} src={imageAsset} />
          </ButtonBase>
          <DisplayGeoTiff
            open={dialogOpen}
            onClose={handleClose}
            GeoTiffURL = {""}
          />
        </Grid>

    );
 }