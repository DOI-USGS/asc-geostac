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

  const [filterString, setFilterString] = React.useState("?");
 
  const showHideSort = () => {
    setShowSidePanel(!showSidePanel);
  };

  // State to hold the selected title
  const [selectedTitle, setSelectedTitle] = React.useState("");

  // Callback function to update selected title
  const updateSelectedTitle = (newTitle) => {
    setSelectedTitle(newTitle);
  };

  // State to hold the seleced queryables
  let [updatedQueryableTitles, setUpdatedQueryableTitles] = React.useState("");

  // Callback to update selected queryables
  const UpdateQueryableTitles = (selectedQueryables) => {

    updatedQueryableTitles = selectedQueryables;
    setUpdatedQueryableTitles(selectedQueryables)
    console.log("Selected Queryables: ", selectedQueryables);
  }
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
            setFilterString={setFilterString}
            targetName={props.target.name}
            target={props.target}
            selectedTitle={selectedTitle} 
            UpdateQueryableTitles = {UpdateQueryableTitles}
          />
          <FootprintResults
            target={props.target} 
            filterString={filterString}
            queryAddress={props.queryAddress}
            setQueryAddress={props.setQueryAddress}
            updateSelectedTitle={updateSelectedTitle} 
            selectedQueryables = {updatedQueryableTitles}
          />
        </Collapse>
      </div>
    </>
  );
}
