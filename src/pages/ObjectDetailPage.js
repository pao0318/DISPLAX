import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/ObjectDetailPage.css';
import ModalImage from '../components/ModalImage';

/**
 * ObjectDetailPage - Shows a single selected object on a canvas with map-3.svg background
 */
const ObjectDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [object, setObject] = useState(null);
  const [isDraggingIcon, setIsDraggingIcon] = useState(false);
  const [iconPosition, setIconPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [iconRotation, setIconRotation] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const canvasRef = useRef(null);
  const mapImageRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const iconRef = useRef(null);

  // Get the selected object from navigation state
  useEffect(() => {
    if (location.state?.object) {
      const obj = location.state.object;
      setObject(obj);
      
      // Set initial position based on canvas coordinates (x, y are normalized 0-1)
      // Convert to pixel positions on the screen
      if (obj.x !== undefined && obj.y !== undefined) {
        const x = obj.x * window.innerWidth;
        const y = obj.y * window.innerHeight;
        setIconPosition({ x, y });
      }
    } else {
      // If no object is passed, go back to canvas
      navigate('/canvas');
    }
  }, [location.state, navigate]);

  // Load map image
  useEffect(() => {
    const mapImage = new Image();
    mapImage.src = '/assets/map-3.svg';
    mapImageRef.current = mapImage;

    mapImage.onload = () => {
      if (canvasRef.current) {
        drawMap(canvasRef.current, mapImage);
      }
    };

    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // Set up canvas and handle resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const drawMapOnCanvas = () => {
      if (mapImageRef.current) {
        drawMap(canvas, mapImageRef.current);
      }
    };

    const setCanvasSize = () => {
      let width = window.innerWidth;
      let height = window.innerHeight;

      width = Math.max(width, 320);
      height = Math.max(height, 568);

      canvas.width = width;
      canvas.height = height;

      canvas.style.width = '100%';
      canvas.style.height = '100%';

      drawMapOnCanvas();
    };

    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = setTimeout(() => {
        setCanvasSize();
        resizeTimeoutRef.current = null;
      }, 100);
    };

    const handleOrientationChange = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        setCanvasSize();
        resizeTimeoutRef.current = null;
      }, 200);
    };

    setCanvasSize();

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // Function to draw the map
  const drawMap = (canvas, mapImage) => {
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';

    // Calculate aspect ratios for responsive scaling
    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = mapImage.width / mapImage.height;

    let drawWidth, drawHeight, drawX, drawY;

    // Cover the entire canvas while maintaining aspect ratio
    if (canvasAspect > imageAspect) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imageAspect;
    } else {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imageAspect;
    }

    // Center the image
    drawX = (canvas.width - drawWidth) / 2;
    drawY = (canvas.height - drawHeight) / 2;

    // Draw the map as background
    ctx.globalAlpha = 1.0;
    ctx.drawImage(mapImage, drawX, drawY, drawWidth, drawHeight);
    ctx.globalAlpha = 1.0;
  };

  const handleBack = () => {
    navigate('/canvas');
  };

  const handleOptionClick = (optionLabel) => {
    // Hardcoded for Eco Rewards Dashboard
    if (optionLabel === 'Eco Rewards Dashboard') {
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleIconClick = useCallback((e) => {
    if (isDraggingIcon) return;
    e.stopPropagation();
    setIconRotation(prev => prev + 90);
    setShowOptions(prev => !prev);
  }, [isDraggingIcon]);

  const handleIconMouseDown = useCallback((e) => {
    e.preventDefault();
    const iconRect = iconRef.current?.getBoundingClientRect();
    
    if (!iconRect) return;
    
    setIsDraggingIcon(true);
    setDragOffset({
      x: e.clientX - iconRect.left - iconRect.width / 2,
      y: e.clientY - iconRect.top - iconRect.height / 2,
    });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingIcon) return;

    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;

    setIconPosition({
      x: x,
      y: y,
    });
  }, [isDraggingIcon, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingIcon(false);
    // Keep the icon at its current position - don't reset iconPosition
  }, []);

  useEffect(() => {
    if (isDraggingIcon) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingIcon, handleMouseMove, handleMouseUp]);

  if (!object) {
    return null;
  }

  return (
    <div className="object-detail-page">
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="object-detail-canvas"
        style={{
          display: 'block',
          backgroundColor: '#1a202c',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          margin: 0,
          padding: 0,
          border: 'none',
        }}
      />

      {/* Selected object - centered with circular options */}
      <div
        className="object-detail-container"
        ref={containerRef}
        style={{
          left: `${iconPosition.x}px`,
          top: `${iconPosition.y}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: isDraggingIcon ? 100 : 10,
        }}
      >
        {/* Wrapper for icon and options - scale this to resize everything */}
        <div className="object-detail-wrapper">
          {/* Central icon - draggable */}
          <div
            ref={iconRef}
            className={`object-detail-icon ${isDraggingIcon ? 'dragging' : ''}`}
            onMouseDown={handleIconMouseDown}
            onClick={handleIconClick}
            style={{
              position: 'relative',
              left: 'auto',
              top: 'auto',
              transform: `rotate(${iconRotation}deg)`,
              transition: isDraggingIcon ? 'none' : 'transform 0.3s ease',
            }}
          >
            {object.icon ? (
              <img
                src={`/assets/${object.icon}.svg`}
                alt={object.name}
                className="object-detail-image"
              />
            ) : (
              <span className="object-detail-text">{object.name.charAt(0)}</span>
            )}
          </div>

          {/* Circular arc options on the right side */}
          {object.options && object.options.length > 0 && (
            <div className={`object-detail-options-circle ${showOptions ? 'visible' : 'hidden'}`}>
              {object.options.map((option, index) => {
                const totalOptions = object.options.length;
                // Arrange in a semicircle on the right side (0 to 180 degrees)
                const angle = (index / (totalOptions - 1)) * 180 - 90; // -90 to 90 degrees
                const radius = 150; // Distance from center to option center
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                return (
                  <div
                    key={index}
                    className="object-detail-option-badge"
                    style={{
                      '--index': index,
                      transform: `translateX(${x}px) translateY(${y}px)`,
                    }}
                    onClick={() => handleOptionClick(option.label)}
                  >
                    <div className="object-detail-option-content">
                      <span className="object-detail-option-label">{option.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Image Component */}
      <ModalImage
        isOpen={showModal}
        onClose={handleCloseModal}
        imageSrc="/assets/modal.png"
        title="Eco Rewards Dashboard"
      />

      {/* Back button */}
      <button className="object-detail-back-btn" onClick={handleBack}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );
};

export default ObjectDetailPage;
