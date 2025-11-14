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
    
    // Set canvas to full window size with debounced resize
    const handleResize = () => {
      // Clear any pending resize timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      // Debounce resize to avoid excessive redraws
      resizeTimeoutRef.current = setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawMapOnCanvas();
        resizeTimeoutRef.current = null;
      }, 100);
    };
    
    // Initial setup
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawMapOnCanvas();
    
    // Handle window resize
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);
  
  // Function to draw the map - extracted for reuse
  const drawMap = (canvas, mapImage) => {
    const ctx = canvas.getContext('2d', { alpha: false }); // alpha: false for better performance
    
    // Use hardware acceleration when available
    if (ctx.imageSmoothingEnabled !== undefined) {
      ctx.imageSmoothingQuality = 'low'; // 'low', 'medium', or 'high'
    }
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the map as background, covering the entire canvas
    ctx.globalAlpha = 0.6; // Make it slightly transparent
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
    
    // Add a subtle overlay gradient
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
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}
    />
  );
});

export default MapCanvas;
