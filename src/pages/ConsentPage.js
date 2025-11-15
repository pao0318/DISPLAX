import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import '../styles/ConsentPage.css';

/**
 * ConsentPage component - Shows waveform with consent question
 */
const ConsentPage = () => {
  const navigate = useNavigate();

  const handleYes = () => {
    navigate('/canvas');
  };

  const handleNo = () => {
    navigate('/place-device');
  };

  return (
    <Box className="consent-page">
      {/* Background */}
      <Box className="consent-background">
        <img src="/assets/map2-bg.svg" alt="Background" />
      </Box>

      {/* Overlay */}
      <Box className="consent-overlay"></Box>

      {/* Waveform animation */}
      <Box className="waveform-container">
        <img src="/assets/Wave.svg" alt="" aria-hidden="true" />
      </Box>

      {/* Content */}
      <Container maxWidth="sm">
        <Box className="consent-content">
          {/* Question */}
          <h2 className="consent-question">Do you consent?</h2>

          {/* Buttons */}
          <Box className="consent-buttons">
            <button className="consent-btn consent-yes" onClick={handleYes}>
              <img src="/assets/Yes.png" alt="YES" className="consent-btn-img" />
            </button>
            <button className="consent-btn consent-no" onClick={handleNo}>
              <img src="/assets/No.svg" alt="NO" className="consent-btn-img" />
            </button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ConsentPage;
