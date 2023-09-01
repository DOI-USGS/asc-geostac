import React, { useEffect, useState } from "react";
// Keyword Filter
import TextField from "@mui/material/TextField";
// Date Range
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// Filter By "This" checkboxes
import Checkbox from "@mui/material/Checkbox";
// Sort By Drop Down
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

import { Collapse, Divider } from "@mui/material";
import ListItemText from "@mui/material/ListItemText";

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
    width: "280px",
    borderBottom: "2px solid rgba(0, 0, 0, 0.12)"
  },
  thinSelect: {
    marginRight: "12px",
    "& .MuiInputBase-input": {
      padding: "2px 32px 2px 8px",
    }
  },
  dateInput: {
    width: "160px"
  },
  toggleIconSmall: {
    marginTop: "-5px",
    marginLeft: "-4px",
    marginRight: "3px",
    marginBottom: "-6px"
  },
  ascDescCheckbox: {
    color: "#64748B",
    "&.Mui-checked": {
      color: "#64748B",
    },
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
  const [expandFilter, setExpandFilter] = React.useState(false);
  const [expandDate, setExpandDate] = React.useState(false);
  
  // Sort By
  const [sortVal, setSortVal] = React.useState("");                    // Sort By What?
  const [sortAscCheckVal, setSortAscCheckVal] = React.useState(true); // Sort Ascending or Descending
  
  // Filter by X checkboxes
  const [areaCheckVal, setAreaCheckVal] = React.useState(false);       // Area
  const [dateCheckVal, setDateCheckVal] = React.useState(false);       // Date

  // Filter by X values
  const [areaTextVal, setAreaTextVal] = React.useState("");       // Area (received by window message from AstroDrawFilterControl)
  const [dateFromVal, setDateFromVal] = React.useState(null);     // From Date
  const [dateToVal, setDateToVal] = React.useState(null);         // To Date

  //const for callback
  const {UpdateQueryableTitles} = props;
  const handleExpandFilterClick = () => {
    setExpandFilter(!expandFilter);
  }

  const buildQueryString = () => {
    let myFilterString = "?";
    
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

      myFilterString += "datetime=" + fromDate + "/" + toDate + "&";
    }

    // Sorting
    let sortAscDesc = '-'
    if (sortAscCheckVal) {
      sortAscDesc = '';
    }
    if (sortVal === "id" || sortVal === "properties.datetime" || sortVal === "properties.proj:bbox") {
      myFilterString += 'sortby=' + sortAscDesc + sortVal + '&';
    }

    // Area
    if(areaCheckVal && areaTextVal !== "") myFilterString += areaTextVal;

    // clear tailing &s
    if(myFilterString.slice(-1) === '&') myFilterString = myFilterString.slice(0, -1)

    props.setFilterString(myFilterString);
  }

  // initialize pyGeoAPI flag
  let pyGeoAPIFlag = false;

  // New state for queryable titles
  const [queryableTitles, setQueryableTitles] = useState([]); 
 
  // all collections
  const collection = props.target.collections;
 
  // retrieves all PyGEO collections
  const isInPyAPI = collection.filter(data => data.hasOwnProperty('itemType'));

  // finds and assigns the selected collection from the PYGEO api
  const selectedCollection = isInPyAPI.find(data => data.title === props.selectedTitle);

  // retrieves all pyGEO titles
  const collectionTitles = isInPyAPI.map(data => data.title);

    
    
  // checks if correct title selected 
  if (collectionTitles.includes(props.selectedTitle))
  {
    //set pyGeoAPI flag
    pyGeoAPIFlag = true;

    // set the selected link
    let QueryableDirectoryLink = selectedCollection.links.find(link => link.rel === "queryables").href;

    // creates URL to get the properties
    let QueryableURL = 'https://astrogeology.usgs.gov/pygeoapi/' + QueryableDirectoryLink;

    // fetches URL to get the properties
    fetch(QueryableURL)
    .then(response => response.json())
    .then(data => {

      let queryableTitlesArray = [];

      // Extract the "properties" property from the JSON response
      let Queryables = data.properties;
        
      // loop over titles
      for (const property in Queryables) {
        if (Queryables.hasOwnProperty(property) && Queryables[property].hasOwnProperty("title")) {
            
          queryableTitlesArray.push(data.properties[property].title);
            
        }
     }

      // Set the state with the queryable titles
      setQueryableTitles(queryableTitlesArray);
      
      
    }, [])
    .catch(error => {
    console.error("Error fetching data:", error);
    });
    }
      
    
  

  const [selectedOptions, setSelectedOptions] = useState([]);
  
  const handleOptionChange = event => {
    const selectedValues = event.target.value;
    setSelectedOptions(selectedValues);

    // Create an array of objects with selected option and value
    const selectedOptionsWithValues = selectedValues.map((option) => ({
      option,
        value: queryableTitles.find((title) => title.title === option)?.value, 
      }));

  // Pass the selected options and values to FootprintResults
    UpdateQueryableTitles(selectedOptionsWithValues); 
  };

  
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
  const handleDateDetailsClick = () => {
    setExpandDate(!expandDate);
  }
  const handleDateCheckChange = (event) => {
    setDateCheckVal(event.target.checked);
    if (event.target.checked === true) {
      if (expandDate === false) {
        setExpandDate(true);
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

  // Listener for boundary box being drawn in leaflet
  useEffect(() => {
    window.addEventListener("message", onBoxDraw);
    return () => window.removeEventListener("message", onBoxDraw);
  }, []);

  // If target is changed, reset filter values;
  useEffect(() => {
    
  // Sort By
  setSortVal("");
  setSortAscCheckVal(true);
  
  // Filter by X checkboxes
  setAreaCheckVal(false);
  setDateCheckVal(false);

  // Filter by X values
  setAreaTextVal("");    // Area (received by window message from AstroMap)
  setDateFromVal(null); // From Date
  setDateToVal(null);  // To Date

  }, [props.targetName]);

  

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
      <div className="panelSection panelHeader panelBar clickable" onClick={handleExpandFilterClick}>
        <span>Sort and Filter...</span>
        <span>
          {expandFilter ? <ExpandLessIcon sx={css.toggleIconSmall}/> : <ExpandMoreIcon sx={css.toggleIconSmall}/>}
        </span>
      </div>
      <Divider/>
      <Collapse in={expandFilter}>
        <div className="panelSection panelBar">
          <span>
            <FormControl sx={{ minWidth: 150 }}>
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
          </span>
          <span className="panelSortAscCheck">
            <Checkbox
              id="sortAscCheckBox"
              checked={sortAscCheckVal}
              onChange={handleSortAscCheckChange}
              icon={<ArrowDownwardIcon />}
              checkedIcon={<ArrowUpwardIcon />}
              sx={css.ascDescCheckbox}
            />
          </span>
        </div>
        
        {pyGeoAPIFlag && (
        <div className="panelSection panelBar">
          <span>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="selectQueryLabel" size="small">
                Select Query
              </InputLabel>
              <Select
                labelId="selectQueryLabel"
                label="Select Query"
                multiple
                value={selectedOptions}
                onChange={handleOptionChange}
                renderValue={(selected) => selected.join(', ')}
              >
                {queryableTitles.map((title) => (
                        <MenuItem key={title} value={title}>
                          <Checkbox checked={selectedOptions.includes(title)} />
                          <ListItemText primary={title} />
                        </MenuItem>
                ))}
              </Select>
            </FormControl>
          </span>
        </div>
        )}
        <Divider/>

        <div className="panelSection">
          <div className="panelSectionHeader panelBar">
            <span className="panelSectionTitle">Selected Area</span>
            <span className="panelSectionCheck">
              <Checkbox
                id="areaCheckBox"
                checked={areaCheckVal}
                onChange={handleAreaCheckChange}
              />
            </span>
          </div>
        </div>

        <Divider/>

        <div className="panelSection">
          <div className="panelSectionHeader panelBar">
            <span className="clickable" onClick={handleDateDetailsClick}>
              <span className="clickable" onClick={handleDateDetailsClick}>
                {expandDate ? <ExpandLessIcon sx={css.toggleIconSmall}/> : <ExpandMoreIcon sx={css.toggleIconSmall}/>}
              </span>
              Date Range
            </span>
            <span className="panelSectionCheck">
              <Checkbox
                id="dateCheckBox"
                checked={dateCheckVal}
                onChange={handleDateCheckChange}
              />
            </span>
          </div>
          <Collapse in={expandDate}>
            <div className="panelItem">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  id="dateFromPicker"
                  label="From"
                  value={dateFromVal}
                  onChange={handleDateFromChange}
                  renderInput={(params) => (
                    <TextField sx={css.dateInput} size="small" id="dateFromID" {...params} />
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
                    <TextField sx={css.dateInput} size="small" id="dateToID" {...params} />
                  )}
                />
              </LocalizationProvider>
            </div>
          </Collapse>
        </div>
      </Collapse>
    </div>
  );
}
