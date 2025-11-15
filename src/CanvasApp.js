import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import MapCanvas from './components/MapCanvas';
import DraggableObject from './components/DraggableObject';
import OptionsPanel from './components/OptionsPanel';
import DetailedModal from './components/DetailedModal';

// Import services
import { getAllObjects, updateObjectPosition } from './services/dataService';

function CanvasApp() {
   const [objects, setObjects] = useState([]);
  const [activeObject, setActiveObject] = useState(null);
  const [showHelp, setShowHelp] = useState(true);
  
  // State for center car options
  
  // State for options panel and modal
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedObjectName, setSelectedObjectName] = useState('');
  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  
  // Define the main car object in the center (not part of draggable objects)
  
  
  // Load objects on component mount - only once
  useEffect(() => {
    const loadedObjects = getAllObjects();
    setObjects(loadedObjects);
  }, []);
  
  // Hide help tooltip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHelp(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle center car click to toggle options
  
  // Handle animation completion
  
  
  // Handle object click - toggles active object for options visibility inside DraggableObject
  const handleObjectClick = useCallback((object) => {
    setActiveObject(prev => (prev?.id === object.id ? null : object));
  }, []);
  
  // Handle object drag - memoized with useCallback
  const handleObjectDrag = useCallback((id, position) => {
    // Use functional updates to avoid stale closures
    setObjects(prevObjects => 
      prevObjects.map(obj => 
        obj.id === id ? { ...obj, ...position } : obj
      )
    );
    
    // Update active object if it's the one being dragged
    setActiveObject(prev => 
      prev?.id === id ? { ...prev, ...position } : prev
    );
    
    // Update position in data service
    updateObjectPosition(id, position);
  }, []);
  
  // Handle option selection
  const handleOptionSelect = useCallback((objectId, option) => {
    console.log(`Selected ${option.label}`);
    console.log("inside the handleOptionSelect function in canvasapp")
    
    // Find the object name
    let objName = 'Car';
    if (objectId !== 'center-car') {
      const obj = objects.find(o => o.id === objectId);
      objName = obj ? obj.name : 'Object';
    }
    
    setSelectedOption(option);
    setSelectedObjectName(objName);
    
    // Generate modal data based on the selected option
    const data = generateModalData(option, objName);
    setModalData(data);
    setShowDetailedModal(true);
  }, [objects]);
  
  // Generate modal data based on the selected option
  const generateModalData = (option, objectName) => {
    // Default metrics for car options
    const defaultMetrics = {
      'Driving Insights': [
        { name: 'Electricity Quality', value: '30%', color: '#70CDDD' },
        { name: 'Effective Acceleration', value: '45%', color: '#157B66' },
        { name: 'Slow charging', value: '22%', color: '#00ABDA' },
        { name: 'Braking Regeneration', value: '17%', color: '#467C94' },
        { name: 'Speeding', value: '68%', color: '#04BB65' }
      ],
      'Vehicle Finance Overview': [
        { name: 'Monthly Payment', value: '85%', color: '#70CDDD' },
        { name: 'Interest Rate', value: '42%', color: '#157B66' },
        { name: 'Loan Term', value: '65%', color: '#00ABDA' },
        { name: 'Down Payment', value: '28%', color: '#467C94' },
        { name: 'Total Cost', value: '73%', color: '#04BB65' }
      ],
      'Eco Rewards Dashboard': [
        { name: 'Carbon Savings', value: '62%', color: '#70CDDD' },
        { name: 'Energy Efficiency', value: '78%', color: '#157B66' },
        { name: 'Green Miles', value: '54%', color: '#00ABDA' },
        { name: 'Eco Score', value: '91%', color: '#467C94' },
        { name: 'Rewards Points', value: '47%', color: '#04BB65' }
      ],
      'Predictive Finance AI': [
        { name: 'Prediction Accuracy', value: '87%', color: '#70CDDD' },
        { name: 'Cost Savings', value: '63%', color: '#157B66' },
        { name: 'Future Value', value: '45%', color: '#00ABDA' },
        { name: 'Risk Assessment', value: '72%', color: '#467C94' },
        { name: 'AI Confidence', value: '89%', color: '#04BB65' }
      ],
      'My Journey Summary': [
        { name: 'Distance Traveled', value: '76%', color: '#70CDDD' },
        { name: 'Time Efficiency', value: '58%', color: '#157B66' },
        { name: 'Route Optimization', value: '81%', color: '#00ABDA' },
        { name: 'Fuel Efficiency', value: '64%', color: '#467C94' },
        { name: 'Journey Score', value: '92%', color: '#04BB65' }
      ]
    };
    
    // Get metrics for this option or use default
    const metrics = defaultMetrics[option.label] || [
      { name: 'Performance', value: '75%', color: '#70CDDD' },
      { name: 'Efficiency', value: '60%', color: '#157B66' },
      { name: 'Reliability', value: '85%', color: '#00ABDA' },
      { name: 'Cost', value: '45%', color: '#467C94' },
      { name: 'Overall', value: '72%', color: '#04BB65' }
    ];
    
    return {
      title: option.label,
      subtitle: option.description || `Detailed information for ${objectName}`,
      badgeTitle: 'Green Champion',
      badgeValue: '3000 pts',
      metrics: metrics,
      alert: {
        title: 'You have been running on low charge.',
        subtitle: 'Nearest charging station is 10 miles away.',
        timeLeft: '30 min left'
      },
      tabs: [
        'Overall',
        'Speeding',
        'Braking',
        'Slow Charging',
        'Effective Acceleration',
        'Electricity Quality'
      ]
    };
  };
  
  return (
    <div className="App">
      {/* Map background */}
      <MapCanvas mapSrc="/assets/map.svg" />
      
      {/* Draggable objects on the map */}
      {objects.map(object => (
        <DraggableObject
          key={object.id}
          object={object}
          options={object.options}
          onOptionSelect={handleOptionSelect}
          onDrag={handleObjectDrag}
          onClick={handleObjectClick}
          isActive={activeObject?.id === object.id}
        />
      ))}
      

      
      {/* Help tooltip */}
      {showHelp && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800/80 text-white px-4 py-2 rounded-lg shadow-lg text-center">
          <p className="font-bold mb-1">How to interact:</p>
          <p className="text-sm">🖱️ Click and drag to move objects</p>
          <p className="text-sm">🔄 Click center car to show options</p>
        </div>
      )}
      
      {/* EY Logo */}
      <div className="absolute bottom-4 right-4 w-24 pointer-events-auto">
        <img src="/assets/EY_Logo_Beam_STFWC_Stacked_RGB_White_Yellow_EN 2.svg" alt="EY Logo" />
      </div>
      
      {/* Help button */}
      <button 
        className="absolute bottom-4 left-4 bg-gray-800/80 text-white p-2 rounded-full shadow-lg"
        onClick={() => setShowHelp(prev => !prev)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      {/* Options Panel - Original panel */}
      {selectedOption && !showDetailedModal && (
        <OptionsPanel
          option={selectedOption}
          objectName={selectedObjectName}
          onClose={() => setSelectedOption(null)}
        />
      )}
      
      {/* Detailed Modal - New modal with Figma design */}
      <DetailedModal 
        isOpen={showDetailedModal}
        onClose={() => setShowDetailedModal(false)}
        data={modalData}
      />
    </div>
  );

}

export default CanvasApp;
