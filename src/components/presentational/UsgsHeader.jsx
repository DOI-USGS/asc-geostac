import React from "react";
import UsgsLogo from "../../images/logos/usgs-logo.png";
import { GovBanner } from "@trussworks/react-uswds";

const css = {
  headerNav: {
    margin: 0,
    position: "relative",
    background: "#00264c",
    display: "block",
  },
  tmpContainer: {
    marginRight: "auto",
    marginLeft: "auto",
    paddingLeft: "15px",
    paddingRight: "15px",
    display: "block",
  },
  searchBox: {
    display: "none",
  },
  logoImg: {
    height: "50px",
    marginTop: "8px",
    marginBottom: "8px",
    border: 0,
    maxWidth: "100%",
  },
};

/**
 * USGS OCAP Compliant Header
 *
 * @component
 */
export default function UsgsHeader(props) {
  return (
    <>
      <GovBanner aria-label="Official government website" />
      <header id="navbar" style={css.headerNav} role="banner">
        <div style={css.tmpContainer}>
          <div>
            <a href="https://www.usgs.gov/" title="Home">
              <img src={UsgsLogo} alt="Home" style={css.logoImg} />
            </a>
            <form
              action="https://www.usgs.gov/science-explorer-results"
              method="GET"
              id="search-box"
              style={css.searchBox}
            >
              <div>
                <label>Search</label>
                <input
                  id="se_search"
                  type="search"
                  name="es"
                  placeholder="Search"
                />
                <button type="submit">
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </header>
    </>
  );
}
