import { ImageWithFallback } from './figma/ImageWithFallback';

export function BrandStory() {
  return (
    <section className="py-20 bg-[#EAD5B8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl sm:text-4xl mb-6 text-[#3E2412]" style={{ fontFamily: 'var(--font-serif)' }}>
              Tradición familiar mexicana desde 1985
            </h2>
            <div className="space-y-4 text-[#3E2412]/80" style={{ fontFamily: 'var(--font-sans)' }}>
              <p className="text-lg leading-relaxed">
                En Pastelería Rouse, cada pastel cuenta una historia. Desde hace más de 35 años, 
                hemos mantenido vivas las recetas tradicionales mexicanas, transmitidas de generación 
                en generación en nuestra familia.
              </p>
              <p className="text-lg leading-relaxed">
                Utilizamos únicamente ingredientes locales de la más alta calidad: vainilla de Papantla, 
                chocolate de Tabasco, y frutas frescas de productores mexicanos. Nuestro compromiso es 
                ofrecer productos artesanales que celebren los sabores auténticos de México.
              </p>
              <p className="text-lg leading-relaxed">
                Cada creación es elaborada con dedicación en nuestro obrador, donde la pasión por la 
                repostería se combina con la innovación para crear momentos inolvidables en tu mesa.
              </p>
            </div>
            <button className="mt-8 bg-[#C8923A] text-white px-8 py-4 hover:bg-[#A67A28] transition-colors duration-300">
              Conoce nuestra historia
            </button>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative shadow-2xl overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1707289516284-c51cf57d22fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwYmFrZXJ5JTIwZGlzcGxheXxlbnwxfHx8fDE3NzE4NjQxMjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Obrador de Pastelería Rouse"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#D4A445] opacity-20"></div>
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#C8923A] opacity-20"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}