import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlaceDevicePage from './pages/PlaceDevicePage';
import ConsentPage from './pages/ConsentPage';
import CanvasApp from './CanvasApp';
import ObjectDetailPage from './pages/ObjectDetailPage';
import LargeScreenPage1 from './largeScreenPages/LargeScreenPage1';
import LargeScreenPage2 from './largeScreenPages/LargeScreenPage2';
import LargeScreenPage3 from './largeScreenPages/LargeScreenPage3';
import LargeScreenPage4 from './largeScreenPages/LargeScreenPage4';


function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Mobile Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/place-device" element={<PlaceDevicePage />} />
        <Route path="/consent" element={<ConsentPage />} />
        <Route path="/canvas" element={<CanvasApp />} />
        <Route path="/object-detail" element={<ObjectDetailPage />} />
        
        {/* Large Screen Routes */}
        <Route path="/largePages/page1" element={<LargeScreenPage1 />} />
        <Route path="/largePages/page2" element={<LargeScreenPage2 />} />
        <Route path="/largePages/page3" element={<LargeScreenPage3 />} />
        <Route path="/largePages/page4" element={<LargeScreenPage4 />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
