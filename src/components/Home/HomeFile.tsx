import React, { useState, useEffect } from "react";
import "./homeFile.css";
import torton16piesImage from "../../assets/images/torton16pies.jpeg";
import termo10piesRabonImage from "../../assets/images/termo10piesRabon.jpeg";
import camaBaja45piesImage from "../../assets/images/camaBaja45pies.jpeg";
import plataformas10piesImage from "../../assets/images/plataformas10pies.jpeg";


interface CarouselItem {
  id: string;
  label: string;
  image: string;
}

const HomeFile: React.FC = () => {
  const sampleImages: CarouselItem[] = [
    {
      id: "1",
      label: "Torton 16 pies",
      image: torton16piesImage
    },
    {
      id: "2",
      label: "Termo 10 pies Rabon",
      image: termo10piesRabonImage
    },
    {
      id: "3",
      label: "Cama Baja 45 pies",
      image: camaBaja45piesImage
    },
    {
      id: "4",
      label: "Plataformas 10 pies",
      image: plataformas10piesImage
    }
  ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);

  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sampleImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [autoPlay, sampleImages.length]);

  const goToPrev = () => {
    setCurrentIndex((prev) => 
      (prev - 1 + sampleImages.length) % sampleImages.length
    );
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sampleImages.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  // Función para obtener el índice de las imágenes adyacentes
  const getAdjacentIndex = (offset: number) => {
    return (currentIndex + offset + sampleImages.length) % sampleImages.length;
  };

  return (
    <div className="carousel-container">
      {/* Fondo difuminado con la imagen actual */}
      <div 
        className="carousel-blur-background"
        style={{ 
          backgroundImage: `url(${sampleImages[currentIndex].image})` 
        }}
      />
      
      <div className="carousel-wrapper">
        <button className="carousel-button prev" onClick={goToPrev}>
          &lt;
        </button>
        
        <div className="carousel-slides-container">
          {/* Imagen previa (izquierda) */}
          <div className="carousel-slide adjacent left">
            <img 
              src={sampleImages[getAdjacentIndex(-1)].image} 
              alt={sampleImages[getAdjacentIndex(-1)].label}
            />
          </div>
          
          {/* Imagen central (actual) */}
          <div className="carousel-slide main">
            <img 
              src={sampleImages[currentIndex].image} 
              alt={sampleImages[currentIndex].label}
            />
            <div className="slide-caption">
              {sampleImages[currentIndex].label}
            </div>
          </div>
          
          {/* Imagen siguiente (derecha) */}
          <div className="carousel-slide adjacent right">
            <img 
              src={sampleImages[getAdjacentIndex(1)].image} 
              alt={sampleImages[getAdjacentIndex(1)].label}
            />
          </div>
        </div>
        
        <button className="carousel-button next" onClick={goToNext}>
          &gt;
        </button>
      </div>

      <div className="carousel-indicators">
        {sampleImages.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? "active" : ""}`}
            onClick={() => goToIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeFile;