import React, { useEffect } from "react";
import { alpha } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Collapse, FormControl, InputLabel, MenuItem, Select } from "@mui/material";


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
  const [selectedUrl, setSelectedUrl] = React.useState("");
  const [queryUrl, setQueryUrl] = React.useState(props.queryString);

  const handleTextChange = (event) => {
    setQueryUrl(event.target.value);
  }

  const handleOpenCloseConsole = () => {
    setShowConsole(!showConsole);
  }

  const handleSelectedUrlChange = (event) => {
    setSelectedUrl(event.target.value);
  }

  const handleRunQueryClick = () => {
    const newQuery = queryUrl.split("?")[1];
    if(typeof newQuery !== 'undefined'){
      props.setQueryString("?" + queryUrl.split("?")[1]);
    }
  }

  useEffect(() => {
    setQueryUrl(selectedUrl + props.queryString);
  }, [selectedUrl, props.queryString]);


  return (
    <div id="query-console-container">
      <div id="query-console-collapsed" onClick={handleOpenCloseConsole}>
        <span id="query-console-title">
          {showConsole ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          Query Console
        </span>
      </div>
      <Collapse id="query-console-expanded" in={showConsole}>
          <div id="query-textarea-container">
            <textarea 
              value={queryUrl} 
              onChange={handleTextChange} 
              id="query-textarea" 
              placeholder="> Type Query Here">
            </textarea>
            <div id="query-command-bar">
              <FormControl>
                <InputLabel size="small" sx={css.consoleSelectLabel}>Set Collection...</InputLabel>
                  <Select 
                    labelId="collection-select" 
                    size="small" 
                    sx={css.consoleSelect}
                    value={selectedUrl}
                    onChange={handleSelectedUrlChange}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {props.collectionUrls.map((myUrl) => (
                      <MenuItem value={myUrl.itemsUrl} key={myUrl.title}>{myUrl.title}</MenuItem>
                    ))}
                  </Select>
                <ButtonGroup
                  orientation="vertical"
                  size="small"
                  variant="contained">
                  
                  <Button id="copyCodeButton" sx={css.consoleButton} startIcon={<ContentCopyIcon />}>Copy Code</Button>
                  <Button 
                    onClick={handleRunQueryClick}
                    id="runQueryButton" 
                    sx={css.consoleButton} 
                    startIcon={<PlayArrowIcon />}>
                      Run STAC Query
                  </Button>
                </ButtonGroup>
              </FormControl>
            </div>
          </div>
      </Collapse>
    </div>
  );
}
