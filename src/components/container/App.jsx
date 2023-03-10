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
    let fetchStatus = {}
    let fetchPromise = {}
    let jsonPromise = {}

    // Fetched Maps
    var mapsJson = {}

    // Combined Data
    var aggregateMapList = {}

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
            fetchStatus[targetUrl] = "Started"
            fetchPromise[targetUrl] = fetch(
              targetUrl
            ).then((res)=>{
                jsonPromise[targetUrl] = res.json().then((jsonData)=>{
                    mapsJson[targetUrl] = jsonData;
                }).catch((err)=>{
                    console.log(err)
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
            if (stacApiCollections.collections[i].hasOwnProperty("summaries")){
                let stacTarget = stacApiCollections.collections[i].summaries["ssys:targets"][0].toLowerCase();
                if(!stacList.find(targetBody => targetBody == stacTarget)){
                    stacList.push(stacTarget.toLowerCase());
                }
            }
        }

        for (const target of astroWebMaps.targets){

            // Check for/add system
            if (!mapList.systems.some(system => system.name === target.system)) {
                mapList.systems.push({
                    "name" : target.system,
                    "bodies" : []
                })
            }
            
            // Index of System
            let sysIndex = mapList.systems.map(sys => sys.name).indexOf(target.system);

            // Check for/add body
            if (!mapList.systems[sysIndex].bodies.some(body => body.name === target.name)) {

                // A flag that indicates whether or not the body has footprints
                let hasFootprints = stacList.includes(target.name.toLowerCase())

                mapList.systems[sysIndex].bodies.push({
                    "name" : target.name,
                    "has-footprints" : hasFootprints,
                    "maps" : []
                })
            }

            // Index of Body
            let bodIndex = mapList.systems[sysIndex].bodies.map(bod => bod.name).indexOf(target.name);

            // Add maps
            for (const wmap of target.webmap) {
                mapList.systems[sysIndex].bodies[bodIndex].maps.push(wmap.displayname);
                // More properties?
            }

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
