import React, { useState } from 'react';

function RasterVsVectorBox() {
    return (
        <div className="contentBox">
            <h3>Raster vs Vector</h3>
            <p> This is some sort of information In Raster vs Vector</p>
        </div>
    );
}

function SortingBox() {
    return (
        <div className="contentBox">
            <h3>Sorting</h3>
            <p> This is some sort of information In Sorting</p>
        </div>
    );
}

function FootprintCardBox() {
    return (
        <div className="contentBox">
            <h3>Footprint Card</h3>
            <p> This is some sort of information in FootprintCard</p>
        </div>
    );
}

export default function HelpBox({ isOpen, onClose }) {
    if(!isOpen) return null;

    const [showSubPopup, setShowSubPopup] = useState(null);

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
        <div id="helpBoxBackground">
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
