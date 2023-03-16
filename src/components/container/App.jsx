import React, { useEffect, useState } from "react";
import UsgsHeader from "../presentational/UsgsHeader.jsx";
import UsgsFooter from "../presentational/UsgsFooter.jsx";
import GeoStacApp from "./GeoStacApp.jsx";
import SplashScreen from "../presentational/SplashScreen.jsx";

/**
 * App is the parent component for all of the other components in the project.
 * It loads the data needed to initialize GeoStac.
 * It includes the main GeoStacApp and OCAP compliant headers and footers.
 *
 * @component
 */
export default function App() {

  const [mainComponent, setMainComponent] = useState(() => {
    return(
      <SplashScreen />
    );
  })

  useEffect(() => {

    // Astro Web Maps, has the tile data
    const astroWebMaps =
        "https://astrowebmaps.wr.usgs.gov/webmapatlas/Layers/maps.json";

    // STAC API, has footprint data
    const stacApiCollections = 
        "https://stac.astrogeology.usgs.gov/api/collections";

    // Async tracking
    let fetchStatus = {};
    let fetchPromise = {};
    let jsonPromise = {};

    // Fetched Maps
    var mapsJson = {};

    // Combined Data
    var aggregateMapList = {};

    // Init
    fetchStatus[astroWebMaps] = "Not Started";
    fetchPromise[astroWebMaps] = "Not Started";
    jsonPromise[astroWebMaps] = "Not Started";
    mapsJson[astroWebMaps] = [];

    fetchStatus[stacApiCollections] = "Not Started";
    fetchPromise[stacApiCollections] = "Not Started";
    jsonPromise[stacApiCollections] = "Not Started";
    mapsJson[stacApiCollections] = [];

    // Fetch JSON and read into object
    async function ensureFetched(targetUrl) {
        if(fetchStatus[targetUrl] === "Not Started")
        {
            fetchStatus[targetUrl] = "Started";
            fetchPromise[targetUrl] = fetch(
              targetUrl
            ).then((res)=>{
                jsonPromise[targetUrl] = res.json().then((jsonData)=>{
                    mapsJson[targetUrl] = jsonData;
                }).catch((err)=>{
                    console.log(err);
                });
            }).catch((err) => {
                console.log(err);
            });
        }
        await fetchPromise[targetUrl];
        await jsonPromise[targetUrl];
    }

    // Combine data from Astro Web Maps and STAC API into one new object
    function organizeData(astroWebMaps, stacApiCollections) {
        
        // Initialize Objects
        let mapList = { "systems" : [] };
        let stacList = [];

        // Check for Planets that have STAC footprints from the STAC API
        for (let i = 0; i < stacApiCollections.collections.length; i++) {
            let stacTarget = stacApiCollections.collections[i].summaries["ssys:targets"][0].toLowerCase();
            if(!stacList.find(targetBody => targetBody == stacTarget)){
                stacList.push(stacTarget.toLowerCase());
            }
        }

        // Scan through every target in the Astro Web Maps JSON
        for (const target of astroWebMaps.targets){

            // Check for, add system if system is not in array
            if (!mapList.systems.some(system => system.name === target.system)) {
                mapList.systems.push({
                    "name" : target.system,
                    "naif" : 0,
                    "bodies" : []
                })
            }
            
            // Index of System
            let sysIndex = mapList.systems.map(sys => sys.name).indexOf(target.system);

            // ID the system
            if (target.naif % 100 === 99){
                mapList.systems[sysIndex].naif = target.naif;
            }

            // Check for/add body if not already incl
            if (!mapList.systems[sysIndex].bodies.some(body => body.name === target.name)) {

                // A flag that indicates whether or not the body has footprints
                let hasFootprints = stacList.includes(target.name.toLowerCase())

                // Add STAC collections
                let myCollections = []
                if (hasFootprints) {
                    for (const collection of stacApiCollections.collections){
                        if (target.name == collection.summaries["ssys:targets"][0].toUpperCase()) {
                            myCollections.push(collection);
                        }
                    }
                }

                // Add a body data entry
                mapList.systems[sysIndex].bodies.push({
                    "name" : target.name,
                    "naif" : target.naif,
                    "hasFootprints" : hasFootprints,
                    "aaxisradius": target.aaxisradius,
                    "baxisradius": target.baxisradius,
                    "caxisradius":target.caxisradius,
                    "layers" : {
                        "base" : [],
                        "overlays" : [],
                        "nomenclature" : []
                    },
                    "collections" : myCollections
                })
            }

            // Index of Body
            let bodIndex = mapList.systems[sysIndex].bodies.map(bod => bod.name).indexOf(target.name);

            // Sort through AstroWebMaps to get the right ones for GeoSTAC
            function getWmsMaps(webMaps) {
                let myLayers = {
                    "base" : [],
                    "overlays" : [],
                    "nomenclature" : [],
                    /* "wfs" : [] */
                };

                // Add maps
                for (const wmap of webMaps) {
                    if(wmap.type === "WMS" && wmap.layer != "GENERIC") {
                        if(wmap.transparent == "false") {
                            // Non-transparent layers are base maps
                            myLayers.base.push(wmap);
                        } else if (wmap.layer == "NOMENCLATURE") {
                            // Feature Name Layers
                            myLayers.nomenclature.push(wmap);
                        } else {
                            // OthTransparent layers are overlays
                            myLayers.overlays.push(wmap);
                        }
                    }
                    // else if (wmap.type === "WFS") {
                    //     // Currently in AstroMap but doesn't seem to be used.
                    //     myLayers.wfs.push(wmap);
                    // }
                }
                return myLayers;
            }

            // Add base and overlay maps (but not empty arrays!)
            let myLayers = getWmsMaps(target.webmap);
            if (myLayers.base.length > 0){
                mapList.systems[sysIndex].bodies[bodIndex].layers.base.push(...myLayers.base);
            }
            if (myLayers.nomenclature.length > 0){
                mapList.systems[sysIndex].bodies[bodIndex].layers.nomenclature.push(...myLayers.nomenclature);
            }
            if (myLayers.overlays.length > 0){
                mapList.systems[sysIndex].bodies[bodIndex].layers.overlays.push(...myLayers.overlays);
            }
        }

        // Sort systems by NAIF ID
        mapList.systems.sort((a, b)=>{return a.naif - b.naif})

        // Go through each System
        for (let sysIndex = 0; sysIndex < mapList.systems.length; sysIndex++){

            // Remove bodies with no base maps
            for (let bodIndex = mapList.systems[sysIndex].bodies.length - 1; bodIndex >= 0; bodIndex--){
                if(mapList.systems[sysIndex].bodies[bodIndex].layers.base.length < 1){
                    mapList.systems[sysIndex].bodies.splice(bodIndex, 1);
                }
            }
            // Sort targets by naif id
            mapList.systems[sysIndex].bodies.sort((a, b)=>{
                let valA = a.naif;
                let valB = b.naif;
                if (a.naif % 100 == 99) valA = 0; // Planet IDs end with 99,
                if (b.naif % 100 == 99) valB = 0; // but put them first.
                return valA - valB;
            })
        }

        return mapList;
    }

    // Fetch and organize data from 
    async function getStacAndAstroWebMapsData() {
        // Start fetching from AWM and STAC API concurrently
        ensureFetched(astroWebMaps);
        ensureFetched(stacApiCollections);

        // Wait for both to complete before moving on
        await ensureFetched(astroWebMaps);
        await ensureFetched(stacApiCollections);

        return organizeData(mapsJson[astroWebMaps], mapsJson[stacApiCollections]);
    }

    (async () => {
        aggregateMapList = await getStacAndAstroWebMapsData();
        setMainComponent(<GeoStacApp mapList={aggregateMapList}/>);
    })();

    
  }, [])

  return (
    <>
      <UsgsHeader />
      {mainComponent}
      <UsgsFooter />
    </>
  );
}
