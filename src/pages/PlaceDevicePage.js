import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PlaceDevicePage.css';

/**
 * PlaceDevicePage component - Shows mobile frame with "Place Device Here" instruction
 */
const PlaceDevicePage = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/consent');
  };

  return (
    <div className="place-device-page">
      {/* Background */}
      <div className="place-device-background">
        <img src="/assets/1stPageBG.svg" alt="Background" />
      </div>

      {/* Overlay */}
      <div className="place-device-overlay"></div>

      {/* Content */}
      <div className="place-device-content">
        {/* Mobile frame with instruction */}
        <div className="place-device-frame-container">
          <img src="/assets/mobile-frame.svg" alt="Mobile Frame" className="place-device-frame" />
          
          {/* Place Device Here text/image */}
          <div className="place-device-instruction">
            <img src="/assets/placeDeviceHere.svg" alt="Place Device Here" className="place-device-text" />
          </div>
        </div>

        {/* Continue button */}
        <button className="place-device-button" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default PlaceDevicePage;
