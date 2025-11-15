import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/ObjectDetailPage.css';

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
  const canvasRef = useRef(null);
  const mapImageRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const iconRef = useRef(null);

  // Get the selected object from navigation state
  useEffect(() => {
    if (location.state?.object) {
      setObject(location.state.object);
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
          position: iconPosition.x !== 0 || iconPosition.y !== 0 ? 'fixed' : 'relative',
          left: iconPosition.x !== 0 || iconPosition.y !== 0 ? `${iconPosition.x}px` : 'auto',
          top: iconPosition.y !== 0 || iconPosition.y !== 0 ? `${iconPosition.y}px` : 'auto',
          transform: iconPosition.x !== 0 || iconPosition.y !== 0 ? 'translate(-50%, -50%)' : 'none',
          zIndex: isDraggingIcon ? 100 : 10,
        }}
      >
        {/* Central icon - draggable */}
        <div
          ref={iconRef}
          className={`object-detail-icon ${isDraggingIcon ? 'dragging' : ''}`}
          onMouseDown={handleIconMouseDown}
          style={{
            position: 'relative',
            left: 'auto',
            top: 'auto',
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

        {/* Circular options around the center */}
        {object.options && object.options.length > 0 && (
          <div className="object-detail-options-circle">
            {object.options.map((option, index) => {
              const totalOptions = object.options.length;
              const angle = (index / totalOptions) * 360;
              return (
                <div
                  key={index}
                  className="object-detail-option-badge"
                  style={{
                    '--angle': `${angle}deg`,
                  }}
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
