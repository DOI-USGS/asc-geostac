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

  const [footprintListComponent, setFootprintListComponent] = React.useState(() => {
    return(
      <div>Loading...</div>
    );
  })

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

    // If target has collections (of footprints)
    if (props.target.collections.length > 0) {

      let fetchPromise = {};
      let jsonPromise = {};
      let jsonRes = {};

      let itemCollectionUrls = [];
      for(const collection of props.target.collections) {
        // Get "items" link for each collection
        let newItemCollectionUrl = collection.links.find(obj => obj.rel === "items").href
        itemCollectionUrls.push(newItemCollectionUrl);
      }

      for(const itemCollectionUrl of itemCollectionUrls) {
        fetchPromise[itemCollectionUrl] = "Not Started";
        jsonPromise[itemCollectionUrl] = "Not Started";
        jsonRes[itemCollectionUrl] = [];
      }

      // Fetch JSON and read into object
      async function startFetch(targetUrl) {
          fetchPromise[targetUrl] = fetch(
            targetUrl
          ).then((res)=>{
              jsonPromise[targetUrl] = res.json().then((jsonData)=>{
                  jsonRes[targetUrl] = jsonData;
              }).catch((err)=>{
                  console.log(err);
              });
          }).catch((err) => {
              console.log(err);
          });
      }

      async function awaitFetch(targetUrl) {
        await fetchPromise[targetUrl];
        await jsonPromise[targetUrl];
      }
      
      function extractFootprints(resultsArr) {
        for(const result in resultsArr){

        }
      }

      async function fetchAndWait() {
        // Start fetching
        for(const itemCollectionUrl of itemCollectionUrls) {
          startFetch(itemCollectionUrl);
        }

        // Wait for completion
        for(const itemCollectionUrl of itemCollectionUrls) {
          await awaitFetch(itemCollectionUrl);
        }
        
        let resultsArr = [];
        let myFeatures = [];

        for(const itemCollectionUrl of itemCollectionUrls) {
          myFeatures.push(jsonRes[itemCollectionUrl]);
        }

        for(const featCollection of myFeatures) {
          resultsArr.push(...featCollection.features)
        }

        return resultsArr;
      }

      

      (async () => {
        // Wait
        let myFeatures = await fetchAndWait()
        setFeatures(myFeatures);
        setFootprintListComponent(
          <>
            <div>Footprints!</div>
          </>
        );
      })();

      

      

    } else {
      setFootprintListComponent(<div>No footprints for this Target.</div>)
    }
    
    // setTimeout(() => {
    //   setFeatures(getFeatures);
    // }, 1000); 

  }, []);

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
      {footprintListComponent}
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
