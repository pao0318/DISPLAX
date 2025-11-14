import { useNavigate } from 'react-router-dom';
import '../styles/CarCenterPage.css';

/**
 * CarCenterPage component - Shows car center icon with options
 */
const CarCenterPage = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/canvas');
  };

  return (
    <div className="car-center-page">
    

        {/* Continue button */}
        <button className="car-center-button" onClick={handleContinue}>
          Continue to Canvas
        </button>
      </div>
 
  );
};

export default CarCenterPage;
