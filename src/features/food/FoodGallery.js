import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes, FaUtensils, FaStar, FaClock, FaLeaf } from 'react-icons/fa';
import './FoodGallery.css';

const FoodGallery = ({ onBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');

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
    "Ceviche de camarón fresco con aguacate y cilantro, marinado en jugo de limón y acompañado de camote y maíz.",
    "Pescado fresco a la plancha con vegetales de temporada, aderezado con hierbas aromáticas y aceite de oliva.",
    "Camarones salteados al ajillo con vino blanco, perejil fresco y servidos con arroz blanco premium.",
    "Pulpo tierno a la parrilla con ensalada mediterránea, aceitunas kalamata y vinagreta de limón.",
    "Langosta premium en salsa termidor con champiñones, gratinada con queso parmesano y puré de papa trufado.",
    "Tacos de pescado fresco con salsa de mango y habanero, repollo morado y crema de aguacate.",
    "Ensalada fresca de mariscos con vinagreta de limón, aguacate, tomate cherry y hierbas frescas.",
    "Cóctel de camarón signature estilo Mahalo con salsa especial, aguacate y toque de cilantro."
  ];

  const foodDetails = [
    { time: "15 min", category: "Entrada", type: "Mariscos" },
    { time: "25 min", category: "Plato Principal", type: "Pescados" },
    { time: "20 min", category: "Plato Principal", type: "Mariscos" },
    { time: "30 min", category: "Especialidad", type: "Mariscos" },
    { time: "35 min", category: "Premium", type: "Mariscos" },
    { time: "15 min", category: "Especialidad", type: "Pescados" },
    { time: "10 min", category: "Entrada", type: "Ensaladas" },
    { time: "12 min", category: "Entrada", type: "Mariscos" }
  ];

  // Categorías disponibles
  const categories = ['Todos', 'Mariscos', 'Pescados', 'Ensaladas', 'Postres', 'Bebidas'];

  // Filtrar platillos por categoría
  const filteredFoods = activeCategory === 'Todos' 
    ? foodImages.map((_, index) => index)
    : foodImages.map((_, index) => index).filter(index => 
        foodDetails[index].type === activeCategory
      );

  // Platillos estrella (primeros 5)
  const starDishes = foodImages.slice(0, 5);

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
        {/* Sección de Platillos Estrella con fondo blanco */}
        <div className="star-dishes-section">
          <div className="star-dishes-container">
            <div className="section-header">
              <h2>Nuestros Platillos Estrella</h2>
              <div className="title-underline"></div>
            </div>
            <div className="star-dishes-grid">
              {starDishes.map((image, index) => (
                <div 
                  key={index} 
                  className="star-dish-item"
                  onClick={() => openModal(index)}
                >
                  <div className="star-dish-image-container">
                    <img 
                      src={image} 
                      alt={`Platillo estrella ${index + 1}`}
                      className="star-dish-image"
                    />
                    <div className="star-dish-overlay">
                      <div className="star-dish-content">
                        <FaStar className="star-icon" />
                        <span className="star-dish-title">{foodTitles[index]}</span>
                        <span className="star-dish-category">{foodDetails[index].category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros de Categorías */}
        <div className="category-filters">
          <div className="filters-header">
            <h3>Explora por Categoría</h3>
            <p>Descubre nuestros platillos organizados por tipo</p>
          </div>
          <div className="category-buttons">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Comidas Filtrado */}
        <div className="food-grid">
          {filteredFoods.map((index) => (
            <div 
              key={index} 
              className="food-item"
              onClick={() => openModal(index)}
            >
              <div className="food-image-container">
                <img 
                  src={foodImages[index]} 
                  alt={`Platillo ${index + 1}`}
                  className="food-image"
                />
                <div className="food-badge">
                  <span>{foodDetails[index].category}</span>
                </div>
                <div className="type-badge">
                  <span>{foodDetails[index].type}</span>
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

      {/* Modal mejorado para vista ampliada */}
      {isModalOpen && (
        <div className="food-modal-overlay" onClick={closeModal}>
          <div className="food-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <FaTimes />
            </button>
            
            <div className="modal-image-section">
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

                <div className="modal-badges">
                  <div className="modal-badge category">
                    {foodDetails[currentImageIndex].category}
                  </div>
                  <div className="modal-badge type">
                    {foodDetails[currentImageIndex].type}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-info-section">
              <div className="modal-header">
                <h2>{foodTitles[currentImageIndex]}</h2>
                <div className="modal-time">
                  <FaClock className="time-icon" />
                  <span>{foodDetails[currentImageIndex].time}</span>
                </div>
              </div>
              
              <div className="modal-description">
                <p>{foodDescriptions[currentImageIndex]}</p>
              </div>

              <div className="modal-features">
                <div className="feature-highlight">
                  <FaStar className="feature-highlight-icon" />
                  <span>Ingredientes frescos del día</span>
                </div>
                <div className="feature-highlight">
                  <FaLeaf className="feature-highlight-icon" />
                  <span>Preparación artesanal</span>
                </div>
              </div>

              <div className="modal-actions">
                <button className="modal-reserve-btn">
                  Reservar este platillo
                </button>
                <button className="modal-close-btn" onClick={closeModal}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodGallery;