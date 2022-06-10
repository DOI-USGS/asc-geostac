import React from "react";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import GitHubIcon from "@mui/icons-material/GitHub";
import SvgIcon from "@mui/material/SvgIcon";
import GeoSTACIcon from "../../assets/img/geostaclogo.svg";


export default function CreditsDisplay() {

  return (
    <div id="credits-bar">
      <Divider orientation="vertical" />
      <div className="credit-item">
        <Link
          target="_blank"
          rel="noopener"
          color="inherit"
          style={{ fontWeight: 600 }}
          variant="caption"
          href="https://www.ceias.nau.edu/capstone/projects/CS/2022/GeoSTAC/documents/usermanual.pdf"
        >
          User Manual
        </Link>
      </div>
      <Divider orientation="vertical" />
      <div className="credit-item">
        <Typography style={{ fontSize: 12 }} variant="caption">
          <Link
            target="_blank"
            rel="noopener"
            variant="caption"
            color="inherit"
            style={{ fontWeight: 600 }}
            href="https://www.ceias.nau.edu/capstone/projects/CS/2022/GeoSTAC/"
          >
            GeoSTAC Project Website
          </Link>
        </Typography>
        <SvgIcon
          viewBox="0 0 375 375"
          style={{
            color: "#343a40",
            top: 3,
            width: 20,
            height: 13,
            position: "relative"
          }}
          component={GeoSTACIcon}
        />
      </div>
      <Divider orientation="vertical" />
      <div className="credit-item">
        <Link
          target="_blank"
          rel="noopener"
          href="https://github.com/GeoSTAC/CartoCosmos-with-STAC"
        >
          <GitHubIcon
            style={{
              color: "#343a40",
              fontSize: 16,
              top: 2,
              position: "relative"
            }}
          />
        </Link>
      </div>
    </div>
  );
}
