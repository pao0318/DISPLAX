import React from 'react';
import RotatableObjectWithOptions from './components/RotatableObjectWithOptions';
import CarObject from './components/CarObject';
import { initialMockData } from './data/mockData';

export default function App() {
  // Define the options that will always be part of the main object
  const vehicleOptions = [
    { id: 1, label: 'Driving Insights' },
    { id: 2, label: 'Vehicle Finance Overview' },
    { id: 3, label: 'Eco Rewards Dashboard' },
    { id: 4, label: 'Predictive Finance AI' }
  ];
  
  // Handle option selection
  const handleOptionSelect = (option) => {
    console.log(`Selected option: ${option.label}`);
    // Here you would handle the action for each option
    // For example, navigate to a different screen or show more details
  };
  
  return (
    <div className="w-screen h-screen bg-gray-100">
      <RotatableObjectWithOptions
        initialPosition={{
          // Use the position from the first object in mock data
          x: initialMockData.objects[0].x * 10 - 5, // Convert from 0-1 range to -5 to 5 range
          y: initialMockData.objects[0].y * 10 - 5,
          z: 0
        }}
        options={vehicleOptions}
        onOptionSelect={handleOptionSelect}
        objectContent={<CarObject />}
        optionsRadius={4}      // Controls how far the options appear from the center
        rotationSensitivity={2} // Controls how quickly options appear with rotation
      />
    </div>
  );
}