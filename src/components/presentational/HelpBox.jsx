import React, { useState, useRef, useEffect } from 'react';

function RasterVsVectorBox() {
    return (
        <div className="contentBox">
            <h3>Raster vs Vector</h3>
            <h4>Raster</h4>
            <p>
            The collections with the (Raster) tag are Analysis Ready Data (ARD) holding obtained using the SpatioTemporal
            Asset Catalogs (STAC) API. These features include image footprints and their corresponding assets. More
            information can be found about this API using the "Help" button.
            </p>
            <h4>Vector</h4>
            <p>
            The collections with the (Vector) tag are footprints obtained from the USGS Vector API. These features
            include a multitude of collections condensed into an OGC compliant database to deliver Analysis Ready Data (ARD).
            Users will be able to sort this data using the "queryables'' tab to gather unique ID's or details for each feature in the collection.
            </p>
        </div>
    );
}

function SortingBox() {
    return (
        <div className="contentBox">
            <h3>Sorting</h3>
            <h4>Selected Area</h4>
            <p>To sort by selected area (Only works for Raster). To use, click the "square" icon
                to the left of the map and draw an area. The footprint card should update with only features
                within that area.
            </p>
        </div>
    );
}

function FootprintCardBox() {
    return (
        <div className="contentBox">
            <h3>Footprint Card</h3>
            <p> The footprint card to the right of the screen shows and displays all of the collection features
                selected from the large collections box. To show more features on the map and in the box click the
                "load more" button with the desired amount of features needed.

            </p>
        </div>
    );
}

export default function HelpBox({ isOpen, onClose }) {
    if(!isOpen) return null;

    const [showSubPopup, setShowSubPopup] = useState(null);
    const popupRef = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (event.target === popupRef.current) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleRasterVsVectorClick = () => {
        setShowSubPopup('rasterVsVector');
    };

    const handleSortingClick = () => {
        setShowSubPopup('sorting');
    };

    const handleFootprintCardClick = () => {
        setShowSubPopup('footprintCard');
    };

    return (
        <div id="helpBoxBackground" ref={popupRef}>
            <div className="helpBoxContent">
                <h2>Help Menu</h2>
                <button className="helpButton" onClick={handleRasterVsVectorClick}>Raster vs Vector</button>
                <button className="helpButton" onClick={handleSortingClick}>Sorting</button>
                <button className="helpButton" onClick={handleFootprintCardClick}>Footprint Card</button>
                <button onClick={onClose} className="closeButton">Close</button>
            </div>

            {showSubPopup === 'rasterVsVector' &&
                <div className="subPopup">
                    <RasterVsVectorBox/>
                </div>
            }
            {showSubPopup === 'sorting' &&
                <div className="subPopup">
                    <SortingBox/>
                </div>
            }
            {showSubPopup === 'footprintCard' &&
                <div className="subPopup">
                    <FootprintCardBox/>
                </div>
            }
        </div>
    );
}
