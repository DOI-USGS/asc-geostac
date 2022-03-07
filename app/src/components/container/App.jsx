import React from "react";
import ConsoleAppBar from "../presentational/ConsoleAppBar.jsx";
import MapContainer from "./MapContainer.jsx";
import QueryConsole from "../presentational/QueryConsole.jsx";
import CreditsDisplay from "../presentational/CreditsDisplay.jsx";
import SearchAndFilterInput from "../presentational/SearchAndFilterInput.jsx";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import GeoTiffViewer from "../../js/geoTiffViewer";
import FootprintResults from "../presentational/FootprintResults.jsx";
import { getFeatures } from "../../js/ApiJsonCollection";

const css = {
  expanded: {
    height: "100vh",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    background: "#f8f9fa"
  },
  stacked: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    background: "#f8f9fa"
  },
  shown: {
    display: "block"
  },
  hidden: {
    display: "none"
  }
};

/**
 * App is the parent component for all of the other components in the project. It
 * imports and creates all of the map and console components and contains the
 * target selector.
 *
 * @component
 */
export default function App() {
  const [targetPlanet, setTargetPlanet] = React.useState("Mars");

  const [showSidePanel, setShowSidePanel] = React.useState(false);
  const [sidePanelVisStyle, setSidePanelVisStyle] = React.useState(css.shown);

  const [expandResults, setExpandResults] = React.useState(true);
  const [resultsExpandStyle, setResultsExpandStyle] = React.useState(css.stacked);

  const geoTiffViewer = new GeoTiffViewer("geoTiff-Container");

  const [footprintData, setFootprintData] = React.useState([]);

  const showHideSort = () => {
    setShowSidePanel(!showSidePanel);
    setSidePanelVisStyle(showSidePanel ? css.shown : css.hidden);
  }

  const handlePanelLayout = (event) => {
    setExpandResults(expandResults => !expandResults);
    setResultsExpandStyle(expandResults ? css.expanded : css.stacked);
  }

  /**
   * Handles target body selection
   * @param {*} value selection event
   */
  const handleTargetBodyChange = value => {
    setTargetPlanet(value);
  };

  const handleFootprintClick = () => {
    setFootprintData(getFeatures);
    //console.log(footprintData);
  };

  return (
    <div id="app-container">
      <div id="main-column">
        <div id="top-bar">
          <ConsoleAppBar target={targetPlanet} bodyChange={handleTargetBodyChange}  />
        </div>
        <MapContainer target={targetPlanet} />
        <div id="bottom-bar">
          <QueryConsole />
          <CreditsDisplay />
        </div>
      </div>
      <div id="right-bar">
        <div id="sort-filter-collapsed" onClick={showHideSort} >
          <ArrowLeftIcon/>
          Sort and Filter
          <ArrowLeftIcon/>
        </div>
          <div style={sidePanelVisStyle}>
            <div style={resultsExpandStyle}>
              <SearchAndFilterInput target={targetPlanet} footprintNavClick={handleFootprintClick} />
              <FootprintResults changeLayout={handlePanelLayout}/>
            </div>
          </div>
      </div>

      <div id="geoTiff-Container">
        <Container>
          <AppBar position="relative">
            <Container sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}>
              <Typography 
                variant="h6"
                id="geoTiff-Asset-name"
                noWrap
                component="div"
                align="center"
                sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
                >
                  Displayed GeoTiff
                </Typography>
                <button onClick={geoTiffViewer.toggleViewer} 
                  id="geoTiffClose">
                    CLOSE
                </button>
            </Container>
          </AppBar>
          <div id = "geoTiff-Asset">
          </div>
          <AppBar position="relative">
            <Container>
              <button id="download-button">Download Asset</button>
            </Container>
          </AppBar>
        </Container>
      </div>
    </div>
  );
}
