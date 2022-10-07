import React from "react";
import GeoTiffViewer from "../../js/geoTiffViewer.js";

export default function DisplayGeoTiff() {
  const geoTiffViewer = new GeoTiffViewer("");

  return (
    <div>
      <div id="GeoTiffModal">
        <div id="GeoTiffModalHeader">
          <div id="GeoTiffTitle">Metadata:</div>
          <button id="GeoTiffCloseButton" onClick={geoTiffViewer.closeModal}>
            &times;
          </button>
        </div>
        <div id="GeoTiffAssetsDiv">
          <center>
            <img id="GeoTiffAsset"></img>
          </center>
        </div>
        <div id="GeoTiffModalFooter">
          <div className="resultSub" id="GeoTiffCollection"></div>
          <div className="resultSub" id="GeoTiffID"></div>
          <div className="resultSub" id="GeoTiffDate"></div>
          <div className="resultSub" id="Assets"></div>
        </div>
      </div>
      <div id="GeoTiffOverlay"></div>
    </div>
  );
}
