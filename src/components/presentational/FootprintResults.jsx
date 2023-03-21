import React, { useEffect } from "react";
import Checkbox from "@mui/material/Checkbox";
import {Card, CardContent, CardActions, Skeleton, Chip, Stack, List, ListItemButton, ListItemText, Collapse, Divider, ListSubheader} from "@mui/material";

// icons
import PreviewIcon from "@mui/icons-material/Preview";
import LaunchIcon from "@mui/icons-material/Launch";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import TravelExploreIcon from '@mui/icons-material/TravelExplore'; // Footprints

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

// geotiff thumbnail viewer... Should we be using DisplayGeoTiff.jsx instead?
import GeoTiffViewer from "../../js/geoTiffViewer.js";
import { lineHeight } from "@mui/system";


/**
 * Skeleton to show when footprints are loading
 */
function LoadingFootprints() {
  
  return (
    <div className="resultsList">
      { Array(8).fill(null).map((_, i) => (
        <Card sx={{ width: 250, margin: 1}} key={i}>
          <CardContent sx={{padding: 0.9, paddingBottom: 0}}>
            <div className="resultContainer">
              <div className="resultImgDiv">
                <Skeleton variant="rectangular" width={32} height={32}/>
              </div>
              <div className="resultData">
                <Skeleton/>
                <Skeleton/>
                <Skeleton/>
              </div>
            </div>
          </CardContent>
          <CardActions>
            <div className="resultLinks">
              <Stack direction="row" spacing={1} sx={{marginTop:1}}>
                <Skeleton variant="rounded" width={100} height={20} sx={{borderRadius:5}}/>
                <Skeleton variant="rounded" width={100} height={20} sx={{borderRadius:5}}/>
              </Stack>
            </div>
          </CardActions>
        </Card>
        
      ))}
    </div>
  );
}

function NoFootprints(){
  return(
    <div style={{padding: 10, maxWidth: 268}}>
      <p>
        This target has no footprints. To see 
        footprints, go to the dropdown menu 
        in the upper left and pick a target 
        body with the <TravelExploreIcon sx={{fontSize: 16, verticalAlign: "middle"}}/> icon next to it.
      </p>
    </div>
  );
}

function FootprintCard(props){

  // Metadata Popup
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

  return(
    <Card sx={{ width: 250, margin: 1}}>
      <CardContent sx={{padding: 1.2, paddingBottom: 0}}>
        <div className="resultContainer" >
          <div className="resultImgDiv">
            <img className="resultImg" src={props.feature.assets.thumbnail.href} />
          </div>
          <div className="resultData">
            {/* <div className="resultSub">
              <strong>Collection:</strong>&nbsp;{props.feature.collection}
            </div> */}
            <div className="resultSub">
              <strong>ID:</strong>&nbsp;{props.feature.id}
            </div>
            <div className="resultSub">
              <strong>Date:</strong>&nbsp;{props.feature.properties.datetime}
            </div>
          </div>
        </div>
      </CardContent>
      <CardActions>
        <div className="resultLinks">
          <Stack direction="row" spacing={1}>
            <Chip
              label="Metadata"
              icon={<PreviewIcon />}
              size="small"
              onClick={showMetadata(props.feature)}
              variant="outlined"
              clickable
            />
            <Chip
              label="STAC Browser"
              icon={<LaunchIcon />}
              size="small"
              component="a"
              href={`https://stac.astrogeology.usgs.gov/browser-dev/#/collections/${props.feature.collection}/items/${props.feature.id}`}
              target="_blank"
              variant="outlined"
              clickable
            />
          </Stack>
        </div>
      </CardActions>
    </Card>
  );
}


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

  const [featureCollections, setFeatureCollections] = React.useState([]);

  const [isLoading, setIsLoading] = React.useState(true);
  const [hasFootprints, setHasFootprints] = React.useState(true);

  const [openCollection, setOpenCollection] = React.useState([]);

  function handleOpenCollection(index){
    const nextOpenCollection = openCollection.map((isOpen, curIndex) => {
      if (index === curIndex) {
        return !isOpen;
      }
      return isOpen;
    });
    setOpenCollection(nextOpenCollection);
  }

  useEffect(() => {

    // If target has collections (of footprints)
    if (props.target.collections.length > 0) {

      // Set Loading
      setIsLoading(true);
      setHasFootprints(true);

      // Promise tracking
      let fetchPromise = {};
      let jsonPromise = {};
      // Result
      let jsonRes = {};

      let itemCollectionData = [];
      for(const collection of props.target.collections) {
        // Get "items" link for each collection
        let itemsUrl = collection.links.find(obj => obj.rel === "items").href;
        itemCollectionData.push({
          "itemsUrl" : itemsUrl,
          "itemsUrlWithQuery" : itemsUrl + props.queryString,
          "id" : collection.id,
          "title" : collection.title
        });
      }

      // For Query Console
      props.setCollectionUrls(itemCollectionData);

      // Get ready to fetch
      for(const itemCollectionUrl of itemCollectionData) {
        fetchPromise[itemCollectionUrl.itemsUrlWithQuery] = "Not Started";
        jsonPromise[itemCollectionUrl.itemsUrlWithQuery] = "Not Started";
        jsonRes[itemCollectionUrl.itemsUrlWithQuery] = [];
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

      // To be executed after Fetch has been started, wait for fetch to finish
      async function awaitFetch(targetUrl) {
        await fetchPromise[targetUrl];
        await jsonPromise[targetUrl];
      } 

      async function fetchAndWait() {
        // Start fetching
        for(const itemCollectionUrl of itemCollectionData) {
          startFetch(itemCollectionUrl.itemsUrlWithQuery);
        }

        // Wait for completion
        for(const itemCollectionUrl of itemCollectionData) {
          await awaitFetch(itemCollectionUrl.itemsUrlWithQuery);
        }
        
        // Extract footprints into array
        let myCollections = [];
        for(const itemCollectionUrl of itemCollectionData) {
          // Add info to returned item collection from top level collection data.
          jsonRes[itemCollectionUrl.itemsUrlWithQuery].id = itemCollectionUrl.id;
          jsonRes[itemCollectionUrl.itemsUrlWithQuery].title = itemCollectionUrl.title;
          jsonRes[itemCollectionUrl.itemsUrlWithQuery].itemsUrl = itemCollectionUrl.itemsUrl;
          jsonRes[itemCollectionUrl.itemsUrlWithQuery].itemsUrlWithQuery = itemCollectionUrl.itemsUrlWithQuery;
          myCollections.push(jsonRes[itemCollectionUrl.itemsUrlWithQuery]);
        }

        return myCollections;
      }

      // Send to Leaflet
      window.postMessage(["setQuery", props.queryString], "*");

      (async () => {
        // Wait for features to be fetched and parsed
        let myFeatureCollections = await fetchAndWait()

        // Set relevant properties based on features received
        setFeatureCollections(myFeatureCollections);
        setHasFootprints(myFeatureCollections.length > 0);
        setIsLoading(false);


        if(myFeatureCollections.length > openCollection.length){
          setOpenCollection(Array(myFeatureCollections.length).fill(true));
        }        

        let myMaxFootprintsMatched = 0;
        for(const collection of myFeatureCollections) {
          myMaxFootprintsMatched = Math.max(myMaxFootprintsMatched, collection.numberMatched);
        }
        props.setMaxFootprintsMatched(myMaxFootprintsMatched);

        // Send to Leaflet
        window.postMessage(["setFeatureCollections", myFeatureCollections], "*");
      })();

    } else {
      setIsLoading(false);
      setHasFootprints(false);
    }

  }, [props.target.name, props.queryString]);

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
      {isLoading ? 
        <LoadingFootprints/>
      : hasFootprints ?   
        <div className="resultsList">
          <List sx={{maxWidth: 265, paddingTop: 0}}>
            {featureCollections.map((collection, collectionIndex) => (
              <React.Fragment key={collection.id}>
                {collection.features.length > 0 ? 
                <>
                  <ListItemButton onClick={() => handleOpenCollection(collectionIndex)}>
                    <ListItemText
                      sx={{marginTop: 0, marginBottom: 0}}
                      primary={
                        <p style={{fontSize: "12px", lineHeight: "15px", fontWeight: "bold", marginTop: 1, marginBottom: 1}}>{collection.title}</p>
                      } secondary={
                        <span className="collectionStatExpander">
                          <span>{
                            ((props.currentPage-1)*props.currentStep + 1) + "-"
                            + ((props.currentPage-1)*props.currentStep + collection.numberReturned)
                            + " of " + collection.numberMatched + " footprints"}</span>
                          <span className="flatExpander">{openCollection[collectionIndex] ? <ExpandLess /> : <ExpandMore />}</span>
                        </span>
                      }/>
                  </ListItemButton>
                  <Collapse in={openCollection[collectionIndex]}>
                    <Divider/>
                    <ListSubheader sx={{
                        overflow:"hidden", 
                        whiteSpace:"nowrap", 
                        backgroundColor:"rgb(248, 249, 250) none repeat scroll 0% 0%",
                        fontSize: "12px",
                        lineHeight: "24px",
                        borderBottom: "1px solid lightgrey",
                        boxShadow: "0px 1px 2px lightgrey"
                      }}>
                        {collection.title}
                      </ListSubheader>
                    {collection.features.map((feature) => (
                      <FootprintCard feature={feature} title={collection.title} key={feature.id}/>
                    ))}
                  </Collapse>
                </>
                : null }
                <Divider/>
              </React.Fragment>
            ))}
          </List>
        </div>
      :
        <NoFootprints/>
      }
    </div>
  );
}
