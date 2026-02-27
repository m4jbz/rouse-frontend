import { Link } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { ProductCard } from '../components/ProductCard';

const panaderia = [
  {
    id: 'conchas-tradicionales',
    name: 'Conchas Tradicionales',
    price: 15,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=600&fit=crop',
    badge: 'Más vendido' as const,
  },
  {
    id: 'cuernos-mantequilla',
    name: 'Cuernos de Mantequilla',
    price: 18,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=600&h=600&fit=crop',
  },
  {
    id: 'polvorones-naranja',
    name: 'Polvorones de Naranja',
    price: 12,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=600&fit=crop',
  },
  {
    id: 'orejas-azucar',
    name: 'Orejas de Azúcar',
    price: 14,
    image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&h=600&fit=crop',
    badge: 'Más vendido' as const,
  },
  {
    id: 'pan-muerto',
    name: 'Pan de Muerto',
    price: 45,
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600&h=600&fit=crop',
    badge: 'Edición limitada' as const,
  },
  {
    id: 'empanadas-piña',
    name: 'Empanadas de Piña',
    price: 16,
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&h=600&fit=crop',
  },
  {
    id: 'pan-dulce-surtido',
    name: 'Pan Dulce Surtido (Docena)',
    price: 150,
    image: 'https://images.unsplash.com/photo-1549931319-a545753467c8?w=600&h=600&fit=crop',
    badge: 'Nuevo' as const,
  },
  {
    id: 'churros-rellenos',
    name: 'Churros Rellenos',
    price: 35,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=600&fit=crop',
  },
  {
    id: 'roles-canela',
    name: 'Roles de Canela',
    price: 25,
    image: 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=600&h=600&fit=crop',
    badge: 'Más vendido' as const,
  },
  {
    id: 'galletas-mantequilla',
    name: 'Galletas de Mantequilla',
    price: 80,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=600&fit=crop',
  },
  {
    id: 'baguette-artesanal',
    name: 'Baguette Artesanal',
    price: 35,
    image: 'https://images.unsplash.com/photo-1549931319-a545753467c8?w=600&h=600&fit=crop',
  },
  {
    id: 'pan-integral',
    name: 'Pan Integral',
    price: 40,
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&h=600&fit=crop',
    badge: 'Nuevo' as const,
  },
  {
    id: 'dona-glaseada',
    name: 'Dona Glaseada',
    price: 20,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=600&fit=crop',
  },
  {
    id: 'mantecadas',
    name: 'Mantecadas Caseras',
    price: 18,
    image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&h=600&fit=crop',
  },
  {
    id: 'cochinitos-piloncillo',
    name: 'Cochinitos de Piloncillo',
    price: 12,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=600&fit=crop',
  },
  {
    id: 'bisquet-mantequilla',
    name: 'Bisquets de Mantequilla',
    price: 15,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=600&h=600&fit=crop',
  },
];

export function PanaderiaPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      {/* Hero de sección - estilo Porto's */}
      <section className="relative h-[340px] sm:h-[400px] lg:h-[450px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1600"
          alt="Pan artesanal recién horneado"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Sin overlay full, el fondo va en el contenedor del texto */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/75 px-10 py-6 flex flex-col items-center">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl text-[#3E2412] mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Nuestra Panadería
          </h1>
          <p
            className="text-lg sm:text-xl text-[#6B4422] max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Pan artesanal horneado diariamente con recetas tradicionales mexicanas.
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
              {panaderia.length} productos
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {panaderia.map((product) => (
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
