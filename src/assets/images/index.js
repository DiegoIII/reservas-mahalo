// Assets index file for Mahalo Beach Club
import mahaloLogo from './mahalo-logo.jpng.png';
import alberca from './alberca.jpg';
import restaurant from './restaurant.jpg';

// Room images
import cuarto1Pic1 from './cuarto-1/cuarto-1-pic-1.jpg';
import cuarto1Pic2 from './cuarto-1/cuarto-1-pic-2.jpg';
import cuarto1Pic3 from './cuarto-1/cuarto-1-pic-3.jpg';
import cuarto1Pic4 from './cuarto-1/cuarto-1-pic-4.jpg';
import cuarto1Pic5 from './cuarto-1/cuarto-1-pic-5.jpg';
import cuarto1Pic6 from './cuarto-1/cuarto-1-pic-6.jpg';

import cuarto2Pic1 from './cuarto-2/cuarto-2-pic-1.jpg';
import cuarto2Pic2 from './cuarto-2/cuarto-2-pic-2.jpg';
import cuarto2Pic3 from './cuarto-2/cuarto-2-pic-3.jpg';
import cuarto2Pic4 from './cuarto-2/cuarto-2-pic-4.jpg';
import cuarto2Pic5 from './cuarto-2/cuarto-2-pic-5.jpg';
import cuarto2Pic6 from './cuarto-2/cuarto-2-pic-6.jpg';

import cuarto3Pic1 from './cuarto-3/cuarto-3-pic-1.jpg';
import cuarto3Pic2 from './cuarto-3/cuarto-3-pic-2.jpg';
import cuarto3Pic3 from './cuarto-3/cuarto-3-pic-3.jpg';
import cuarto3Pic4 from './cuarto-3/cuarto-3-pic-4.jpg';
import cuarto3Pic5 from './cuarto-3/cuarto-3-pic-5.jpg';

import cuarto4Pic1 from './cuarto-4/cuarto-4-pic-1.jpg';
import cuarto4Pic2 from './cuarto-4/cuarto-4-pic-2.jpg';
import cuarto4Pic3 from './cuarto-4/cuarto-4-pic-3.jpg';
import cuarto4Pic4 from './cuarto-4/cuarto-4-pic-4.jpg';
import cuarto4Pic5 from './cuarto-4/cuarto-4-pic-5.jpg';
import cuarto4Pic6 from './cuarto-4/cuarto-4-pic-6.jpg';

import cuarto5Pic1 from './cuarto-5/cuarto-5-pic-1.jpg';
import cuarto5Pic2 from './cuarto-5/cuarto-5-pic-2.jpg';
import cuarto5Pic3 from './cuarto-5/cuarto-5-pic-3.jpg';
import cuarto5Pic4 from './cuarto-5/cuarto-5-pic-4.jpg';
import cuarto5Pic5 from './cuarto-5/cuarto-5-pic-5.jpg';
import cuarto5Pic6 from './cuarto-5/cuarto-5-pic-6.jpg';
import cuarto5Pic7 from './cuarto-5/cuarto-5-pic-7.jpg';

// Main page images
import mahaloPic1 from './pagina-principal/mahalo_pic_1.jpg';
import mahaloPic2 from './pagina-principal/mahalo_pic_2.jpg';
import mahaloPic3 from './pagina-principal/mahalo_pic_3.jpg';
import mahaloPic4 from './pagina-principal/mahalo_pic_4.jpg';

// Food images
import comida1 from './comidas/comida_1.jpg';
import comida2 from './comidas/comida_2.jpg';
import comida3 from './comidas/comida_3.jpg';
import comida4 from './comidas/comida_4.jpg';
import comida5 from './comidas/comida_5.jpg';
import comida6 from './comidas/comida_6.jpg';
import comida7 from './comidas/comida_7.jpg';
import comida8 from './comidas/comida_8.jpg';

// Export main logo
export { mahaloLogo };

// Export facility images
export { alberca, restaurant };

// Export room images organized by room
export const roomImages = {
  cuarto1: [cuarto1Pic1, cuarto1Pic2, cuarto1Pic3, cuarto1Pic4, cuarto1Pic5, cuarto1Pic6],
  cuarto2: [cuarto2Pic1, cuarto2Pic2, cuarto2Pic3, cuarto2Pic4, cuarto2Pic5, cuarto2Pic6],
  cuarto3: [cuarto3Pic1, cuarto3Pic2, cuarto3Pic3, cuarto3Pic4, cuarto3Pic5],
  cuarto4: [cuarto4Pic1, cuarto4Pic2, cuarto4Pic3, cuarto4Pic4, cuarto4Pic5, cuarto4Pic6],
  cuarto5: [cuarto5Pic1, cuarto5Pic2, cuarto5Pic3, cuarto5Pic4, cuarto5Pic5, cuarto5Pic6, cuarto5Pic7]
};

// Export main page images
export const mainPageImages = [mahaloPic1, mahaloPic2, mahaloPic3, mahaloPic4];

// Export food images
export const foodImages = [comida1, comida2, comida3, comida4, comida5, comida6, comida7, comida8];

// Export all images as a single object for easy access
export const images = {
  logo: mahaloLogo,
  alberca,
  restaurant,
  roomImages,
  mainPageImages,
  foodImages
};
