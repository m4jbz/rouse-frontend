import { ImageWithFallback } from './figma/ImageWithFallback';
import { ShoppingCart } from 'lucide-react';
import { useCart, type CartProduct } from '@/context/CartContext';

interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  price: number;
  badge?: 'Más vendido' | 'Nuevo' | 'Edición limitada';
}

export function ProductCard({ id, image, name, price, badge }: ProductCardProps) {
  const { addItem } = useCart();

  const badgeColors = {
    'Más vendido': 'bg-[#C8923A] text-white',
    'Nuevo': 'bg-[#D4A445] text-white',
    'Edición limitada': 'bg-[#3E2412] text-white'
  };

  function handleAddToCart() {
    const product: CartProduct = {
      id,
      name,
      price,
      image,
      badge,
    };
    addItem(product);
  }

  return (
    <div className="group bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-[#EAD5B8]/30">
        {badge && (
          <div className={`absolute top-3 left-3 px-3 py-1 text-xs z-10 ${badgeColors[badge]}`}>
            {badge}
          </div>
        )}
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg mb-2 text-[#3E2412] group-hover:text-[#C8923A] transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-xl text-[#C8923A]" style={{ fontFamily: 'var(--font-sans)' }}>
            ${price.toLocaleString('es-MX')} MXN
          </p>
          <button
            onClick={handleAddToCart}
            className="bg-[#C8923A] text-white p-2.5 hover:bg-[#A67A28] transition-all duration-300 hover:scale-110 group/btn"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
