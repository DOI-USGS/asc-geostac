import React from "react";
import ReactDOM from "react-dom";
import App from "./components/container/App.jsx";
import "./styles.css";
import "leaflet";
import "leaflet.sld";

ReactDOM.render(<App />, document.getElementById("map"));
