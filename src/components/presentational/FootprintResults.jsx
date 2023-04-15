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
import { FetchFootprints, FetchObjects, FetchStepRemainder} from "../../js/FootprintFetcher.js";


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

  const [featureCollections, setFeatureCollections] = React.useState({});

  const [isLoading, setIsLoading] = React.useState(true);
  const [hasFootprints, setHasFootprints] = React.useState(true);

  const [numFeatures, setNumFeatures] = React.useState(10);
  const [step, setStep] = React.useState(10);
  const [collectionId, setCollectionId] = React.useState(props.target.collections.length > 0 ? props.target.collections[0].id : "");
  const [matched, setMatched] = React.useState(0);

  const addFeatures = (newFeatures, key) => {
    let myFeatureCollections = featureCollections;
    myFeatureCollections[key].features.push(...newFeatures);
    setFeatureCollections(myFeatureCollections);
    setNumFeatures(myFeatureCollections[key].features.length);
  }

  /** When the step amount is changed, determines the next page number based on features
   *  loaded and the new step amound and loads the footprints inbetween (if any). */
  const handleStepChange = async (event, value) => {

    let myStep = value.props.value;
    addFeatures(await FetchStepRemainder(featureCollections[collectionId], myStep), collectionId);
    setStep(myStep);
  }


  /** Sets states needed to display the new collection 
    * when the collection is changed from the dropdown */
  const handleCollectionChange = async (event, value) => {
    let newCollectionId = value.props.value;
    
    addFeatures(await FetchStepRemainder(featureCollections[newCollectionId], step), newCollectionId);
    
    setCollectionId(newCollectionId);
    setMatched(featureCollections[newCollectionId].numberMatched);
  };

  /**
   * @async 
   * Fetches the next page of footprints ands add them to the current collection.
   * Triggered by "Load More" Button. */
  const loadMoreFootprints = async () => {

    let newPage = numFeatures/step + 1;
    let newFeatures = await FetchFootprints(featureCollections[collectionId], newPage, step);
    
    // If any features are returned, add them to currecnt collection
    if (newFeatures.length > 0) {
      addFeatures(newFeatures, collectionId);
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

      let pageInfo = "";
      if (step != 10){
        if(props.queryString.slice(-1) !== '?') pageInfo += "&";
        pageInfo += "limit=" + step;
      }

      let collectionUrls = {};
      for (const collection of props.target.collections) {
        let itemsUrl = collection.links.find(link => link.rel === "items").href;
        collectionUrls[collection.id] = itemsUrl + props.queryString + pageInfo;
      }

      (async () => {
        let collections = await FetchObjects(collectionUrls);

        let tempCollections = [];

        // Add extra properties to each collection
        for(const key in collections){
          collections[key].id = key;
          collections[key].title = props.target.collections.find(collection => collection.id === key).title;
          collections[key].url = collectionUrls[key];
          tempCollections.push(collections[key]);
        }

        let myId = collectionId;
        if (!collections[myId]) {
          myId = props.target.collections[0].id;
          setCollectionId(myId);
        }
        
        // Set relevant properties based on features received
        setFeatureCollections(collections);
        setMatched(collections[myId].numberMatched);
        setNumFeatures(collections[myId].features.length);
        setHasFootprints(Object.keys(collections).length > 0);
        setIsLoading(false);

        // Send to Leaflet
        window.postMessage(["setFeatureCollections", tempCollections], "*");
      })();

    } else {
      setHasFootprints(false);
      setIsLoading(false);
    }

  }, [props.target.name, props.queryString]);

  let noFootprintsReturned = true;
  for(const key in featureCollections){
    if(featureCollections[key].numberReturned > 0) noFootprintsReturned = false;
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
            value={props.target.collections.find(col => col.id === collectionId) ? collectionId : ""}
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
            {numFeatures} of {matched} footprints loaded.
          </div>
          <div id="resultsList">
            <List sx={{maxWidth: 265, paddingTop: 0}}>
              {featureCollections[collectionId].features.map(feature => (
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
                disabled={numFeatures >= matched}
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

        </React.Fragment>
      :
        <NoFootprints/>
      }
    </div>
  );
}
