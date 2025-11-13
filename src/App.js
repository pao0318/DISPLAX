import { useState } from 'react';
import CircularGauge from './components/CircularGauge';
import Speedometer from './components/Speedometer';
import ThreeDObject from './components/ThreeDObject';

export default function App() {
  const [objects, setObjects] = useState([
    { id: 1, type: 'gauge', reading: 50 },
  ]);
  
  const [viewMode, setViewMode] = useState('speedometer'); // '2d', '3d', 'advanced3d', 'gauge', or 'speedometer'

  return (
    <div className="w-screen h-screen bg-gray-100">
      {/* View Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white rounded-lg shadow-md p-2 flex flex-wrap justify-end">
         
       
          <button 
            className={`px-3 py-2 rounded-md m-1 ${viewMode === 'gauge' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setViewMode('gauge')}
          >
            Circular Gauge
          </button>
          <button 
            className={`px-3 py-2 rounded-md m-1 ${viewMode === 'speedometer' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setViewMode('speedometer')}
          >
            Speedometer
          </button>
        </div>
      </div>
      
      {/* Render component based on selected view mode */}
      {viewMode === 'gauge' ? <CircularGauge /> : viewMode === 'speedometer' ? <Speedometer /> : viewMode === '3d' ? (
        <ThreeDObject position={[0, 0, 0]} rotation={[0, 0, 0]} />
      ) : (
        <CircularGauge />
      )}
    </div>
  );
}