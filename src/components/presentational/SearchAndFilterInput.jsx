import React, { useEffect } from "react";
// Apply and Clear Buttons
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
// Keyword Filter
import TextField from "@mui/material/TextField";
// CSS
import { alpha } from "@mui/material/styles";
// Date Range
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// Filter By "This" checkboxes
import Checkbox from "@mui/material/Checkbox";
// Sort By Drop Down
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
// No. of Footprints, pagination
import Slider from "@mui/material/Slider";
import Pagination from "@mui/material/Pagination";
import Chip from "@mui/material/Chip";
import FlagIcon from "@mui/icons-material/Flag";

import {
  getMaxNumberPages,
  setCurrentPage,
  getCurrentPage,
  getNumberMatched,
  setLimit,
  getNumberReturned,
} from "../../js/ApiJsonCollection";

/**
 * Controls css styling for this component using js to css
 */
let css = {
  container: {
    backgroundColor: "#f8f9fa",
    overflow: "hidden",
    flexShrink: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  textbox: {
    backgroundColor: "#e9ecef",
    "&:focus": {
      borderColor: "#1971c2",
    },
  },
  button: {
    width: "auto",
    color: "#fff",
    backgroundColor: "#1971c2",
    "&:hover": {
      backgroundColor: alpha("#1971c2", 0.7),
    },
  },
  buttonRemove: {
    width: "auto",
    color: "#fff",
    backgroundColor: "#64748B",
    "&:hover": {
      backgroundColor: alpha("#64748B", 0.7),
    },
  },
  title: {
    padding: "0.2rem",
    color: "#343a40",
    fontSize: 18,
    fontWeight: 600,
  },
  chipHidden: {
    visibility: "hidden",
  },
  chipShown: {
    visibility: "visible",
    textAlign: "center",
  },
};

/**
 * Component that lets user search and filter
 *
 * @component
 * @example
 * <SearchAndFilterInput />
 *
 */
export default function SearchAndFilterInput(props) {

  // Allows showing/hiding of fields
  const keywordDetails = React.useRef(null);
  const dateDetails = React.useRef(null);

  // Sort By
  const [sortVal, setSortVal] = React.useState("");                    // Sort By What?
  const [sortAscCheckVal, setSortAscCheckVal] = React.useState(false); // Sort Ascending or Descending
  
  // Filter by X checkboxes
  const [areaCheckVal, setAreaCheckVal] = React.useState(false);       // Area
  const [keywordCheckVal, setKeywordCheckVal] = React.useState(false); // Keyword
  const [dateCheckVal, setDateCheckVal] = React.useState(false);       // Date

  // Filter by X values
  const [areaTextVal, setAreaTextVal] = React.useState("");       // Area (received by window message from AstroDrawFilterControl)
  const [keywordTextVal, setKeywordTextVal] = React.useState(""); // Keyword
  const [dateFromVal, setDateFromVal] = React.useState(null);     // From Date
  const [dateToVal, setDateToVal] = React.useState(null);         // To Date

  // Page Number
  const [pageNumber, setPageNumber] = React.useState(1);

  // Pagination
  const [maxPages, setMaxPages] = React.useState(10);
  const [maxNumberFootprints, setMaxNumberFootprints] = React.useState(10);
  const [numberReturned, setNumberReturned] = React.useState(10);
  const [limitVal, setLimitVal] = React.useState(10);  // Max Number of footprints requested per collection
  
  // Apply/Alert Chip
  const [applyChipVisStyle, setApplyChipVisStyle] = React.useState(css.chipHidden);
  const [chipMessage, setChipMessage] = React.useState("Apply to Show Footprints on Map");

  const setApplyChip = (value) => {
    setChipMessage("Apply to Show Footprints on Map");
    setApplyChipVisStyle(css.chipShown);
  };

  const handleApply = () => {
    setTimeout(() => {
      setMaxPages(getMaxNumberPages);
      setNumberReturned(getNumberReturned);
      setMaxNumberFootprints(getNumberMatched);
      props.footprintNavClick();
    }, 3000);
    setApplyChipVisStyle(css.chipHidden);
  };

  // Clear all values
  const handleClear = () => {
    setSortVal("");
    setSortAscCheckVal(false);
    setAreaCheckVal(false);
    setKeywordCheckVal(false);
    setKeywordTextVal("");
    setDateCheckVal(false);
    setDateFromVal(null);
    setDateToVal(null);
    setLimitVal(10);
    setMaxPages(1);
    setMaxNumberFootprints(0);
    setNumberReturned(0);
    setApplyChip("Apply to Show Footprints on Map");
    //// Uncomment to close details on clear
    // keywordDetails.current.open = false;
    // dateDetails.current.open = false;
  };

  const buildQueryString = () => {
    let myQueryString = "?";

    // Page Number
    if (pageNumber != 1) myQueryString += "page=" + pageNumber + "&";
  
    // Number of footprints requested per request
    if (limitVal != 10) myQueryString += "limit=" + limitVal + "&"
    
    // Date
    if (dateCheckVal) {
      let d = new Date();
      let fromDate = "1970-01-01T00:00:00Z";             // From start of 1970 by default
      let toDate = d.getFullYear() + "-12-31T23:59:59Z"; // To end of current year by default

      // From
      if(dateFromVal instanceof Date && !isNaN(dateFromVal.valueOf())) {
        fromDate = dateFromVal.toISOString();
      }

      // To
      if(dateToVal instanceof Date && !isNaN(dateToVal.valueOf())) {
        toDate = dateToVal.toISOString();
      }

      myQueryString += "datetime=" + fromDate + "/" + toDate + "&";
    }

    // Keyword
    if(keywordCheckVal) myQueryString += "keywords=[" + keywordTextVal.split(" ") + "]&";

    // Area
    if(areaCheckVal && areaTextVal !== "") myQueryString += areaTextVal;

    // Sorting... Not supported by the API?
    const sortAscDesc = sortAscCheckVal ? "asc" : "desc";
    if (sortVal === "date" || sortVal === "location") {
      console.log("Warning: Sorting not Supported!");
      // myQueryString += 'sort=[{field:datetime,direction:' + sortAscDesc + '}]&'
    }

    props.setQueryString(myQueryString);
  }

  // Sorting
  const handleSortChange = (event) => {
    setSortVal(event.target.value);
  };
  const handleSortAscCheckChange = (event) => {
    setSortAscCheckVal(event.target.checked);
  };

  // Polygon
  const handleAreaCheckChange = (event) => {
    setAreaCheckVal(event.target.checked);
    if (event.target.checked === true) {
      setApplyChip("Apply to filter footprints");
    }
  };

  // Keyword
  const handleKeywordCheckChange = (event) => {
    setKeywordCheckVal(event.target.checked);
    if (event.target.checked === true) {
      setApplyChip("Apply to filter footprints");
      if (keywordDetails.current.open === false) {
        keywordDetails.current.open = true;
      }
    }
  };
  const handleKeywordChange = (event) => {
    setKeywordTextVal(event.target.value);
    setKeywordCheckVal(true);
  };

  // Date
  const handleDateCheckChange = (event) => {
    setDateCheckVal(event.target.checked);
    if (event.target.checked === true) {
      setApplyChip("Apply to filter footprints");
      if (dateDetails.current.open === false) {
        dateDetails.current.open = true;
      }
    }
  };
  const handleDateFromChange = (event) => {
    setDateFromVal(event);
    setDateCheckVal(true);
  };
  const handleDateToChange = (event) => {
    setDateToVal(event);
    setDateCheckVal(true);
  };

  // limit
  const handleLimitChange = (event, value) => {
    setLimitVal(value);
    setLimit(value);
    setApplyChip("Apply to show " + value + " footprints");
  };

  // Pagination
  const handlePageChange = (event, value) => {
    setPageNumber(value);
    setCurrentPage(value);
    setApplyChip("Apply to go to page " + value);
  };

  // resets pagination and limit when switching targets
  useEffect(() => {
    setTimeout(() => {
      setCurrentPage(1);
      setPageNumber(1);
      setMaxNumberFootprints(getNumberMatched);
      setNumberReturned(getNumberReturned);
      setLimitVal(10);
      setLimit(10);
      setMaxPages(getMaxNumberPages);
      props.footprintNavClick();
    }, 2000);
  }, [props.target.name]);

  // Listen for any state change (input) and update the query string based on it
  useEffect(() => {
    buildQueryString();
  }, [sortVal, sortAscCheckVal, areaCheckVal, areaTextVal, keywordCheckVal, keywordTextVal, dateCheckVal, dateFromVal, dateToVal, limitVal, pageNumber]);

  const onBoxDraw = event => {
    if(typeof event.data == "string" && event.data.includes("bbox")){
      setAreaTextVal(event.data);
      setAreaCheckVal(true);
    }
  }

  useEffect(() => {
    window.addEventListener("message", onBoxDraw);

    return () => {
      window.removeEventListener("message", onBoxDraw);
    }
  }, []);

  /* Control IDs for reference:
  applyButton
  clearButton
  sortBySelect
  sortAscCheckBox
  areaCheckBox
  keywordCheckBox
  keywordTextBox
  dateCheckBox
  dateFromPicker
  dateToPicker
  */

  return (
    <div style={css.container}>
      <div className="panelSection panelHeader">Sort and Filter</div>
      <div className="panelSection">
        <ButtonGroup>
          <Button
            id="applyButton"
            variant="contained"
            startIcon={<FilterAltIcon />}
            onClick={handleApply}
            sx={css.button}
          >
            Apply
          </Button>
          <Button
            id="clearButton"
            variant="contained"
            endIcon={<DeleteForeverIcon />}
            onClick={handleClear}
            sx={css.buttonRemove}
          >
            Clear
          </Button>
        </ButtonGroup>
      </div>

      <div className="panelSection">
        <FormControl sx={{ minWidth: 170 }}>
          <InputLabel id="sortByLabel" size="small">
            Sort By
          </InputLabel>
          <Select
            labelId="sortByLabel"
            label="Sort By"
            id="sortBySelect"
            value={sortVal}
            onChange={handleSortChange}
            size="small"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value={"date"}>Date</MenuItem>
            <MenuItem value={"location"}>Location</MenuItem>
          </Select>
        </FormControl>
        <div className="panelSortAscCheck">
          <Checkbox
            id="sortAscCheckBox"
            checked={sortAscCheckVal}
            onChange={handleSortAscCheckChange}
            icon={<ArrowDownwardIcon />}
            checkedIcon={<ArrowUpwardIcon />}
            sx={{
              color: "#64748B",
              "&.Mui-checked": {
                color: "#64748B",
              },
            }}
          />
        </div>
      </div>

      <div className="panelSection panelHeader">Filter By...</div>

      <div className="panelSection">
        <div className="panelSectionHeader">
          <div className="panelSectionTitle">Selected Area</div>
          <div className="panelSectionCheck">
            <Checkbox
              id="areaCheckBox"
              checked={areaCheckVal}
              onChange={handleAreaCheckChange}
            />
          </div>
        </div>
      </div>

      <div className="panelSection">
        <details ref={keywordDetails}>
          <summary>
            <div className="panelSectionHeader">
              <div className="panelSectionTitle">Keyword</div>
              <div className="panelSectionCheck">
                <Checkbox
                  checked={keywordCheckVal}
                  onChange={handleKeywordCheckChange}
                  id="keywordCheckBox"
                />
              </div>
            </div>
          </summary>
          <div className="panelItem">
            <TextField
              sx={css.textbox}
              value={keywordTextVal}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              id="keywordTextBox"
              name="fname"
              type="text"
              autoComplete="off"
              size="small"
              onChange={handleKeywordChange}
            />
          </div>
        </details>
      </div>

      <div className="panelSection">
        <details ref={dateDetails}>
          <summary>
            <div className="panelSectionHeader">
              <div className="panelSectionTitle">Date Range</div>
              <div className="panelSectionCheck">
                <Checkbox
                  id="dateCheckBox"
                  checked={dateCheckVal}
                  onChange={handleDateCheckChange}
                />
              </div>
            </div>
          </summary>
          <div className="panelItem">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                id="dateFromPicker"
                label="From"
                value={dateFromVal}
                onChange={handleDateFromChange}
                renderInput={(params) => (
                  <TextField id="dateFromID" {...params} />
                )}
              />
            </LocalizationProvider>
          </div>
          <div className="panelItem">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                id="dateToPicker"
                label="To"
                value={dateToVal}
                onChange={handleDateToChange}
                renderInput={(params) => (
                  <TextField id="dateToID" {...params} />
                )}
              />
            </LocalizationProvider>
          </div>
        </details>
      </div>
      <div className="panelSectionHeader">
        <div className="panelItem">
          <div className="panelSectionTitle">
            Number of Displayed Footprints
          </div>
          <Slider
            id="valueSlider"
            size="small"
            valueLabelDisplay="auto"
            onChange={handleLimitChange}
            value={limitVal}
            max={100}
            defaultValue={10}
          />
        </div>
      </div>
      <div className="panelSectionHeader">
        <div className="panelItem">
          <Pagination
            id="pagination"
            count={maxPages}
            size="small"
            onChange={handlePageChange}
          />
        </div>
      </div>
      <div className="panelSectionHeader">
        <div className="panelItem">
          Displaying {numberReturned} of {maxNumberFootprints} Results
        </div>
      </div>
      <div style={applyChipVisStyle}>
        <Chip
          id="applyChip"
          label={chipMessage}
          icon={<FlagIcon />}
          onClick={handleApply}
          variant="outlined"
          clickable
        />
      </div>
    </div>
  );
}
