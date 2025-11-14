import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ConsentPage.css';

/**
 * ConsentPage component - Shows waveform with consent question
 */
const ConsentPage = () => {
  const navigate = useNavigate();

  const handleYes = () => {
    navigate('/car-center');
  };

  const handleNo = () => {
    navigate('/place-device');
  };

  return (
    <div className="consent-page">
      {/* Background */}
      <div className="consent-background">
        <img src="/assets/map.svg" alt="Background" />
      </div>

      {/* Overlay */}
      <div className="consent-overlay"></div>

      {/* Content */}
      <div className="consent-content">
        {/* Waveform animation */}
        <div className="waveform-container">
          <svg className="waveform" viewBox="0 0 400 100" preserveAspectRatio="none">
            <path className="waveform-path" d="M0,50 Q10,30 20,50 T40,50 T60,50 T80,50 T100,50 T120,50 T140,50 T160,50 T180,50 T200,50 T220,50 T240,50 T260,50 T280,50 T300,50 T320,50 T340,50 T360,50 T380,50 T400,50" />
          </svg>
        </div>

        {/* Question */}
        <h2 className="consent-question">Do you consent?</h2>

        {/* Buttons */}
        <div className="consent-buttons">
          <button className="consent-btn consent-yes" onClick={handleYes}>
            <img src="/assets/Yes.png" alt="YES" className="consent-btn-img" />
          </button>
          <button className="consent-btn consent-no" onClick={handleNo}>
            <img src="/assets/No.svg" alt="NO" className="consent-btn-img" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentPage;
