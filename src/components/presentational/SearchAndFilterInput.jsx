import React, { useEffect } from "react";
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
import Pagination from "@mui/material/Pagination";

import { Divider, FormHelperText } from "@mui/material";

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
  thinSelect: {
    marginRight: "12px",
    "& .MuiInputBase-input": {
      padding: "2px 32px 2px 8px",
    }
  }
  
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

  // Pagination
  const [maxNumberFootprints, setMaxNumberFootprints] = React.useState(10);
  const [numberReturned, setNumberReturned] = React.useState(10);

  const buildQueryString = () => {
    let myQueryString = "?";
    
    // Date
    if (dateCheckVal) {
      
      let d = new Date();
      const lowestYear = 1970;
      const highestYear = d.getFullYear();
      let fromDate = lowestYear + "-01-01T00:00:00Z";
      let toDate = highestYear + "-12-31T23:59:59Z";

      const isGoodDate = (dateToCheck) => {
        if(dateToCheck) {
          const isValid = !isNaN(dateToCheck.valueOf());
          const isDate = dateToCheck instanceof Date;
          let yearToCheck = 0;
          if (isDate & isValid){
            yearToCheck = dateToCheck.getFullYear();
            return lowestYear < yearToCheck && yearToCheck < highestYear;
          }
        }
        return false
      }

      // From
      if(isGoodDate(dateFromVal)) {
        fromDate = dateFromVal.toISOString();
      }

      // To
      if(isGoodDate(dateToVal)) {
        toDate = dateToVal.toISOString();
      }

      myQueryString += "datetime=" + fromDate + "/" + toDate + "&";
    }

    // Sorting... Not supported by the API?
    let sortAscDesc = '-'
    if (sortAscCheckVal) {
      sortAscDesc = '';
    }
    if (sortVal === "id" || sortVal === "properties.datetime" || sortVal === "properties.proj:bbox") {
      myQueryString += 'sortby=' + sortAscDesc + sortVal + '&';
    }

    // Area
    if(areaCheckVal && areaTextVal !== "") myQueryString += areaTextVal; // Add an & if not last

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
  };

  // Date
  const handleDateCheckChange = (event) => {
    setDateCheckVal(event.target.checked);
    if (event.target.checked === true) {
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

  // Listen for any state change (input) and update the query string based on it
  useEffect(() => {
    buildQueryString();
  }, [sortVal, sortAscCheckVal, areaCheckVal, areaTextVal, dateCheckVal, dateFromVal, dateToVal]);

  const onBoxDraw = event => {
    if(typeof event.data == "object" && event.data[0] === "setWkt"){
      const receivedWkt = event.data[1];
      setAreaTextVal(receivedWkt);
      setAreaCheckVal(true);
    }
  }

  useEffect(() => {
    window.addEventListener("message", onBoxDraw);
    return () => window.removeEventListener("message", onBoxDraw);
  }, []);

  /* Control IDs for reference:
  sortBySelect
  sortAscCheckBox
  areaCheckBox
  dateCheckBox
  dateFromPicker
  dateToPicker
  */

  return (
    <div style={css.container}>
      <div className="panelSection panelHeader">Filter Results</div>

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
            <MenuItem value=""> <em> None </em> </MenuItem>
            <MenuItem value={"id"}> ID </MenuItem>
            <MenuItem value={"properties.datetime"}> Date </MenuItem>
            <MenuItem value={"properties.proj:bbox"}> Location </MenuItem>
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

      <div className="panelSection">
        <div className="panelSectionHeader">
          <div className="panelSectionTitle">Selected Area Only</div>
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
    </div>
  );
}
