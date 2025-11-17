import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes, FaUtensils } from 'react-icons/fa';
import './FoodGallery.css';

const FoodGallery = ({ onBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Scroll automático al inicio de la página cuando se carga el componente
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Importar imágenes de comidas dinámicamente
  const foodImages = [
    require('../../assets/images/comidas/comida_1.jpg'),
    require('../../assets/images/comidas/comida_2.jpg'),
    require('../../assets/images/comidas/comida_3.jpg'),
    require('../../assets/images/comidas/comida_4.jpg'),
    require('../../assets/images/comidas/comida_5.jpg'),
    require('../../assets/images/comidas/comida_6.jpg'),
    require('../../assets/images/comidas/comida_7.jpg'),
    require('../../assets/images/comidas/comida_8.jpg')
  ];

  const foodDescriptions = [
    "Ceviche de camarón fresco con aguacate y cilantro",
    "Pescado a la plancha con vegetales de temporada",
    "Camarones al ajillo con arroz blanco",
    "Pulpo a la parrilla con ensalada mediterránea",
    "Langosta termidor con puré de papa",
    "Tacos de pescado con salsa de mango",
    "Ensalada de mariscos con vinagreta de limón",
    "Cóctel de camarón estilo Mahalo"
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % foodImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + foodImages.length) % foodImages.length);
  };

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="food-gallery">
      <div className="food-gallery-header">
        <div className="gallery-title-section">
          <div className="title-icon">
            <FaUtensils />
          </div>
          <div className="title-content">
            <h1>Gastronomía de Mahalo</h1>
            <p>Descubre los sabores únicos de Mahalo Beach Club</p>
          </div>
        </div>
      </div>

      <div className="food-gallery-content">
        <div className="gallery-intro">
          <div className="intro-card">
            <h2>Nuestros Platillos Estrella</h2>
            <p>
              En Mahalo Beach Club, cada platillo es una obra de arte culinaria. 
              Nuestro chef ejecutivo utiliza ingredientes frescos del mar y productos 
              locales para crear experiencias gastronómicas únicas que complementan 
              perfectamente tu estancia en el paraíso.
            </p>
            <div className="intro-features">
              <div className="feature-item">
                <FaUtensils className="feature-icon" />
                <span>Mariscos frescos del día</span>
              </div>
              <div className="feature-item">
                <FaUtensils className="feature-icon" />
                <span>Chef ejecutivo certificado</span>
              </div>
              <div className="feature-item">
                <FaUtensils className="feature-icon" />
                <span>Vista panorámica al mar</span>
              </div>
            </div>
          </div>
        </div>

        <div className="food-grid">
          {foodImages.map((image, index) => (
            <div 
              key={index} 
              className="food-item"
              onClick={() => openModal(index)}
            >
              <div className="food-image-container">
                <img 
                  src={image} 
                  alt={`Platillo ${index + 1}`}
                  className="food-image"
                />
                <div className="food-overlay">
                  <div className="overlay-content">
                    <FaUtensils className="overlay-icon" />
                    <span>Ver detalles</span>
                  </div>
                </div>
              </div>
              <div className="food-info">
                <h3>Platillo {index + 1}</h3>
                <p>{foodDescriptions[index]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para vista ampliada */}
      {isModalOpen && (
        <div className="food-modal-overlay" onClick={closeModal}>
          <div className="food-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <FaTimes />
            </button>
            
            <div className="modal-image-container">
              <img 
                src={foodImages[currentImageIndex]} 
                alt={`Platillo ${currentImageIndex + 1}`}
                className="modal-image"
              />
              
              {foodImages.length > 1 && (
                <>
                  <button className="modal-nav prev" onClick={prevImage}>
                    <FaChevronLeft />
                  </button>
                  <button className="modal-nav next" onClick={nextImage}>
                    <FaChevronRight />
                  </button>
                </>
              )}
              
              <div className="image-counter">
                {currentImageIndex + 1} / {foodImages.length}
              </div>
            </div>
            
            <div className="modal-info">
              <h3>Platillo {currentImageIndex + 1}</h3>
              <p>{foodDescriptions[currentImageIndex]}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodGallery;
