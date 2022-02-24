import React, {useEffect} from "react";
// CSS
import { alpha } from "@mui/material/styles";
// Lists
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import { getFeatures } from "../../js/ApiJsonCollection";


/**
 * Controls css styling for this component using js to css
 */
let css = {
  root: {
    backgroundColor: "#f8f9fa",
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-start"
  },
  container: {
    padding: "1rem",
    height: "100vh",
    width: 225,
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    padding: 0
  },
  textbox: {
    backgroundColor: "#e9ecef",
    "&:focus": {
      borderColor: "#1971c2"
    }
  },
  button: {
    width: "auto",
    color: "#fff",
    backgroundColor: "#1971c2",
    "&:hover": {
      backgroundColor: alpha("#1971c2", 0.7)
    }
  },
  buttonRemove: {
    width: "auto",
    color: "#fff",
    backgroundColor: "#64748B",
    "&:hover": {
      backgroundColor: alpha("#64748B", 0.7)
    }
  },
  title: {
    padding: "0.2rem",
    color: "#343a40",
    fontSize: 18,
    fontWeight: 600
  }
};

/**
 * Component that lets user view list of current footprints
 *
 * @component
 * @example
 * <FootprintResults />
 *
 */
export default function FootprintResults(props) {

  const [features, setFeatures] = React.useState([]);

  useEffect(() => {
    setTimeout(() => {
      setFeatures(getFeatures);
    }, 1000);
  });
  

  return (
    <div style={css.root}>
        <div style={css.container}>
          <div className="panelSection panelHeader">
            Footprint Results
          </div>
          <List>
            {features.map((feature) => (
              <div className="panelSection" key={feature.id}>
                <ListItem>{feature.id}</ListItem>
              </div>
            ))}
          </List>
        </div>
    </div>
  );
}
