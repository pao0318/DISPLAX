import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

/**
 * HomePage component - Landing page with introduction and CTA button
 */
const HomePage = () => {
  const navigate = useNavigate();

  const handleBeginClick = () => {
    navigate('/place-device');
  };

  return (
    <div className="home-page">
      {/* Background map image */}
      <div className="home-background">
        <img src="/assets/1stPageBG.svg" alt="Map Background" />
      </div>

      {/* Content container */}
      <div className="home-content">
        {/* EY Logo */}
        <div className="home-logo">
          <img src="/assets/EY_Logo_Beam_STFWC_Stacked_RGB_White_Yellow_EN 2.svg" alt="EY Logo" />
        </div>

        {/* Main text content */}
        <div className="home-text">
          <h1 className="home-title">
            Step into a seamless connected commerce experience where your purchases, preferences, and payments come together effortlessly.
          </h1>

          <p className="home-description">
            This interface brings personalized offers, real-time inventory, and frictionless checkout into one unified view—designed for convenience, speed, and delight.
          </p>
        </div>

        {/* CTA Button */}
        <button className="home-button" onClick={handleBeginClick}>
          Let's begin
        </button>
      </div>

      {/* Overlay gradient */}
      <div className="home-overlay"></div>
    </div>
  );
};

export default HomePage;
