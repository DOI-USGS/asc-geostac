import L from "leaflet";
import "leaflet-draw";
import Wkt from "wicket";
import {getCurrentPage} from "./ApiJsonCollection";

/**
 * @class AstroDrawFilterControl
 * @aka L.Control.AstroDrawFilterControl
 * @extends L.Control
 * @classdesc
 * Class that extends from the class L.Control.Draw and handles the back-end when a user draws on the leaflet map.
 * Since this class inherits L.Control, it is added to the AstroMap in the same way as other controls, like the zoom control.
 *
 * @example
 *
 * // add a feature group to the map
 * let drawnItems = new L.FeatureGroup();
 * map.addLayer(drawnItems);
 *
 * // add draw control to map
 * let drawControl = new AstroDrawFilterControl({
 *   edit: {
 *      featureGroup: drawnItems
 *   }
 * }).addTo(map);
 */
export default L.Control.AstroDrawFilterControl = L.Control.Draw.extend({
  options: {
    draw: {
      circle: false,
      marker: false,
      circlemarker: false,
      polyline: false,
      polygon:false },
      edit: false
  },

  /**
   * @function AstroDrawFilterControl.prototype.onAdd
   * @description Adds the draw control to the map provided. Creates an on-draw and on-click event
   *              that allows users to draw polygons onto the leaflet map.
   * @param  {AstroMap} map - The AstroMap to add the control to.
   * @return {Object} The div-container the control is in.
   */
  onAdd: function(map) {
    this._map = map;
    let container = L.DomUtil.create("div", "leaflet-draw"),
      addedTopClass = false,
      topClassName = "leaflet-draw-toolbar-top",
      toolbarContainer;

    for (let toolbarId in this._toolbars) {
      if (this._toolbars.hasOwnProperty(toolbarId)) {
        toolbarContainer = this._toolbars[toolbarId].addToolbar(map);

        if (toolbarContainer) {
          if (!addedTopClass) {
            if (!L.DomUtil.hasClass(toolbarContainer, topClassName)) {
              L.DomUtil.addClass(toolbarContainer.childNodes[0], topClassName);
            }
            addedTopClass = true;
          }

          container.appendChild(toolbarContainer);
        }
      }
    }
    this.queryTextBox = L.DomUtil.get("query-textarea");

    this.wkt = new Wkt.Wkt();
    this.myLayer = L.Proj.geoJson().addTo(map);

    // Add listener for window message from FootprintResults.jsx, which has Feature Collections
    L.DomEvent.on(window, "message", this.refreshFeatures, this);
    L.DomEvent.on(L.DomUtil.get("copyCodeButton"), "click", this.copyToClipboard, this);


    map.on("draw:created", this.shapesToWKT, this);

    return container;
  },

  /**
  * @function AstroDrawFilterControl.copyToClipboard
  * @description Copies query string in the query console to clipboard
  */
  copyToClipboard: function(){
    /* Get the text field */
    var copyText = document.getElementById("query-textarea");

    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */

    navigator.clipboard.writeText(copyText.value);
  },

  /**
   * @function AstroDrawFilterControl.prototype.shapesToWKT
   * @description Is called when a user draws a shape using the on map drawing features.
   *              Converts the shaped drawn into a Well-Known text string.
   * @param  {DomEvent} e  - On draw.
   */
  shapesToWKT: function(e) {
    this.myLayer.clearLayers();
    this.options.edit["featureGroup"].clearLayers();

    this.options.edit["featureGroup"].addLayer(e.layer);
    let geoJson = e.layer.toGeoJSON();
    geoJson = geoJson["geometry"];

    this.wkt.read(JSON.stringify(geoJson));
    window.postMessage(["setWkt", this.shapesToFootprint(this.wkt.components[0])], "*");
  },

  /**
  * @function AstroDrawFilterControl.clearMap
  * @description clears the layers on map
  */
  clearMap: function() {
    this._map._footprintControl.remove();
    for(let i = 0; i < this._map._geoLayers.length; i++){
      this._map._geoLayers[i].clearLayers();
    }
  },


  /**
   * @function shapesToFootprint
   * @description Is called when a user draws a shape using the on map drawing features.
   *              Renders all footprints that intersect the drawn area.
   *
   * @param {String} coords - The drawn shape’s coordinates.
   */
  shapesToFootprint: function(coords) {
    let qstr = "";
    for (let i=0; i< coords.length; i++){

      qstr += coords[i]['x'] + " " + coords[i]['y']
      if (i < coords.length -1)
        qstr +=","
    }

    let strArr = qstr.split(",");
    let bboxCoordArr = [];

    for (let i = 0; i < strArr.length -1; i++) {
      if (i != 1) {
        let temp = strArr[i].split(" ");
        bboxCoordArr.push([parseFloat(temp[0]), parseFloat(temp[1])]);
      }
    }
    let bboxArr = [
      bboxCoordArr[0][0],
      bboxCoordArr[0][1],
      bboxCoordArr[1][0],
      bboxCoordArr[1][1]
    ];
    let queryString = "bbox=" + bboxArr;
    return queryString;
  },

  /**
   * @function refreshFeatures
   * @description Clears map and shows features revceived via window message event.
   *
   * @param {object} event - The window message event received.
   */
  refreshFeatures: function(event) {
    if(typeof event.data == "object" && event.data[0] === "setFeatureCollections") {
      const receivedCollections = event.data[1];

      // re render map
      if(this._map._footprintControl) {
        this._map._footprintControl.remove();
      }
      
      for(let i = 0; i < this._map._geoLayers.length; i++){
        this._map._geoLayers[i].clearLayers();
      }
      this._map.loadFeatureCollections(receivedCollections);
    }
  }
});
