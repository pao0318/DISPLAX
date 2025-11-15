import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import '../styles/largeScreenPages.css';

const LargeScreenPage3 = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Fetch square animation from public/data/
    fetch('/data/loading.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Animation data loaded successfully:', data);
        setAnimationData(data);
      })
      .catch((err) => console.error('Error loading animation:', err));
  }, []);


  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a1a',
      gap: '40px',
    }}>
      <div style={{
        width: '400px',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {animationData ? (
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        ) : (
          <p style={{ color: 'white', fontSize: '18px' }}>Loading animation...</p>
        )}
      </div>

    </div>
  );
};

export default LargeScreenPage3;
