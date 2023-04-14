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


/** Skeleton to show when footprints are loading */
function LoadingFootprints() {
  
  return (
    <React.Fragment>
      <div id="xLoadedPane" className="resultPane">
        <Skeleton width={180}/>
      </div>
      <div id="resultsList">
        { Array(8).fill(null).map((_, i) => (
          <Card sx={{ width: 250, margin: 1}} key={i}>
            <CardContent sx={{padding: 1.2, paddingBottom: 0}}>
              <div className="resultContainer">
                <div className="resultImgDiv">
                  <Skeleton variant="rectangular" width={32} height={32}/>
                </div>
                <div className="resultData">
                  <Skeleton width={150}/>
                  <Skeleton width={150}/>
                  <Skeleton width={150}/>
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
    </React.Fragment>
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
 * @component
 */
export default function FootprintResults(props) {

  console.log("props.target", props.target);

  const [featureCollections, setFeatureCollections] = React.useState([]);

  const [isLoading, setIsLoading] = React.useState(true);
  const [hasFootprints, setHasFootprints] = React.useState(true);

  const [page, setPage] = React.useState(1);
  const [step, setStep] = React.useState(10);
  const [collectionId, setCollectionId] = React.useState(props.target.collections.length > 0 ? props.target.collections[0].id : "");
  const [features, setFeatures] = React.useState([]);
  const [matched, setMatched] = React.useState(0);

  /** When the step amount is changed, determines the next page number based on features
   *  loaded and the new step amound and loads the footprints inbetween (if any). */
  const handleStepChange = async (event, value) => {

    let myStep = value.props.value;
    let myPage = Math.ceil(features.length/myStep);
    let skip = features.length % myStep; // Offset of features already loaded.
    let fullQuery = "";
    let newFeatures = [];
    let myFeatureCollection = {}

    // If the new step amount is offset from the number of features loaded...
    if (skip !== 0) 
    {
      fullQuery = queryWithPage(props.queryString, myPage, myStep); // build query, then fetch
      newFeatures = await FetchFootprints(props.target.collections, collectionId, fullQuery);

      // If any features are returned, add the remainder needed to the current collection
      if (newFeatures.length > 0) {
        let myCollections = featureCollections;
        myCollections
          .find(collection => collection.id === collectionId)
          .features.push(...newFeatures.slice(skip, newFeatures.length));

        setFeatureCollections(myCollections);

        myFeatureCollection = myCollections.find(collection => collection.id === collectionId);

        setFeatures(myFeatureCollection.features);
      }
    }
    setPage(myPage);
    setStep(myStep);
  }


  /** Sets states needed to display the new collection 
    * when the collection is changed from the dropdown */
  const handleCollectionChange = (event, value) => {
    let myCollectionId = value.props.value;
    let myFeatureCollection = featureCollections.find(collection => collection.id === value.props.value);
    let myFeatures = myFeatureCollection.features;
    let myMatched = myFeatureCollection.numberMatched;
    let myPage = myFeatures.length/step;

    setCollectionId(myCollectionId);
    setFeatures(myFeatures);
    setPage(myPage);
    setMatched(myMatched);
  };


  /**
   * Adds page and limit info to a query string.
   * @param {string} myQuery - The query without page and limit defined
   * @param {int} myPage - The page number
   * @param {int} myStep - How many footprints to load per page
   * @returns {string} An query with page and limit info added.
   */
  const queryWithPage = (myQuery, myPage, myStep) => {
    let pageInfo = "page=" + myPage + "&";
    if (myStep != 10){
      pageInfo += "limit=" + myStep + "&"
    }
    return myQuery + pageInfo;
  }

  /** Fetches the next page of footprints ands add them to the current collection.
    * Triggered by "Load More" Button. Async. */
  const loadMoreFootprints = async () => {

    let newPage = page + 1;
    let pagedQuery = queryWithPage(props.queryString, newPage, step);
    let newFeatures = await FetchFootprints(props.target.collections, collectionId, pagedQuery);
    let myFeatureCollection = {};
    
    // If any features are returned, add them to currecnt collection
    if (newFeatures.length > 0) {
      let myCollections = featureCollections;
      myCollections
        .find(collection => collection.id === collectionId)
        .features.push(...newFeatures);

      setFeatureCollections(myCollections);

      myFeatureCollection = myCollections.find(collection => collection.id === collectionId);

      setFeatures(myFeatureCollection.features);
      setPage(newPage);
    }
  }

  /** Listens for the target name or incoming query string to change,
   *  and fetches/sets new collection info/footprints/features when they do. */
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
      FetchFootprints(props.target.collections, collectionId, props.queryString);

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
        setFeatures(myFeatureCollections.find(collection => collection.id === collectionId).features)
        setMatched(myFeatureCollections.find(collection => collection.id === collectionId).numberMatched)
        setHasFootprints(myFeatureCollections.length > 0);
        setIsLoading(false);

        let myMaxFootprintsMatched = 0;
        for(const collection of myFeatureCollections) {
          myMaxFootprintsMatched = Math.max(myMaxFootprintsMatched, collection.numberMatched);
        }
        // props.setMaxFootprintsMatched(myMaxFootprintsMatched);

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
      {hasFootprints &&
        <div id="collectionSelectPane" className="resultPane">
          <Select
            className="multilineSelect"
            size="small"
            value={collectionId}
            onChange={handleCollectionChange}
            >
            {props.target.collections.map(collection => (
              <MenuItem key={collection.id} value={collection.id}>{collection.title}</MenuItem>
            ))}
          </Select>
        </div>
      }
      {isLoading ? 
        <LoadingFootprints/>
      : noFootprintsReturned ?
        <FilterTooStrict/>
      : hasFootprints ? 
        <React.Fragment>
          <div id="xLoadedPane" className="resultPane">
            {features.length} of {matched} footprints loaded.
          </div>
          <div id="resultsList">
            <List sx={{maxWidth: 265, paddingTop: 0}}>
              {features.map(feature => (
                <FootprintCard feature={feature} key={feature.id}/>
              ))}
            </List>
          </div>
        </React.Fragment>
      :
        <NoFootprints/>
      }
      { hasFootprints &&
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
                value={step}
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
      }
    </div>
  );
}
