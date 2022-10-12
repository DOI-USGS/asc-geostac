import React from "react";
import SearchAndFilterInput from "./SearchAndFilterInput.jsx";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import FootprintResults from "./FootprintResults.jsx";

const css = {
  expanded: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    background: "#f8f9fa",
  },
  stacked: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    background: "#f8f9fa",
  },
  hidden: {
    display: "none",
  },
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
  const [showSidePanel, setShowSidePanel] = React.useState(true);
  const [sidePanelSubStyle, setSidePanelSubStyle] = React.useState(css.shown);

  const [expandResults, setExpandResults] = React.useState(true);

  const showHideSort = () => {
    setShowSidePanel(!showSidePanel);
  };

  const handlePanelLayout = (event) => {
    setExpandResults((expandResults) => !expandResults);
  };

  if (showSidePanel) {
    if (expandResults) {
      return (
        <div id="right-bar" className="scroll-parent">
          <div id="sidebar-collapsed" onClick={showHideSort}>
            <ArrowLeftIcon />
            Sort and Filter
            <ArrowLeftIcon />
          </div>
          <SearchAndFilterInput
            target={props.target}
            footprintNavClick={props.footprintNavClick}
          />
          <FootprintResults changeLayout={handlePanelLayout} />
        </div>
      );
    }
    return (
      <div id="right-bar" className="scroll-parent">
        <div id="sidebar-collapsed" onClick={showHideSort}>
          <ArrowLeftIcon />
          Sort and Filter
          <ArrowLeftIcon />
        </div>
        <div style={css.stacked} className="scroll-parent">
          <SearchAndFilterInput
            target={props.target}
            footprintNavClick={props.footprintNavClick}
          />
          <FootprintResults changeLayout={handlePanelLayout} />
        </div>
      </div>
    );
  }

  return (
    <div id="right-bar" className="scroll-parent">
      <div id="sidebar-collapsed" onClick={showHideSort}>
        <ArrowLeftIcon />
        Sort and Filter
        <ArrowLeftIcon />
      </div>
      <div style={css.hidden} className="scroll-parent">
        <SearchAndFilterInput
          target={props.target}
          footprintNavClick={props.footprintNavClick}
        />
        <FootprintResults changeLayout={handlePanelLayout} />
      </div>
    </div>
  );
}
