import React from "react";
import UsgsHeader from "../presentational/UsgsHeader.jsx";
import UsgsFooter from "../presentational/UsgsFooter.jsx";
import GeoStacApp from "./GeoStacApp.jsx";

/**
 * App is the parent component for all of the other components in the project.
 * It includes the main GeoStacApp and OCAP compliant headers and footers.
 *
 * @component
 */
export default function App() {
  return (
    <>
      <UsgsHeader />
      <GeoStacApp />
      <UsgsFooter />
    </>
  );
}
