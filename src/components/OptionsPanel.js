import React, { useState, useRef, useCallback, memo } from 'react';

/**
 * OptionsPanel component - displays detailed information about selected option
 * Draggable and responsive for mobile and desktop
 */
const OptionsPanel = memo(({ option, objectName, onClose }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef(null);

  // Generate random metrics data
  const generateMetrics = () => {
    return {
      efficiency: Math.floor(Math.random() * 100),
      performance: Math.floor(Math.random() * 100),
      reliability: Math.floor(Math.random() * 100),
      speed: Math.floor(Math.random() * 100),
      power: Math.floor(Math.random() * 100),
    };
  };

  const [metrics] = useState(generateMetrics());

  // Handle drag 
  const handleDragStart = useCallback((e) => {
    if (e.target.closest('.close-btn')) return;
    
    setIsDragging(true);
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  // Handle drag move
  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Clamp to viewport
    const clampedX = Math.max(0, Math.min(newX, window.innerWidth - 300));
    const clampedY = Math.max(0, Math.min(newY, window.innerHeight - 300));

    setPosition({ x: clampedX, y: clampedY });
  }, [isDragging, dragOffset]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  return (
    <div
      ref={panelRef}
      className="fixed bg-gray-900 border-2 border-cyan-500 rounded-lg shadow-2xl p-6 z-50 w-96 max-w-full"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleDragStart}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-cyan-500">
        <div>
          <h2 className="text-xl font-bold text-white">{option.label}</h2>
          <p className="text-sm text-gray-400">{objectName}</p>
        </div>
        <button
          className="close-btn text-gray-400 hover:text-white text-2xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-6">{option.description}</p>

      {/* Metrics */}
      <div className="space-y-3 mb-6">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-gray-300 capitalize">{key}</label>
              <span className="text-cyan-400 font-bold">{value}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-2 rounded-full transition-all"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Alert */}
      <div className="bg-red-900 border-l-4 border-red-500 p-4 rounded">
        <div className="flex items-start">
          <span className="text-red-500 text-xl mr-2">⚠️</span>
          <div>
            <p className="text-red-200 font-semibold text-sm">System Alert</p>
            <p className="text-red-300 text-xs mt-1">
              Maintenance required in {Math.floor(Math.random() * 30) + 10} days
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-colors">
        View Details
      </button>
    </div>
  );
});

OptionsPanel.displayName = 'OptionsPanel';

export default OptionsPanel;
