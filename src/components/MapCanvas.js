import React, { useEffect, useRef, memo } from 'react';

/**
 * MapCanvas component that renders a map background on a canvas
 * @param {Object} props
 * @param {string} props.mapSrc - Source URL for the map image
 */
const MapCanvas = memo(({ mapSrc }) => {
  const canvasRef = useRef(null);
  const mapImageRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  
  // Load map image once
  useEffect(() => {
    const mapImage = new Image();
    mapImage.src = mapSrc;
    mapImageRef.current = mapImage;
    
    // When the image loads, draw the map
    mapImage.onload = () => {
      if (canvasRef.current) {
        drawMap(canvasRef.current, mapImage);
      }
    };
    
    return () => {
      // Clean up any pending timeouts
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [mapSrc]);
  
  // Set up canvas and handle resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Function to draw the map on the canvas
    const drawMapOnCanvas = () => {
      if (mapImageRef.current) {
        drawMap(canvas, mapImageRef.current);
      }
    };
    
    // Function to set canvas size based on device pixel ratio for crisp rendering
    const setCanvasSize = () => {
      let width = window.innerWidth;
      let height = window.innerHeight;
      
      // Ensure minimum dimensions for visibility
      width = Math.max(width, 320);
      height = Math.max(height, 568);
      
      // Set canvas size directly without DPR scaling for mobile compatibility
      canvas.width = width;
      canvas.height = height;
      
      // Ensure canvas fills the viewport
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      
      drawMapOnCanvas();
    };
    
    // Set canvas to full window size with debounced resize
    const handleResize = () => {
      // Clear any pending resize timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      // Debounce resize to avoid excessive redraws
      resizeTimeoutRef.current = setTimeout(() => {
        setCanvasSize();
        resizeTimeoutRef.current = null;
      }, 100);
    };
    
    // Handle orientation change on mobile
    const handleOrientationChange = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        setCanvasSize();
        resizeTimeoutRef.current = null;
      }, 200);
    };
    
    // Initial setup
    setCanvasSize();
    
    // Handle window resize
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);
  
  // Function to draw the map - extracted for reuse
  const drawMap = (canvas, mapImage) => {
    const ctx = canvas.getContext('2d'); 
    
    if (!ctx) return;
    
    // Use image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';
    
    // Clear the canvas with background color
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
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
    
    // Draw the map as background, covering the entire canvas
    ctx.globalAlpha = 0.6; // Make it slightly transparent
    ctx.drawImage(mapImage, drawX, drawY, drawWidth, drawHeight);
    ctx.globalAlpha = 1.0;
    
    // Add a subtle overlay gradient for better readability
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(20, 30, 40, 0.7)');
    gradient.addColorStop(1, 'rgba(40, 50, 60, 0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  
  return (
    <canvas 
      ref={canvasRef} 
      className="map-canvas"
      style={{ 
        display: 'block', 
        backgroundColor: '#1a202c', // Dark background while loading
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        margin: 0,
        padding: 0,
        border: 'none'
      }}
    />
  );
});

export default MapCanvas;
