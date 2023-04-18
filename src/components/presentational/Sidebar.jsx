import React from "react";
import SearchAndFilterInput from "./SearchAndFilterInput.jsx";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import FootprintResults from "./FootprintResults.jsx";
import { Tab, Tabs, Collapse } from "@mui/material";
import {
  createHtmlPortalNode,
  InPortal,
  OutPortal,
} from "react-reverse-portal";

const css = {
  stacked: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    background: "#f8f9fa",
    minHeight: 0,
    "& .MuiCollapse-wrapperInner": { 
      display: "flex",
      flexDirection: "column"
    }
  }
};

/**
 * Sidebar holds most of the controls to search and view footprints.
 * It contains the sort and filter panel, as well as the footprint
 * results list.  It has controls that allow its layout to expand
 * or collapse.
 *
 * @component
 */
export default function Sidebar(props) {

  // Layout
  const [showSidePanel, setShowSidePanel] = React.useState(true);
 
  const showHideSort = () => {
    setShowSidePanel(!showSidePanel);
  };

  return (
    <>
      <div id="right-bar" className="scroll-parent">
        <div id="sidebar-collapsed" onClick={showHideSort}>
          {showSidePanel ? <ArrowLeftIcon /> : <ArrowRightIcon/>}
          Footprints
          {showSidePanel ? <ArrowLeftIcon /> : <ArrowRightIcon/>}
        </div>
        <Collapse orientation="horizontal" sx={css.stacked} in={showSidePanel}>
          <SearchAndFilterInput
            setQueryString={props.setQueryString}
          />
          <FootprintResults 
            target={props.target} 
            queryString={props.queryString}
          />
        </Collapse>
      </div>
    </>
  );
}
