import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const [activeLocation, setActiveLocation] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  

  const locations = [
    { id: 1, name: 'Hospital', x: 0.7, y: 0.3, color: '#06b6d4', options: ['Patient Records', 'Medical Billing', 'Healthcare Analytics', 'Telemedicine'] },
    { id: 2, name: 'Bank', x: 0.3, y: 0.6, color: '#0ea5e9', options: ['Flexible Credit', 'Smart Mobility', 'Protection & Support', 'Everyday Payments'] },
    { id: 3, name: 'Store', x: 0.5, y: 0.7, color: '#0891b2', options: ['Inventory Management', 'Customer Insights', 'Payment Solutions', 'Loyalty Programs'] },
  ];
  
  // Handle location click
  const handleLocationClick = (location) => {
    setActiveLocation(location);
    setShowOptions(!showOptions);
  };
  
  // Handle option selection
  const handleOptionSelect = (option) => {
    console.log(`Selected ${option} for ${activeLocation.name}`);
    // Here you would handle the action for each option
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawMap(); // Redraw when resized
    };
    
    // Function to draw the map on the canvas
    const drawMap = () => {
      // Create a new image object for the map
      const mapImage = new Image();
      mapImage.src = '/assets/map.svg';
      
      // When the image loads, draw it on the canvas
      mapImage.onload = () => {
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
        
        // Draw EY logo in the bottom right corner
        const logo = new Image();
        logo.src = '/assets/EY_Logo_Beam_STFWC_Stacked_RGB_White_Yellow_EN 2.svg';
        logo.onload = () => {
          const logoWidth = 100;
          const logoHeight = 100;
          ctx.drawImage(logo, canvas.width - logoWidth - 20, canvas.height - logoHeight - 20, logoWidth, logoHeight);
        };
      };
    };
    
    // Initial setup
    resizeCanvas();
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <div className="App">
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block', 
          backgroundColor: '#1a202c' // Dark background while loading
        }}
      />
      
      {/* Location markers */}
      {locations.map(location => (
        <div 
          key={location.id}
          className={`absolute rounded-full cursor-pointer transition-all duration-300 ${activeLocation?.id === location.id ? 'pulse' : ''}`}
          style={{
            left: `${location.x * 100}%`,
            top: `${location.y * 100}%`,
            backgroundColor: location.color,
            width: '60px',
            height: '60px',
            transform: 'translate(-50%, -50%)',
            boxShadow: activeLocation?.id === location.id ? '0 0 20px rgba(103, 232, 249, 0.7)' : '0 0 10px rgba(0, 0, 0, 0.3)',
            zIndex: activeLocation?.id === location.id ? 10 : 1
          }}
          onClick={() => handleLocationClick(location)}
        >
          <div className="flex items-center justify-center h-full text-white font-bold">
            {location.name.charAt(0)}
          </div>
        </div>
      ))}
      
      {/* Options for active location */}
      {showOptions && activeLocation && (
        <div className="absolute z-20" style={{
          left: `${activeLocation.x * 100}%`,
          top: `${activeLocation.y * 100}%`,
          transform: 'translate(-50%, -50%)'
        }}>
          {activeLocation.options.map((option, index) => {
            // Calculate position in a circle
            const angle = (index / activeLocation.options.length) * Math.PI * 2;
            const radius = 100; // Distance from center
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <div 
                key={index}
                className="absolute bg-gray-800 text-white rounded-full cursor-pointer transition-all duration-300"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: '50px',
                  height: '50px',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 10px rgba(103, 232, 249, 0.5)',
                  animation: `fadeIn 0.3s forwards ${index * 0.1}s`,
                  opacity: 0 // Start invisible for animation
                }}
                onClick={() => handleOptionSelect(option)}
              >
                <div className="flex items-center justify-center h-full">
                  {index + 1}
                </div>
                
                {/* Option label */}
                <div 
                  className="absolute whitespace-nowrap bg-gray-800 px-2 py-1 rounded text-xs"
                  style={{
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '5px'
                  }}
                >
                  {option}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Help tooltip */}
      <div className="absolute top-4 left-4 bg-gray-800/80 text-white px-4 py-2 rounded-lg shadow-lg">
        <p>Click on a location to see options</p>
      </div>
    </div>
  );
}

export default App;