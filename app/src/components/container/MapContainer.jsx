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

  /**
   * Invoked when the component is successfully mounted to the DOM, then
   * handles all of the map intialization and creation.
   */
  useEffect( () => {
    let map = new AstroMap("map-container", props.target, {});
    let controlManager = new AstroControlManager(map);
    controlManager.addTo(map);
    setOldTarget(props.target)
  }, []);

  /**
   * Invoked after the component's state has changed when the
   * target selector passes down a new target name from props.
   */
  useEffect( () => {
    if (props.target != oldTarget ) {
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

      // create new map with updated target
      let map = new AstroMap("map-container", props.target, {});
      let controlManager = new AstroControlManager(map);
      controlManager.addTo(map);
      setOldTarget(props.target)
    }
  });

  return (
    <div id="map-container" />
  );
}
