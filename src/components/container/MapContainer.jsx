import React, { useEffect } from "react";
import AstroMap from "../../js/AstroMap";
import AstroControlManager from "../../js/AstroControlManager";

/**
 * Component that uses back end JS files to invoke and display the
 * map. The container handles update events and is the root element
 * for the map.
 *
 *
 * @component MapContainer
 * @param {target, map, mapChange}
 */
export default function MapContainer(props) {
  
  const [oldTarget, setOldTarget] = React.useState("");
  const [map, setMap] = React.useState("");

  /**
   * Invoked after the component's state has changed when the
   * target selector passes down a new target name from props.
   */
  useEffect( () => {
    
    if(oldTarget !== ""){
      // remove old map container and append new container to its parent
      let oldContainer = document.getElementById("map-container");
      let parent = oldContainer.parentNode;
      let newContainer = document.createElement("div");
      parent.removeChild(oldContainer);
      newContainer.setAttribute("id", "map-container");
      parent.appendChild(newContainer);

      // remove disabled classes from projection buttons so that the css is reset to default
      document.getElementById("projectionNorthPole").classList.remove("disabled");
      document
        .getElementById("projectionCylindrical")
        .classList.remove("disabled");
      document.getElementById("projectionSouthPole").classList.remove("disabled");

      // remove the old message listener so footprint messages aren't received multiple times.
      map.removeListener();
    }

    // create new map with updated target
    let myMap = new AstroMap("map-container", props.target, props.astroWebMaps, {});
    let controlManager = new AstroControlManager(myMap);
    controlManager.addTo(myMap);

    // Set into states for future reference
    setOldTarget(props.target);
    setMap(myMap);
    
  }, [props.target]);

  return (
    <div id="map-container" />
  );
}
