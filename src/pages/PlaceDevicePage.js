import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
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
    <Box className="place-device-page">
      {/* Background */}
      <Box className="place-device-background">
        <img src="/assets/map-1.svg" alt="Background" />
      </Box>

      {/* Content Container */}
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Mobile frame with instruction */}
          <Box className="place-device-frame-container">
            <img src="/assets/mobile-frame.svg" alt="Mobile Frame" className="place-device-frame" />
          </Box>

          {/* Place Device Here text/image */}
          <Box
            className="place-device-instruction"
            onClick={handleContinue}
            sx={{ cursor: 'pointer' }}
          >
            <img src="/assets/placeDeviceHere.svg" alt="Place Device Here" className="place-device-text" />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PlaceDevicePage;
