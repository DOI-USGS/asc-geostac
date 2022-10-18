import React, { useEffect } from "react";
import Checkbox from "@mui/material/Checkbox";

// result action links
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

// icons
import PreviewIcon from "@mui/icons-material/Preview";
import LaunchIcon from "@mui/icons-material/Launch";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";

// object with results
import { getFeatures } from "../../js/ApiJsonCollection";

// geotiff thumbnail viewer
import DisplayGeoTiff from "../presentational/DisplayGeoTiff.jsx";
import GeoTiffViewer from "../../js/geoTiffViewer.js";

/**
 * Controls css styling for this component using js to css
 */
let css = {
  root: {
    backgroundColor: "#f8f9fa",
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column",
    padding: 0,
    borderLeft: "2px solid lightgray",
  },
};

/**
 * Component that lets user view list of current footprints
 *
 * @component
 * @example
 * <FootprintResults />
 *
 */
export default function FootprintResults(props) {
  const [features, setFeatures] = React.useState([]);

  const geoTiffViewer = new GeoTiffViewer("GeoTiffAsset");

  const showMetadata = (value) => () => {
    geoTiffViewer.displayGeoTiff(value.assets.thumbnail.href);
    geoTiffViewer.changeMetaData(
      value.collection,
      value.id,
      value.properties.datetime,
      value.assets
    );
    geoTiffViewer.openModal();
  };

  useEffect(() => {
    setTimeout(() => {
      setFeatures(getFeatures);
    }, 1000);
  });

  return (
    <div style={css.root} className="scroll-parent">
      <div className="resultHeader">
        <span id="panelSectionTitle">Footprint Results</span>
        <span className="resultHeaderCheck">
          <Checkbox
            onChange={props.changeLayout}
            icon={<CloseFullscreenIcon />}
            checkedIcon={<OpenInFullIcon />}
            sx={{
              color: "#64748B",
              "&.Mui-checked": {
                color: "#64748B",
              },
            }}
          />
        </span>
      </div>
      <div className="resultsList">
        {features.map((feature) => (
          <div className="resultContainer" key={feature.id}>
            <div className="resultImgDiv">
              <img className="resultImg" src={feature.assets.thumbnail.href} />
            </div>
            <div className="resultData">
              <div className="resultSub">
                <strong>Collection:</strong>&nbsp;{feature.collection}
              </div>
              <div className="resultSub">
                <strong>ID:</strong>&nbsp;{feature.id}
              </div>
              <div className="resultSub">
                <strong>Date:</strong>&nbsp;{feature.properties.datetime}
              </div>
            </div>
            <div className="resultLinks">
              <Stack direction="row" spacing={1}>
                <Chip
                  label="Metadata"
                  icon={<PreviewIcon />}
                  size="small"
                  onClick={showMetadata(feature)}
                  variant="outlined"
                  clickable
                />
                <Chip
                  label="STAC Browser"
                  icon={<LaunchIcon />}
                  size="small"
                  component="a"
                  href={`https://stac.astrogeology.usgs.gov/browser-dev/#/collections/${feature.collection}/items/${feature.id}`}
                  target="_blank"
                  //href="https://stac.astrogeology.usgs.gov/browser-dev/"
                  variant="outlined"
                  clickable
                />
              </Stack>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
