import React from "react";
import ButtonBase from "@mui/material/ButtonBase";
import imageAsset from "../../assets/img/ImageIcon.png";
import Grid from "@mui/material/Grid";
import GeoTiffViewer from "../../js/geoTiffViewer.js";


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





/**
 * Main component that displays the geoTiff Viewer
 * user click events.
 *
 * @component
 */
 export default function GeoTiffButton(props) {
  

  const geoTiffViewer = new GeoTiffViewer("");



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
                onClick={geoTiffViewer.openModal}
              >
                <img style={css.img} src={imageAsset} />
          </ButtonBase>
        </Grid>

    );
 }