import { Link } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { ProductCard } from '../components/ProductCard';
import Pastel1 from '../../../assets/pastel1.jpg';
import Pastel2 from '../../../assets/pastel2.jpg';
import Pastel3 from '../../../assets/pastel3.jpg';
import Pastel4 from '../../../assets/pastel4.jpg';
import Pastel5 from '../../../assets/pastel5.jpg';
import Pastel6 from '../../../assets/pastel6.jpg';
import Pastel7 from '../../../assets/pastel7.jpg';
import Pastel8 from '../../../assets/pastel8.jpg';

const pasteles = [
  // Productos reales
  {
    id: 'pastel-boda-2pisos',
    name: 'Pastel de 2 Pisos Boda',
    price: 450,
    image: Pastel1,
  },
  {
    id: 'pastel-cumple-sencillo',
    name: 'Pastel de Cumpleaños Sencillo',
    price: 520,
    image: Pastel2,
    badge: 'Más vendido' as const,
  },
  {
    id: 'pastel-ano-nuevo',
    name: 'Pastel de Año Nuevo',
    price: 85,
    image: Pastel3,
  },
  {
    id: 'pastel-cumple-2pisos',
    name: 'Pastel de Cumpleaños 2 Pisos',
    price: 280,
    image: Pastel4,
  },
  {
    id: 'pastel-15-anos',
    name: 'Pastel de 15 Años',
    price: 120,
    image: Pastel5,
  },
  {
    id: 'pastel-durazno',
    name: 'Pastel de Durazno',
    price: 490,
    image: Pastel6,
    badge: 'Nuevo' as const,
  },
  {
    id: 'pastel-3leches',
    name: 'Pastel de 3 Leches Clásico',
    price: 180,
    image: Pastel7,
    badge: 'Más vendido' as const,
  },
  {
    id: 'pastel-navidad',
    name: 'Pastel de Navidad',
    price: 150,
    image: Pastel8,
  },
  // Productos dummy adicionales
  {
    id: 'pastel-chocolate-intenso',
    name: 'Pastel de Chocolate Intenso',
    price: 380,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=600&fit=crop',
    badge: 'Nuevo' as const,
  },
  {
    id: 'pastel-fresas-crema',
    name: 'Pastel de Fresas con Crema',
    price: 420,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=600&fit=crop',
  },
  {
    id: 'pastel-red-velvet',
    name: 'Pastel Red Velvet',
    price: 550,
    image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=600&h=600&fit=crop',
    badge: 'Más vendido' as const,
  },
  {
    id: 'pastel-zanahoria',
    name: 'Pastel de Zanahoria',
    price: 320,
    image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&h=600&fit=crop',
  },
  {
    id: 'pastel-vainilla-clasico',
    name: 'Pastel de Vainilla Clásico',
    price: 290,
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&h=600&fit=crop',
  },
  {
    id: 'pastel-fondant-personalizado',
    name: 'Pastel Fondant Personalizado',
    price: 850,
    image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=600&h=600&fit=crop',
    badge: 'Edición limitada' as const,
  },
  {
    id: 'pastel-moka',
    name: 'Pastel de Moka',
    price: 360,
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&h=600&fit=crop',
  },
  {
    id: 'pastel-limon',
    name: 'Pastel de Limón',
    price: 310,
    image: 'https://images.unsplash.com/photo-1519869325930-281384f7f637?w=600&h=600&fit=crop',
    badge: 'Nuevo' as const,
  },
];

export function PastelesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      {/* Hero de sección - estilo Porto's */}
      <section className="relative h-[340px] sm:h-[400px] lg:h-[450px] overflow-hidden">
        <img
          src="https://cdn.shopify.com/s/files/1/0007/2164/9722/files/Shopy_By_Holiday_-_Desktop_1.png?v=1762288002"
          alt="Variedad de pasteles artesanales"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Sin overlay full, el fondo va en el contenedor del texto */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/75 px-10 py-6 flex flex-col items-center">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl text-[#3E2412] mb-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Nuestros Pasteles
            </h1>
            <p
              className="text-lg sm:text-xl text-[#6B4422] max-w-2xl mx-auto"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Pasteles artesanales para cada ocasión especial.{' '}
              <strong>Hechos con los mejores ingredientes y mucho amor.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Grid de productos */}
      <main className="flex-1 bg-[#F5EDE0] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <p
              className="text-[#6B4422]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {pasteles.length} productos
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {pasteles.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                badge={product.badge}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
