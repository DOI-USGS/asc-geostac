import React from "react";
import SearchAndFilterInput from "./SearchAndFilterInput.jsx";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import FootprintResults from "./FootprintResults.jsx";
import {
  createHtmlPortalNode,
  InPortal,
  OutPortal,
} from "react-reverse-portal";

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

  // Layout
  const [showSidePanel, setShowSidePanel] = React.useState(true);
  const [expandResults, setExpandResults] = React.useState(true);
 
  const showHideSort = () => {
    setShowSidePanel(!showSidePanel);
  };

  const handlePanelLayout = (event) => {
    setExpandResults((expandResults) => !expandResults);
  };

  const footprintResultPortalNode = React.useMemo(
    () =>
      createHtmlPortalNode({
        attributes: {
          style: "min-height: 0; display: flex;",
        },
      }),
    []
  );

  return (
    <>
      <div id="right-bar" className="scroll-parent">
        <div id="sidebar-collapsed" onClick={showHideSort}>
          <ArrowLeftIcon />
          Sort and Filter
          <ArrowLeftIcon />
        </div>
        <div
          style={showSidePanel ? css.stacked : css.hidden}
          className="scroll-parent"
        >
          <SearchAndFilterInput
            setQueryString={props.setQueryString}
          />
          {!expandResults && <OutPortal node={footprintResultPortalNode} />}
        </div>
        {expandResults && showSidePanel && (
          <OutPortal node={footprintResultPortalNode} />
        )}
      </div>
      <InPortal node={footprintResultPortalNode}>
        <FootprintResults 
          target={props.target} 
          queryString={props.queryString} 
          changeLayout={handlePanelLayout} 
          setCollectionUrls={props.setCollectionUrls}
        />
      </InPortal>
    </>
  );
}
