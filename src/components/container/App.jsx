import React, { useEffect, useState } from "react";
import UsgsHeader from "../presentational/UsgsHeader.jsx";
import UsgsFooter from "../presentational/UsgsFooter.jsx";
import Menubar from "../presentational/Menubar.jsx";
import GeoStacApp from "./GeoStacApp.jsx";
import SplashScreen from "../presentational/SplashScreen.jsx";
import Initialize from "../../js/FetchData.js";

/**
 * App is the parent component for all of the other components in the project.
 * It fetches and parses the data needed to initialize GeoStac.
 * It includes the main GeoStacApp and OCAP compliant headers and footers.
 *
 * @component
 */
export default function App() {

  const [showHeaderFooter, setShowHeaderFooter] = React.useState(true);

  const handleOpenCloseHeader = () => {
    setShowHeaderFooter(!showHeaderFooter);
  }

  const [mainComponent, setMainComponent] = useState(() => {
    return(
      <SplashScreen />
    );
  })

  useEffect(() => {
    (async () => {
        let initialData = await Initialize();
        setMainComponent(
            <GeoStacApp 
                mapList={initialData.aggregateMapList}
                astroWebMaps={initialData.astroWebMaps}
                showHeaderFooter={showHeaderFooter}
                setShowHeaderFooter={setShowHeaderFooter}
            />);
    })();
  }, [])

  return (
    <>
      <UsgsHeader visible={showHeaderFooter}/>
      <Menubar
        showHeaderFooter={showHeaderFooter}
        handleOpenCloseHeader={handleOpenCloseHeader}
      />
      {mainComponent}
      <UsgsFooter visible={showHeaderFooter}/>
    </>
  );
}
