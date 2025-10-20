import React, { useState, useRef, useEffect } from 'react';
import './HeroVideo.css';
import mahaloVideo from '../assets/videos/video-mahalo.mp4';

const HeroVideo = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef(null);
  const sectionRef = useRef(null);

  // Intersection Observer for performance optimization
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handle video loading
  const handleVideoLoad = () => {
    setIsLoaded(true);
    if (videoRef.current) {
      videoRef.current.classList.add('loaded');
    }
  };

  // Check if mobile for responsive video handling
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div 
      className={`hero-video-section ${!isLoaded ? 'loading' : ''}`} 
      ref={sectionRef}
    >
      <div className="hero-video-container">
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay={isVisible}
          muted
          loop
          playsInline
          poster=""
          onLoadedData={handleVideoLoad}
          onCanPlayThrough={handleVideoLoad}
          preload="metadata"
        >
          <source src={mahaloVideo} type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">Mahalo Beach Club</h1>
            <p className="hero-subtitle">Tu casa en la playa</p>
            <p className="hero-description">
              Disfruta de una experiencia única en nuestro exclusivo club de playa
              con las mejores instalaciones y servicios en Acapulco, Guerrero.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroVideo;
