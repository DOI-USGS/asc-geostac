import React, { useEffect } from "react";
import { List, Select, MenuItem, Button, Checkbox} from "@mui/material";

// icons
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";

// Child Components
import { LoadingFootprints, NoFootprints, FilterTooStrict, FootprintCard } from "./ResultsAccessories.jsx";

// Footprint Fetch logic
import { FetchFootprints, FetchObjects, FetchStepRemainder} from "../../js/FootprintFetcher.js";



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

  const [oldTargetName, setOldTargetName] = React.useState("");
  const [oldFilterString, setOldFilterString] = React.useState("");

  const addFeatures = (newFeatures, key) => {
    let myFeatureCollections = featureCollections;
    myFeatureCollections[key].features.push(...newFeatures);
    setFeatureCollections(myFeatureCollections);
    setNumFeatures(myFeatureCollections[key].features.length);

    // Send to Leaflet
    window.postMessage(["addFeaturesToCollection", key, newFeatures], "*");
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

    // Extract the selected collection title
    const selectedCollection = props.target.collections.find(collection => collection.id === newCollectionId);
    const selectedCollectionTitle = selectedCollection ? selectedCollection.title : '';

    // Call the callback function to pass the selected title to the Sidebar
    props.updateSelectedTitle(selectedCollectionTitle);


    // Send to Leaflet
    window.postMessage(["setVisibleCollections", newCollectionId], "*");
  };

  /**
   * @async 
   * Fetches the next page of footprints ands add them to the current collection.
   * Triggered by "Load More" Button. */
  const loadMoreFootprints = async () => {

    let newPage = numFeatures/step + 1;
    let newFeatures = await FetchFootprints(featureCollections[collectionId], newPage, step);
    
    // If any features are returned, add them to current collection
    if (newFeatures.length > 0) {
      addFeatures(newFeatures, collectionId);
    }
  }

  /** Listens for the target name or incoming query string to change,
   *  and fetches/sets new collection info/footprints/features when they do. */
  useEffect(() => {
    
    // Compare new props to old ones to make sure not to do the same fetch twice
    let targetChange = props.target.name !== oldTargetName;
    let filterChange = props.filterString !== oldFilterString;
    let myFilter = props.filterString;

    setOldTargetName(props.target.name);
    setOldFilterString(props.filterString);

    if(targetChange){
      myFilter = "?";
      setOldFilterString(myFilter);
    }

    // If target has collections (of footprints), and target or filter changed
    if ( (targetChange || filterChange) && props.target.collections.length > 0) {

      // Set Loading
      setIsLoading(true);
      setHasFootprints(true);

      let pageInfo = "";
      if (step != 10){
        if(myFilter.slice(-1) !== '?') pageInfo += "&";
        pageInfo += "limit=" + step;
      }

      let collectionUrls = {};
      let styleSheetUrls = [];

      for (const collection of props.target.collections) {
        
        
        let isInStacAPI = collection.hasOwnProperty("stac_version");
        
        let isInPyAPI = collection.hasOwnProperty("itemType");

        
        // check for pygeo api
        if (isInPyAPI)
        {
          // change filter for the pygeo api
          myFilter = "&limit=" + step;
        }
        let styleSheet;
        const foundStyleSheet = collection.links.find(link=> link.rel == "stylesheet");

        if(foundStyleSheet) {
          styleSheet = foundStyleSheet.href;
          styleSheetUrls[collection.id] = styleSheet;
          console.log("Found Style Sheet");
        }

        if(isInStacAPI || isInPyAPI) {
          let itemsUrl = collection.links.find(link => link.rel === "items").href;
          collectionUrls[collection.id] = itemsUrl + myFilter + pageInfo;

          let style_url = null;
          for (let index = 0; index < collection.links.length; index++) {
            if (collection.links[index].rel === "stylesheet") {
              style_url = collection.links[index].href
            }
          }
          collectionUrls[collection.id + ": stylesheet"] = style_url;

          // if (collection.links.find(link => link.rel === "stylesheet").href != undefined) {
          //   let styleUrl = collection.links.find(link => link.rel === "stylesheet").href;
          //   collectionUrls[collection.id].style = styleUrl;
          // }

          // }
        }
        else {
          let itemsUrl = collection.links.find(link => link.rel === "items").href;
          collectionUrls[collection.id] = itemsUrl + pageInfo;
        }
      }

      (async () => {
        let collections = await FetchObjects(collectionUrls);

        // Add extra properties to each collection
        for(const key in collections){
          collections[key].id = key;
          collections[key].title = props.target.collections.find(collection => collection.id === key).title;
          collections[key].url = collectionUrls[key];
          collections[key].styleSheets = styleSheetUrls[key];
        }

        // Updates collectionId if switching to a new set of collections (new target)
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
        window.postMessage(["setFeatureCollections", myId, collections], "*");
      })();

    } else if (props.target.collections.length <= 0) {
      setHasFootprints(false);
      setIsLoading(false);
    }

  }, [props.filterString, props.target.name]);

  const generateQueryAddress = () => {
    let myCollection = props.target.collections.find(collection => collection.id === collectionId);
    if(myCollection){
      let myCollectionUrl = myCollection.links.find(link => link.rel === "items").href;
      return myCollectionUrl + props.filterString;
    } else if (props.target.collections.length > 0) {
      myCollection = props.target.collections[0];
      let myCollectionUrl = myCollection.links.find(link => link.rel === "items").href;
      return myCollectionUrl + props.filterString;
    }
    return "";
  };

  // Update queryAddress for query console whenever filterString or collectionId changes
  useEffect(() => {
    props.setQueryAddress(generateQueryAddress());
  }, [props.filterString, collectionId]);

  // Run this if query received from query console
  // useEffect(() => {
  //   console.info("props.queryAddress", props.queryAddress);
  //   console.info("generateQueryAddress", generateQueryAddress());
  // }), [props.queryAddress];


  let noFootprintsReturned = true;
  for(const key in featureCollections){
    if(featureCollections[key].numberReturned > 0) noFootprintsReturned = false;
  }
  if(numFeatures > matched) {
    setNumFeatures(matched);
  }

  return (
    <div id="footprintResults" className="scroll-parent">
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
                <FootprintCard
                 feature={feature}
                  key={feature.id}
                  selectedQueryables = {props.selectedQueryables}
                  />
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
