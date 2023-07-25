import React from "react";
import { Card, CardContent, CardActions, Skeleton, Chip, Stack} from "@mui/material";

// icons
import PreviewIcon from "@mui/icons-material/Preview";
import LaunchIcon from "@mui/icons-material/Launch";
import TravelExploreIcon from '@mui/icons-material/TravelExplore'; // Footprints

// geotiff thumbnail viewer... Should we be using DisplayGeoTiff.jsx instead?
import GeoTiffViewer from "../../js/geoTiffViewer.js";

/** Skeleton to show when footprints are loading */
export function LoadingFootprints() {
  
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
export function NoFootprints(){
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
export function FilterTooStrict(){
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
export function FootprintCard(props){

  //initialize variables 
  let ThumbnailLink = '';
  let modifiedProductId = '';
  let BrowserLink = '';
  let showMetadata;
  
   // Metadata Popup
  const geoTiffViewer = new GeoTiffViewer("GeoTiffAsset");

  


  // Check for pyGeo API vs raster API
 
  // Check if "assets" is available before accessing it
  if (props.feature.assets && props.feature.assets.thumbnail && props.feature.assets.thumbnail.href) 
  {
    // set Thumbnail link
    ThumbnailLink = props.feature.assets.thumbnail.href;

    BrowserLink = 'https://stac.astrogeology.usgs.gov/browser-dev/#/api/collections/' + props.feature.collection + '/items/' + props.feature.id;
    
    // display meta data for STAC api
     showMetadata = (value) => () => {
      geoTiffViewer.displayGeoTiff(value.assets.thumbnail.href);
      geoTiffViewer.changeMetaData(
        value.collection,
        value.id,
        value.properties.datetime,
        value.assets
      );
      geoTiffViewer.openModal();
    }; 

    
  } 
  else 
  {

    // Switch the id and date and link
    props.feature.id = props.feature.properties.productid;

    props.feature.properties.datetime = props.feature.properties.createdate;

    modifiedProductId = props.feature.id.replace(/_RED|_COLOR/g, '');

    ThumbnailLink = 'https://hirise.lpl.arizona.edu/PDS/EXTRAS/RDR/ESP/ORB_012600_012699/' + modifiedProductId + '/' + props.feature.id + '.thumb.jpg';

    BrowserLink = props.feature.properties.produrl;

    //display different modal for PyGeo API
    showMetadata = (value) => () => {
    geoTiffViewer.displayGeoTiff(ThumbnailLink);
    geoTiffViewer.changeMetaData(
      value.properties.datasetid,
      value.properties.productid,
      value.properties.datetime,
      value.links
    );
    geoTiffViewer.openModal();
  };
  }
  


  return(
    <Card sx={{ width: 250, margin: 1}}>
      <CardContent sx={{padding: 1.2, paddingBottom: 0}}>
        <div className="resultContainer" >
          <div className="resultImgDiv">
            <img className="resultImg" src={ThumbnailLink} />
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
              label="Browser"
              icon={<LaunchIcon />}
              size="small"
              component="a"
              href={BrowserLink}
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