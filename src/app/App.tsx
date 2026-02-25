import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryCard } from './components/CategoryCard';
import { ProductCard } from './components/ProductCard';
import { BrandStory } from './components/BrandStory';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import Pastel1 from '../../assets/pastel1.jpg';
import Pastel2 from '../../assets/pastel2.jpg';
import Pastel3 from '../../assets/pastel3.jpg';
import Pastel4 from '../../assets/pastel4.jpg';
import Pastel5 from '../../assets/pastel5.jpg';
import Pastel6 from '../../assets/pastel6.jpg';
import Pastel7 from '../../assets/pastel7.jpg';
import Pastel8 from '../../assets/pastel8.jpg';

const featuredProducts = [
  {
    name: 'Pastel Tres Leches Clásico',
    price: 450,
    image: Pastel1,
    badge: 'Más vendido' as const
  },
  {
    name: 'Chocolate Artesanal Premium',
    price: 520,
    image: Pastel2,
    badge: 'Más vendido' as const
  },
  {
    name: 'Conchas Tradicionales (6 pzas)',
    price: 85,
    image: Pastel3,
  },
  {
    name: 'Flan Napolitano',
    price: 280,
    image: Pastel4,
    badge: 'Nuevo' as const
  },
  {
    name: 'Churros Rellenos (6 pzas)',
    price: 120,
    image: Pastel5,
  },
  {
    name: 'Pastel de Fresa Elegante',
    price: 490,
    image: Pastel6,
  },
  {
    name: 'Cupcakes Vainilla (6 pzas)',
    price: 180,
    image: Pastel7,
  },
  {
    name: 'Pan Dulce Surtido (12 pzas)',
    price: 150,
    image: Pastel8,
    badge: 'Edición limitada' as const
  }
];

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />

      {/* Featured Products Section */}
      <section className="py-20 bg-[#F5EDE0]" id="productos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-4 text-[#3E2412]" style={{ fontFamily: 'var(--font-serif)' }}>
              Productos destacados
            </h2>
            <p className="text-lg text-[#6B4422]" style={{ fontFamily: 'var(--font-sans)' }}>
              Los favoritos de nuestros clientes
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCard
                key={index}
                name={product.name}
                price={product.price}
                image={product.image}
                badge={product.badge}
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <button className="bg-[#C8923A] text-white px-10 py-4 hover:bg-[#A67A28] transition-colors duration-300 shadow-md">
              Ver todos los productos
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
