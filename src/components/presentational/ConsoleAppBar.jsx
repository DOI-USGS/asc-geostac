import React from "react";
import ConsoleTargetInfo from "../presentational/ConsoleTargetInfo.jsx";
import ConsoleProjectionButtons from "../presentational/ConsoleProjectionButtons.jsx";
import ConsoleLonLatSelects from "../presentational/ConsoleLonLatSelects.jsx";
import ConsoleCoordinates from "./ConsoleCoordinates.jsx";
import Divider from "@mui/material/Divider";

/**
 * Controls css styling for this component using js to css
 */
let css = {
  appbar: {
    background: "#f8f9fa",
  },
};

/**
 * Main component of the console, which arranges all subcomponents into a grid
 * and passes in target information via props.
 *
 * @component
 */
export default function ConsoleAppBar(props) {
  return (
    <div className="flexbar">
      <div className="flexbar-item">
        <ConsoleTargetInfo
          target={props.target}
          bodyChange={props.bodyChange}
        />
      </div>
      <div className="flexbar-item">
        <ConsoleCoordinates />
      </div>
      <div className="flexbar-item">
        <ConsoleProjectionButtons />
      </div>
      <div className="flexbar-item">
        <ConsoleLonLatSelects />
      </div>
    </div>
  );
}
