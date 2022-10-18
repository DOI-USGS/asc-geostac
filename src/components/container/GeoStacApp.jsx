import React from "react";
import ConsoleAppBar from "../presentational/ConsoleAppBar.jsx";
import MapContainer from "./MapContainer.jsx";
import QueryConsole from "../presentational/QueryConsole.jsx";
import { getFeatures } from "../../js/ApiJsonCollection";
import DisplayGeoTiff from "../presentational/DisplayGeoTiff.jsx";
import Sidebar from "../presentational/Sidebar.jsx";
import MenuBar from "../presentational/Menubar.jsx";

/**
 * Controls css styling for this component using js to css
 */
let css = {
  appFlex: {
    position: "relative",
  },
  appFull: {
    position: "fixed",
    height: "100%",
    width: "100%",
  },
};

/**
 * GeoStacApp is the parent component for all of the other components of the main app.
 * It imports and creates all of the map and console components and contains the
 * target selector.
 *
 * @component
 */
export default function GeoStacApp() {
  const [targetPlanet, setTargetPlanet] = React.useState("Mars");

  const [footprintData, setFootprintData] = React.useState([]);

  const [appFullWindow, setAppFullWindow] = React.useState(true);
  const [appViewStyle, setAppViewStyle] = React.useState(css.appFlex);

  const handleAppViewChange = () => {
    setAppFullWindow(!appFullWindow);
    setAppViewStyle(appFullWindow ? css.appFull : css.appFlex);
  };

  /**
   * Handles target body selection
   * @param {*} value selection event
   */
  const handleTargetBodyChange = (value) => {
    setTargetPlanet(value);
  };

  const handleFootprintClick = () => {
    setFootprintData(getFeatures);
    //console.log(footprintData);
  };

  return (
    <div style={appViewStyle} className="flex col scroll-parent">
      <MenuBar
        handleAppViewChange={handleAppViewChange}
        appFullWindow={appFullWindow}
      />
      <div className="flex row scroll-parent">
        <div className="flex col">
          <ConsoleAppBar
            target={targetPlanet}
            bodyChange={handleTargetBodyChange}
          />
          <div id="map-area">
            <MapContainer target={targetPlanet} />
          </div>
          <QueryConsole />
        </div>
        <Sidebar
          target={targetPlanet}
          footprintNavClick={handleFootprintClick}
        />
      </div>
      <DisplayGeoTiff />
    </div>
  );
}
