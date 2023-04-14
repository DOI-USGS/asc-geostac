import React, { useEffect } from "react";
import Checkbox from "@mui/material/Checkbox";
import {Card, CardContent, CardActions, Skeleton, Chip, Stack, List, ListItemButton, ListItemText, Collapse, Divider, ListSubheader, Select, FormControl, MenuItem, Button} from "@mui/material";

// icons
import PreviewIcon from "@mui/icons-material/Preview";
import LaunchIcon from "@mui/icons-material/Launch";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import TravelExploreIcon from '@mui/icons-material/TravelExplore'; // Footprints

// geotiff thumbnail viewer... Should we be using DisplayGeoTiff.jsx instead?
import GeoTiffViewer from "../../js/geoTiffViewer.js";

// Footprint Fetch logic
import FetchFootprints from "../../js/FootprintFetcher.js";

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

// Shown when there are no collections available on the current target.
function NoFootprints(){
  return(
    <div style={{padding: 10, maxWidth: 268}}>
      <p>
        This target has no footprints. To find 
        footprints, go to the dropdown menu 
        in the upper left and pick a target 
        body with the <TravelExploreIcon sx={{fontSize: 16, verticalAlign: "middle"}}/> icon next to it.
      </p>
    </div>
  );
}

// Shown when collections are available but no footprints were returned for current filter.
function FilterTooStrict(){
  return(
    <div style={{padding: 10, maxWidth: 268}}>
      <p>
        No footprints match this filter.
      </p>
      <p>
        To find more footprints: 
      </p>
      <ul>
        <li>Uncheck current filters</li>
        <li>Draw a larger search area</li>
        <li>Enter a wider date range to filter by</li>
      </ul>
    </div>
  );
}

// A small card with an images and a few key data points
// shown as the result for a footprint.
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
  const [currentPage, setCurrentPage] = React.useState(1);
  const [currentStep, setCurrentStep] = React.useState(10);
  const [currentCollection, setCurrentCollection] = React.useState(props.target.collections.length > 0 ? props.target.collections[0].id : "");  

  const handleStepChange = (event, value) => {
    setCurrentStep(value.props.value);
  }

  function handleOpenCollection(index){
    const nextOpenCollection = openCollection.map((isOpen, curIndex) => {
      if (index === curIndex) {
        return !isOpen;
      }
      return isOpen;
    });
    setOpenCollection(nextOpenCollection);
  }

  const handleCollectionChange = (event, value) => {
    setCurrentCollection(value.props.value);
  };

  const getCurrentCollection = () => featureCollections.find(obj => obj.id === currentCollection)

  async function loadMoreFootprints () {

    setIsLoading(true);

    let pageInfo = "page=" + (currentPage + 1) + "&";
    if (currentStep != 10){
      pageInfo += "limit=" + currentStep + "&"
    }
  
    // fetch and await new footprints
    let newFeatures = await FetchFootprints(props.target.collections, currentCollection, props.queryString + pageInfo);
    
    if(newFeatures.length > 0) {
      let myCollections = featureCollections;
      myCollections
        .find(collection => collection.id === currentCollection)
        .features.push(...newFeatures);

      setFeatureCollections(myCollections);
    }
    setCurrentPage(currentPage + 1);
    setIsLoading(false);
  }

  useEffect(() => {

    // If target has collections (of footprints)
    if (props.target.collections.length > 0) {

      // Set Loading
      setIsLoading(true);
      setHasFootprints(true);

      // set link information
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

      // For Query Console (query console needs the link info we just set)
      props.setCollectionUrls(itemCollectionData);

      // TODO: USE THIS EXTERNAL LOGIC
      FetchFootprints(props.target.collections, currentCollection, props.queryString);

      // Promise tracking
      let fetchPromise = {};
      let jsonPromise = {};
      // Result
      let jsonRes = {};

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

  let noFootprintsReturned = true;
  for(const collection of featureCollections){
    if(collection.numberReturned > 0) noFootprintsReturned = false;
  }

  return (
    <div id="footprintResults" className="scroll-parent">
      <div id="resultHeader" className="resultPane">
        <span id="panelSectionTitle">Footprint Results</span>
        <span id="resultHeaderCheck">
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
      : noFootprintsReturned ?
        <FilterTooStrict/>
      : hasFootprints ? 
        <React.Fragment>
          <div id="collectionSelectPane" className="resultPane">
            <Select
              className="multilineSelect"
              size="small"
              defaultValue={currentCollection ?? ""}
              onChange={handleCollectionChange}
              >
              {props.target.collections.map(collection => (
                <MenuItem key={collection.id} value={collection.id}>{collection.title}</MenuItem>
              ))}
            </Select>
          </div>
          <div id="xLoadedPane" className="resultPane">
            {getCurrentCollection().features.length} of {getCurrentCollection().numberMatched} footprints loaded.
          </div>
          <div id="resultsList">
            <List sx={{maxWidth: 265, paddingTop: 0}}>
              {getCurrentCollection().features.map(feature => (
                <FootprintCard feature={feature} key={feature.id}/>
              ))}
            </List>
          </div>
          <div id="resultLoader" className="resultPane">
            <div id="loadMore">
              <Button
                id="loadMoreButton"
                onClick={loadMoreFootprints}
                variant="outlined"
                size="small"
              >
                Load More
              </Button>
            </div>
            <div id="xPerRequest">
              <div>
                <Select
                  id="xPerRequestSelect"
                  className="thinSelect"
                  size="small"
                  value={currentStep}
                  onChange={handleStepChange}
                  >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </div>
              <div>
                <label style={{marginRight: "5px"}} htmlFor="xPerRequestSelect">
                  per <br/> request
                </label>
              </div>
            </div>
          </div>
        </React.Fragment>
      :
        <NoFootprints/>
      }
    </div>
  );
}
