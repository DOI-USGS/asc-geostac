import L from "leaflet";
import "proj4leaflet";
import AstroProj from "./AstroProj";
import LayerCollection from "./LayerCollection";
import SLDText from "../slds/Global_Contacts.sld";


/**
 * @class AstroMap
 * @aka L.Map.AstroMap
 * @extends L.Map
 *
 * @classdesc
 * The central class that creates an interactive map in the HTML.
 * Works with all target bodies supported by the USGS by loading the body's
 * base layers and overlays in a LayerCollection. Allows users to change
 * the projection of the map.
 *
 * @example
 * // initialize the map on the "map" div with the target Mars
 * L.Map.AstroMap("map", "Mars", {});
 *
 * @param {String} mapDiv - ID of the div for the map.
 *
 * @param {String} target - Name of target to display layers for.
 *
 * @param {Object} myJsonMaps - Json fetched from AstroWebMaps
 *
 * @param {Object} options - Options for the map.
 */
export default L.Map.AstroMap = L.Map.extend({
  options: {
    center: [0, 180],
    zoom: 1,
    maxZoom: 8,
    attributionControl: false,
    zoomControl: false,
    worldCopyJump: true // Jumps back to the other side of the map if the
                        // user scrolls too far, as if the map is wrapping.
  },

  initialize: function(mapDiv, target, jsonMaps, options) {

    this._mapDiv = mapDiv;
    this._target = target;
    this._jsonMaps = jsonMaps;
    this._astroProj = new AstroProj();
    this._radii = {
      a: "",
      c: ""
    };
    this._footprintCollection = {};
    this._footprintControl = null;
    this._geoLayers = [];
    this._htmllegend = null;
    this._hovHighlight = null;

    // Set by layer collection or baselayerchange event
    this._currentLayer = null;

    this.SLDStyler = new L.SLDStyler(SLDText);


    // Store layers at map creation so we only need to create layers once.
    let cylLayerInfo = this.parseJSON("cylindrical");
    if (Object.entries(cylLayerInfo["base"]).length == 0) {
      throw "No entry in the JSON for [" +
        this._target +
        "]. Cannot instantiate a map.";
    }

    // Could not work with _
    this.layers = {
      cylindrical: new LayerCollection("cylindrical", cylLayerInfo)
    };

    let northLayerInfo = this.parseJSON("north-polar stereographic");
    if (Object.entries(northLayerInfo["base"]).length == 0) {
      this._hasNorthPolar = false;
    } else {
      this._hasNorthPolar = true;
      this.layers["northPolar"] = new LayerCollection(
        "north-polar stereographic",
        northLayerInfo
      );
    }

    let southLayerInfo = this.parseJSON("south-polar stereographic");
    if (Object.entries(southLayerInfo["base"]).length == 0) {
      this._hasSouthPolar = false;
    } else {
      this._hasSouthPolar = true;
      this.layers["southPolar"] = new LayerCollection(
        "south-polar stereographic",
        southLayerInfo
      );
    }

    this._defaultProj = L.extend({}, L.CRS.EPSG4326, { R: this._radii["a"] });
    this.options["crs"] = this._defaultProj;
    this._currentProj = "EPSG:4326";

    L.setOptions(this, options);
    L.Map.prototype.initialize.call(this, this._mapDiv, this.options);
    this.loadLayerCollection("cylindrical");

    // Listen to baselayerchange event so that we can set the current layer being
    // viewed by the map.
    this.on("baselayerchange", function(e) {
      this.setCurrentLayer(e["layer"]);
    });

    // Add listener for window message from FootprintResults.jsx, which has Feature Collections
    L.DomEvent.on(window, "message", this.interpretMessage, this);

    // Resize Observer (so the map knows the size of the window/canvas)
    const mapDivEl = document.getElementById(mapDiv);
    const resizeObserver = new ResizeObserver(() => {
      this.invalidateSize();
    });

    resizeObserver.observe(mapDivEl);
  },

  /**
   * @function AstroMap.prototype.loadLayerCollection
   * @description Adds the LayerCollection with the requested name.
   *
   * @param {String} name - Name of the projection.
   */
  loadLayerCollection: function(name) {
    this.layers[name].addTo(this);
  },

  interpretMessage: function(event) {
    if(typeof event.data == "object"){
      if (event.data[0] === "setFeatureCollections") {
        const visibleCollectionId = event.data[1];
        const receivedCollections = event.data[2];
        this.refreshFeatures(visibleCollectionId, receivedCollections);
      }
      else if (event.data[0] === "addFeaturesToCollection") {
        const collectionId = event.data[1];
        const myFeatures = event.data[2];
        this.addFeaturesToCollection(collectionId, myFeatures);
      }
      else if (event.data[0] === "setVisibleCollections") {
        const collectionId = event.data[1];
        this.setVisibleCollections(collectionId);
      }
      else if (event.data[0] === "zoomFootprint") {
        const feature = event.data[1];
        this.zoomFootprint(feature);
      }
      else if (event.data[0] === "highlightFootprint") {
        const feature = event.data[1];
        this.highlightFootprint(feature);
      }
      else if (event.data[0] === "unhighlightFootprint") {
        if (this._hovHighlight) {
          this._hovHighlight.remove();
        }
      }
    }
  },

  removeListener: function() {
    L.DomEvent.off(window, "message", this.interpretMessage, this);
  },

  cloneWestEast: function(myFeatures) {

    let clonedFeatures = [];

    // Clone Features to west and east. For each feature...
    for(const feature of myFeatures) {

      // Check if feature or feature.geometry is null or undefined
      if(!feature || !feature.geometry){
        console.warn("Invalid feature or missing geometry: ", feature);
        continue;
      }

      // Clone it
      let westCopy = structuredClone(feature);
      let eastCopy = structuredClone(feature);

      // Shift clones to the west and east 360 degrees, for a wrapping effect
      // Note: Only supports polygons and multipolygons... Do we have other geometry types?
      if(feature.geometry.type === "Polygon"){
        westCopy.geometry.coordinates[0] = feature.geometry.coordinates[0].map(c => [c[0]-360, c[1]]);
        eastCopy.geometry.coordinates[0] = feature.geometry.coordinates[0].map(c => [c[0]+360, c[1]]);
      }
      else if (feature.geometry.type === "MultiPolygon") {
        westCopy.geometry.coordinates[0][0] = feature.geometry.coordinates[0][0].map(c => [c[0]-360, c[1]]);
        eastCopy.geometry.coordinates[0][0] = feature.geometry.coordinates[0][0].map(c => [c[0]+360, c[1]]);
      }

      clonedFeatures.push(...[westCopy, feature, eastCopy]);
    }
    return clonedFeatures;
  },

  zoomFootprint: function (feature) {
    let zoomTarget = L.geoJSON(feature);
    this.fitBounds(zoomTarget.getBounds());
  },

  highlightFootprint: function(feature){

    if(this._hovHighlight) {
      this._hovHighlight.remove();
    }

    // Add Wrap?

    // Add feature to (this) map
    this._hovHighlight = L.geoJSON(feature, {
      style: { fillColor: "#FFFFFF", color: "#FFFFFF" }
    }).addTo(this);
  },

  setVisibleCollections: function(collectionId){
    for(let i = 0; i < this._geoLayers.length; i++) {
      if(this._geoLayers[i]){
        // Add layers to map if they should be visible
        if(this._geoLayers[i].options.id === collectionId) {
          this._geoLayers[i].addTo(this);
          this.SLDStyler.symbolize_with_icons(this._geoLayers[i], this);
        } else {
          this._geoLayers[i].removeFrom(this);
        }
      }
    }
  },

  addFeaturesToCollection: function(collectionId, myFeatures) {
    for(let i = 0; i < this._geoLayers.length; i++) {
      if(this._geoLayers[i] && this._geoLayers[i].options.id === collectionId){
        let wrappedFeatures = this.cloneWestEast(myFeatures);
        this._geoLayers[i].addData(wrappedFeatures);
        this.SLDStyler.remove_symbols(this);
        this.SLDStyler.symbolize_with_icons(this._geoLayers[i], this);
      }
    }
  },

  // show thumbnail on map when clicked - use stac-layer for this?
  handleClick: function(e) {
    console.log(e)
    if(!e) {
      let url_to_stac_item = e.layer.feature.links[0].href;
      console.log (url_to_stac_item);
   }
    // fetch(url_to_stac_item).then(res => res.json()).then(async feature => {
    //   const thumbnail = await L.stacLayer(feature, {displayPreview: true});
    //   thumbnail.on("click", e => {
    //     this.removeLayer(thumbnail);
    //   })
    //   thumbnail.addTo(this);
    // });
  },

  /**
   * @function AstroMap.prototype.loadFeatureCollection
   * @description Adds Feature Collections to map.
   *
   * @param {object} featureCollections - Feature Collections
   *
   */
  refreshFeatures: function(visibleCollectionId, collectionsObj) {

    // Will we need more than 6 colors for more than 6 different collections?
    let colors =      [ "#17A398", "#EE6C4D", "#662C91", "#F3DE2C", "#33312E", "#0267C1" ];
    let lightcolors = [ "#3DE3D5", "#F49C86", "#9958CC", "#F7E96F", "#DDDDDD", "#2A9BFD" ];
    // Old, removes separate control
    // if(this._footprintControl) {
    //   this._footprintControl.remove();
    // }

    // removes layers previously loaded
    for(let i = 0; i < this._geoLayers.length; i++){
      if(this._geoLayers[i]) {
        L.LayerCollection.layerControl.removeLayer(this._geoLayers[i]);
        this._geoLayers[i].clearLayers();
      }
    }

    // initialize featureCollection as an array
    // (convert obj passed from FootprintResults.jsx)
    let featureCollections = [];
    for(const key in collectionsObj) {
      featureCollections.push(collectionsObj[key]);
    }

    if (featureCollections != []) {

      // Init _geoLayers, at the length of one layer per collection
      this._geoLayers = new Array(featureCollections.length);

      // For each Collection (and each geoLayer)
      for (let i = 0; i < featureCollections.length; i++) {

        let title = featureCollections[i].title;

        // Add each _geoLayer that has footprints to the FootprintCollection object.
        // The collection title is used as the property name
        // [old] and it shows up as the layer title when added to the separate Leaflet control
        if(featureCollections[i].features.length > 0) {

          // Set colors if available
          //let myStyle = i < colors.length ? {fillColor: colors[i], color: lightcolors[i]} : {};

          // Wrap features
          let wrappedFeatures = this.cloneWestEast(featureCollections[i].features);

          this._geoLayers[i] = L.geoJSON(wrappedFeatures, {
            id: featureCollections[i].id,
            style: this.SLDStyler.getStyleFunction()
          })

          this._geoLayers[i].on({click: this.handleClick});  // Add click listener

          // Add layers to map if they should be visible
          if(featureCollections[i].id === visibleCollectionId) {
            this._geoLayers[i].addTo(this);
            this.SLDStyler.symbolize_with_icons(this._geoLayers[i], this);
          }

          this._footprintCollection[title] = this._geoLayers[i];

          // Add collections to the Overlay control
          L.LayerCollection.layerControl.addOverlay(this._footprintCollection[title], title);
        }
        else if(this._geoLayers[i]) {
          delete this._footprintCollection[title]; // Delete layers with no Footprints
        }
      }

      // Add collections to a separate control
      // this._footprintControl = L.control                          // 1. Make a leaflet control
      // .layers(null, this._footprintCollection, {collapsed: true}) // 2. Add the footprint collections to the control as layers
      // .addTo(this)                                                // 3. Add the control to leaflet.
                                                                     // Now the user can show/hide layers (and see their titles)
    }
  },

  /**
   * @function AstroMap.prototype.parseJSON
   * @description Parses the USGS JSON, creates layer objects for a particular target and projection,
   *              and stores them in a JS object.
   * @param {String} [projection - Name of the projection to grab the layer information for.
   * @return {Object} - Dictionary containing the layer information in the format: {base: [], overlays: []}
   */
  parseJSON: function(projection) {
    let layers = {
      base: [],
      overlays: [],
      nomenclature: [],
      wfs: []
    };

    let targets = this._jsonMaps["targets"];
    for (let i = 0; i < targets.length; i++) {
      let currentTarget = targets[i];

      if (currentTarget["name"].toLowerCase() == this._target.toLowerCase()) {
        this._radii["a"] = parseFloat(currentTarget["aaxisradius"] * 1000);
        this._radii["c"] = parseFloat(currentTarget["caxisradius"] * 1000);
        let jsonLayers = currentTarget["webmap"];
        for (let j = 0; j < jsonLayers.length; j++) {
          let currentLayer = jsonLayers[j];
          if (
            currentLayer["projection"].toLowerCase() != projection.toLowerCase()
          ) {
            continue;
          }
          if (currentLayer["type"] == "WMS") {
            // Base layer check
            if (currentLayer["transparent"] == "false") {
              layers["base"].push(currentLayer);
            } else {
              // Do not add "Show Feature Names" PNG layer.
              if (currentLayer["displayname"] != "Show Feature Names") {
                layers["overlays"].push(currentLayer);
              } else {
                if(currentLayer["layer"] == "NOMENCLATURE"){
                  layers["nomenclature"].push(currentLayer);
                }
              }
            }
          } else {
            layers["wfs"].push(currentLayer);
          }
        }
      }
    }
    return layers;
  },

  /**
   * @function AstroMap.prototype.changeProjection
   * @description Changes the projection of the map and resets the center and view.
   *
   * @param {String} name - Name of Projection.
   *
   * @param {List} center - Center of map based off of projection.
   */
  changeProjection: function(name, center) {
    if (this._currentProj == "EPSG:4326") {
      // Reset the view before changing the projection since
      // an exception may be thrown when swapping to a polar
      // projection from cylindrcal and the zoom level is 7+.
      // proj has trouble unprojecting points in cylindrical
      // at such a high zoom level.
      this.setView(center, 1, true);
    }
    this.options.center = center;
    let newCRS = null;
    if (name == "cylindrical") {
      newCRS = this._defaultProj;
      this._currentProj = "EPSG:4326";
      this.setMaxZoom(8);
    } else {
      let proj = this._astroProj.getStringAndCode(name, this._radii);
      newCRS = new L.Proj.CRS(proj["code"], proj["string"], {
        resolutions: [8192, 4096, 2048, 1024, 512, 256, 128]
      });
      this._currentProj = proj["code"];
      this.setMaxZoom(6);
    }
    this.options.crs = newCRS;

    // Reset the view again because the map refreshses after changing
    // the projection and you start to zoom in/out. This makes the map do a
    // weird flashing transition.
    this.setView(center, 1, true);
    this.loadLayerCollection(name);

    // this.fire("projChange", { proj: this._currentProj });
  },

  /**
   * @function AstroMap.prototype.hasNorthPolar
   * @description Checks if the map has a layer collection for northPolar.
   *
   * @return {Boolean} Returns true if there is a northPolar collection.
   */
  hasNorthPolar: function() {
    return this._hasNorthPolar;
  },

  /**
   * @function AstroMap.prototype.hasSouthPolar
   * @description Checks if the map has a layer collection for southPolar.
   *
   * @return {Boolean} Returns true if there is a southPolar collection.
   */
  hasSouthPolar: function() {
    return this._hasSouthPolar;
  },

  /**
   * @function AstroMap.prototype.target
   * @description Returns the name of the target.
   *
   * @return {String} Name of target.
   */
  target: function() {
    return this._target;
  },

  /**
   * @function AstroMap.prototype.projection
   * @description Returns the name of the current projection of the map.
   *
   * @return {String} Proj-code of the projection.
   */
  projection: function() {
    return this._currentProj;
  },

  /**
   * @function AstroMap.prototype.setCurrentLayer
   * @description Sets the value of the current layer of the map.
   *          Set by the LayerCollection in the onAdd method.
   */
  setCurrentLayer: function(layer) {
    this._currentLayer = layer;
  },

  /**
   * @function AstroMap.prototype.currentLayer
   * @description Returns the current layer of the map. Used by the LayerCollection
   *          so that it can remove the layer of the map without having to
   *          remove all layers, including drawn shapes.
   *
   * @return {L.Layer} Current layer of the map.
   */
  currentLayer: function() {
    return this._currentLayer;
  },

  /**
   * @function AstroMap.prototype.radii
   * @description Returns the a and c radii of the target.
   *
   * @return {Dictionary} Radii of target in form {'a': . 'c': }.
   */
  radii: function() {
    return this._radii;
  },

  /**
   * @function AstroMap.prototype.center
   * @description getter method to access the center of the map.
   *
   * @return {LatLng} The center coordinates of the map.
   */
  center: function() {
    return this.options.center;
  }
});
