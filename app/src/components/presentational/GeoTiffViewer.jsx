import React from "react";
import Typography from "@mui/material/Typography";
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import ButtonBase from "@mui/material/ButtonBase";
import imageAsset from "../../assets/img/ImageIcon.png";
import { alpha } from "@mui/material/styles";


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
    
    return (
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
                <button 
                  id="geoTiffClose">
                    CLOSE
                </button>
            </Container>
          </AppBar>
          <div id = "geoTiff-Asset">
          </div>
        </Container>
      </div>
        );

}


/**
 * Main component that displays the geoTiff Viewer
 * user click events.
 *
 * @component
 */
 export default function GeoTiffViewer() {

    return (
        <div>
        <ButtonBase
              id="geoTiffViewerButton"
              focusRipple
              sx={css.button}
            >
              <img style={css.img} src={imageAsset} />
        </ButtonBase>

        </div>

    );
 }