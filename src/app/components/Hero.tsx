import { ImageWithFallback } from './figma/ImageWithFallback';
import HeroBg from '../../../assets/fondo.jpg';

export function Hero() {
  return (
    <section className="relative h-[600px] lg:h-[700px] overflow-hidden">
      <div className="absolute inset-0">
        <ImageWithFallback
          src={HeroBg}
          alt="Pastel de tres leches artesanal"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6 text-white" style={{ fontFamily: 'var(--font-serif)' }}>
            Sabor que celebra tus momentos
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-white/95" style={{ fontFamily: 'var(--font-sans)' }}>
            Pasteles y panadería artesanal hechos en México
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-[#C8923A] text-white px-8 py-4 hover:bg-[#A67A28] transition-colors duration-300 shadow-lg">
              Comprar ahora
            </button>
            <button className="bg-white/90 text-[#3E2412] px-8 py-4 hover:bg-white transition-colors duration-300 shadow-lg backdrop-blur-sm">
              Ver catálogo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
