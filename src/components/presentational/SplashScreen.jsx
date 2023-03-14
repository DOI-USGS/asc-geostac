import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import loadingImage from "../../images/logos/geostac-logo.svg";

export default function SplashScreen() {
    return(
        <div className="flex col scroll-parent">
            <div className="white loading-slate">
                <h1>GeoSTAC</h1>
                <p>Fetching map data...</p>
                <SvgIcon
                viewBox="0 0 375 375"
                style={{
                    color: "#343a40",
                    top: 3,
                    width: 200,
                    height: 150,
                    position: "relative",
                    paddingBottom: 20
                }}
                component={loadingImage}
                />
            </div>
        </div>
    )
}