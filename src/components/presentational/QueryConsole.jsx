import React, { useEffect } from "react";
import { alpha } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataObjectIcon from "@mui/icons-material/DataObject";
import Collapse from "@mui/material/Collapse";


let css = {
  consoleButton: {
    width: "auto",
    color: "#000",
    backgroundColor: "#fff",
    justifyContent: "flex-start",
    "&:hover": {
      backgroundColor: alpha("#eee", 0.9)
    }
  },
  consoleSelectLabel: {
    color: "#000",
    "&.MuiInputLabel-shrink": {
      color: "#555",
      backgroundColor: "#FFF",
      paddingLeft: 1,
      paddingRight: 1,
      borderRadius: 2,
    },
    "&.Mui-focused": {
      color: "#FFF",
      backgroundColor: "#1971c2",
      paddingLeft: 1,
      paddingRight: 1,
      borderRadius: 2,
      border: "2px solid white"
    }
  },
  consoleSelect: {
    color: "#000",
    backgroundColor: "#fff",
    marginBottom: 1,
    maxWidth: "165px"
  },
};

/**
 * Component lets user view and use stac queries
 * @component
 * @example
 * <QueryConsole />
 */
export default function QueryConsole(props) {

  const [showConsole, setShowConsole] = React.useState(false);
  const [queryUrl, setQueryUrl] = React.useState(props.queryAddress);

  const queryTextarea = React.useRef(null);

  const handleTextChange = (event) => {
    setQueryUrl(event.target.value);
  }

  const handleOpenCloseConsole = () => {
    setShowConsole(!showConsole);
  }

  const handleCopyClick = () => {
    // queryTextarea.current.select();
    // queryTextarea.current.setSelectionRange(0, 99999); /* For mobile devices */
    navigator.clipboard.writeText(queryUrl);
  }

  const handleJsonClick = () => {
    window.open(queryUrl);
  }

  const handleRunQueryClick = () => {
    props.setQueryAddress(queryUrl);
  }

  useEffect(() => {
    setQueryUrl(props.queryAddress);
  }, [props.queryAddress]);


  return (
    <div id="query-console-container">
        <span id="query-console-title" onClick={handleOpenCloseConsole}>
          {showConsole ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          Query Console
        </span>
      <Collapse id="query-console-expanded" in={showConsole}>
          <div id="query-textarea-container">
            <textarea 
              value={queryUrl} 
              onChange={handleTextChange} 
              id="query-textarea" 
              ref={queryTextarea}
              placeholder="> Type Query Here">
            </textarea>
            <div id="query-command-bar">
              <ButtonGroup
                orientation="vertical"
                size="small"
                variant="contained">
                <Button
                  onClick={handleCopyClick}
                  id="copyCodeButton" 
                  sx={css.consoleButton} 
                  startIcon={<ContentCopyIcon />}>
                    Copy Code
                </Button>
                <Button
                  onClick={handleJsonClick}
                  sx={css.consoleButton}
                  startIcon={<DataObjectIcon/>}>
                    Open JSON
                </Button>
                {/* <Button 
                  onClick={handleRunQueryClick}
                  id="runQueryButton" 
                  sx={css.consoleButton} 
                  startIcon={<PlayArrowIcon />}>
                    Run STAC Query
                </Button> */}
              </ButtonGroup>
            </div>
          </div>
      </Collapse>
    </div>
  );
}
