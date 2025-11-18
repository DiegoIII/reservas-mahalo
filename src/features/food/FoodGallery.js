import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes, FaUtensils, FaStar, FaClock, FaLeaf } from 'react-icons/fa';
import './FoodGallery.css';

const FoodGallery = ({ onBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const foodTitles = [
    "Ceviche de Camarón Premium",
    "Pescado a la Plancha Gourmet",
    "Camarones al Ajillo Especial",
    "Pulpo a la Parrilla Mediterráneo",
    "Langosta Termidor Clásica",
    "Tacos de Pescado Tropical",
    "Ensalada de Mariscos Frescos",
    "Cóctel de Camarón Signature"
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

  const foodDetails = [
    { time: "15 min", category: "Entrada" },
    { time: "25 min", category: "Plato Principal" },
    { time: "20 min", category: "Plato Principal" },
    { time: "30 min", category: "Especialidad" },
    { time: "35 min", category: "Premium" },
    { time: "15 min", category: "Especialidad" },
    { time: "10 min", category: "Entrada" },
    { time: "12 min", category: "Entrada" }
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
          <div className="title-decoration">
            <div className="decoration-line"></div>
            <div className="title-icon">
              <FaUtensils />
            </div>
            <div className="decoration-line"></div>
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
            <div className="intro-header">
              <h2>Nuestros Platillos Estrella</h2>
              <div className="title-underline"></div>
            </div>
            <p>
              En Mahalo Beach Club, cada platillo es una obra de arte culinaria. 
              Nuestro chef ejecutivo utiliza ingredientes frescos del mar y productos 
              locales para crear experiencias gastronómicas únicas que complementan 
              perfectamente tu estancia en el paraíso.
            </p>
            <div className="intro-features">
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <FaStar className="feature-icon" />
                </div>
                <div className="feature-text">
                  <span className="feature-title">Ingredientes Premium</span>
                  <span>Mariscos frescos del día</span>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <FaUtensils className="feature-icon" />
                </div>
                <div className="feature-text">
                  <span className="feature-title">Chef Certificado</span>
                  <span>Ejecutivo internacional</span>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <FaLeaf className="feature-icon" />
                </div>
                <div className="feature-text">
                  <span className="feature-title">Ambiente Único</span>
                  <span>Vista panorámica al mar</span>
                </div>
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
                <div className="food-badge">
                  <span>{foodDetails[index].category}</span>
                </div>
                <div className="food-overlay">
                  <div className="overlay-content">
                    <FaUtensils className="overlay-icon" />
                    <span>Ver detalles</span>
                  </div>
                </div>
              </div>
              <div className="food-info">
                <div className="food-header">
                  <h3>{foodTitles[index]}</h3>
                  <div className="food-time">
                    <FaClock className="time-icon" />
                    <span>{foodDetails[index].time}</span>
                  </div>
                </div>
                <p>{foodDescriptions[index]}</p>
                <div className="food-cta">
                  <span>Descubrir más</span>
                </div>
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
              <div className="modal-header">
                <h3>{foodTitles[currentImageIndex]}</h3>
                <div className="modal-details">
                  <div className="detail-item">
                    <FaClock className="detail-icon" />
                    <span>{foodDetails[currentImageIndex].time}</span>
                  </div>
                  <div className="detail-item">
                    <FaUtensils className="detail-icon" />
                    <span>{foodDetails[currentImageIndex].category}</span>
                  </div>
                </div>
              </div>
              <p>{foodDescriptions[currentImageIndex]}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodGallery;