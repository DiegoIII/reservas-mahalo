import React from 'react';
import './HeroVideo.css';
import mahaloVideo from './video/video-mahalo.mp4';

const HeroVideo = () => {
  return (
    <div className="hero-video-section">
      <div className="hero-video-container">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster=""
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
