import React, { useState, useRef, useCallback } from 'react';
import '../styles/ModalImage.css';

/**
 * ModalImage - Draggable modal component for displaying images
 */
const ModalImage = ({ isOpen, onClose, imageSrc, title }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    const modalRect = modalRef.current?.getBoundingClientRect();
    
    if (!modalRect) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - modalRect.left - modalRect.width / 2,
      y: e.clientY - modalRect.top - modalRect.height / 2,
    });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;

    setPosition({
      x: x,
      y: y,
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  return (
    <div className="modal-image-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className={`modal-image-container ${isDragging ? 'dragging' : ''}`}
        style={{
          position: position.x !== 0 || position.y !== 0 ? 'fixed' : 'absolute',
          left: position.x !== 0 || position.y !== 0 ? `${position.x}px` : '50%',
          top: position.y !== 0 || position.y !== 0 ? `${position.y}px` : '50%',
          transform: position.x !== 0 || position.y !== 0 ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)',
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
      >
        <img src={imageSrc} alt={title} className="modal-image" />
      </div>
    </div>
  );
};

export default ModalImage;
