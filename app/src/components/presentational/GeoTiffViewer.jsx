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
    container: {
      display: "flex",
      flexWrap: "noWrap",
      width: 170,
      height: 40,
      marginTop: 5,
      verticalAlign: "middle",
    },
    grid: {
      width: 120,
      height: "100%"
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
        <div sx={css.container}>
          <ButtonBase
                id="geoTiffViewerButton"
                focusRipple
                sx={css.button}
                onClick={geoTiffViewer.openModal}
              >
                <img style={css.img} src={imageAsset} />
          </ButtonBase>
        </div>
    );
 }