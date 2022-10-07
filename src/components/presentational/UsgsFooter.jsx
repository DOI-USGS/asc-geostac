import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquareTwitter,
  faSquareFacebook,
  faSquareGithub,
  faFlickr,
  faSquareYoutube,
  faSquareInstagram,
} from "@fortawesome/free-brands-svg-icons";

const css = {
  footer: {
    flexShrink: 0,
    fontFamily: "'Source Sans Pro',sans-serif",
    margin: 0,
    background: "#00264c",
    width: "100%",
    borderTop: "1px solid #E5E5E5",
  },
  tmpContainer: {
    padding: "12px 15px 5px",
    display: "flex",
    flexDirection: "column",
  },
  ulMenuNav: {
    margin: 0,
    paddingLeft: 0,
    listStyle: "none",
    display: "flex",
    flexWrap: "wrap",
    lineHeight: "28px",
  },
  dividerLine: {
    margin: "5px 0px",
  },
  footerBottomRow: {
    marginTop: "4px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  footerDoi: {
    paddingRight: "20px",
    paddingLeft: 0,
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
  },
  footerSocial: {
    marginTop: "1px",
    paddingRight: 0,
    fontSize: "12px",
    color: "#ffffff",
    flexWrap: "nowrap",
  },
  firstLeaf: {
    paddingRight: "2px",
    paddingLeft: "0px",
  },
  leaf: {
    paddingRight: "2px",
    paddingLeft: "5px",
  },
  linkSpacer: {
    color: "#ffffff",
    paddingLeft: "7px",
    fontSize: "12px",
  },
  noSpacer: {
    display: "none",
  },
  footerLink: {
    textDecoration: "none",
    background: "transparent",
    padding: 0,
    color: "#ffffff",
    fontSize: "12px",
  },
  follow: {
    paddingRight: "5px",
  },
  socialLeaf: {
    margin: "0px 2px",
  },
  socialIcon: {
    color: "#ffffff",
    fontSize: "24px",
  },
  only: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    border: 0,
  },
};

const usgsLinks = [
  ["https://www.doi.gov/privacy", "DOI Privacy Policy"],
  ["https://www.usgs.gov/policies-and-notices", "Legal"],
  [
    "https://www.usgs.gov/accessibility-and-us-geological-survey",
    "Accessibility",
  ],
  ["https://www.usgs.gov/sitemap", "Site Map"],
  ["https://answers.usgs.gov/", "Contact USGS"],
];

const doiLinks = [
  ["https://www.doi.gov/", "U.S. Department of the Interior"],
  ["https://www.doioig.gov/", "DOI Inspector General"],
  ["https://www.whitehouse.gov/", "White House"],
  ["https://www.whitehouse.gov/omb/management/egov/", "E-gov"],
  ["https://www.doi.gov/pmb/eeo/no-fear-act/", "No Fear Act"],
  ["https://www.usgs.gov/about/organization/science-support/foia/", "FOIA"],
];

const socialLinks = [
  ["https://twitter.com/usgs", "Twitter", faSquareTwitter],
  ["https://facebook.com/usgeologicalsurvey", "Facebook", faSquareFacebook],
  ["https://github.com/usgs", "GitHub", faSquareGithub],
  ["https://flickr.com/usgeologicalsurvey", "Flickr", faFlickr],
  ["http://youtube.com/usgs", "YouTube", faSquareYoutube],
  ["https://instagram.com/usgs", "Instagram", faSquareInstagram],
];

/**
 * USGS Ocap Compliant Footer
 *
 * @component
 */
export default function UsgsFooter(props) {
  return (
    <footer style={css.footer}>
      <div style={css.tmpContainer}>
        <div>
          <ul style={css.ulMenuNav}>
            {usgsLinks.map((link, index, array) => (
              <li style={index === 0 ? css.firstLeaf : css.leaf} key={link[0]}>
                <a style={css.footerLink} href={link[0]}>
                  {link[1]}
                </a>
                <span
                  style={
                    index === array.length - 1 ? css.noSpacer : css.linkSpacer
                  }
                >
                  |
                </span>
              </li>
            ))}
          </ul>
        </div>

        <hr style={css.dividerLine} />

        <div style={css.footerBottomRow}>
          <div style={css.footerDoi}>
            <ul style={css.ulMenuNav}>
              {doiLinks.map((link, index, array) => (
                <li
                  style={index === 0 ? css.firstLeaf : css.leaf}
                  key={link[0]}
                >
                  <a style={css.footerLink} href={link[0]}>
                    {link[1]}
                  </a>
                  <span
                    style={
                      index === array.length - 1 ? css.noSpacer : css.linkSpacer
                    }
                  >
                    |
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div style={css.footerSocial}>
            <ul style={css.ulMenuNav}>
              <li style={css.follow}>Follow</li>
              {socialLinks.map((link, index, array) => (
                <li style={css.socialLeaf} key={link[0]}>
                  <a href={link[0]} target="_blank">
                    <FontAwesomeIcon style={css.socialIcon} icon={link[2]} />
                    <i>
                      <span style={css.only}>{link[1]}</span>
                    </i>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
