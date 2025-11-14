import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlaceDevicePage from './pages/PlaceDevicePage';
import ConsentPage from './pages/ConsentPage';
import CarCenterPage from './pages/CarCenterPage';
import CanvasApp from './CanvasApp';

/**
 * AppRouter component - Main routing component
 * 5-page flow:
 * 1. / - Home page
 * 2. /place-device - Place device page
 * 3. /consent - Consent page with waveform
 * 4. /car-center - Car center page with options
 * 5. /canvas - Interactive canvas with all objects
 */
function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/place-device" element={<PlaceDevicePage />} />
        <Route path="/consent" element={<ConsentPage />} />
        <Route path="/car-center" element={<CarCenterPage />} />
        <Route path="/canvas" element={<CanvasApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
