import { Mail } from 'lucide-react';
import { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribed:', email);
    setEmail('');
  };

  return (
    <section className="bg-gradient-to-r from-[#C8923A] to-[#A67A28] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="w-12 h-12 text-[#D4B888] mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl mb-4 text-white" style={{ fontFamily: 'var(--font-serif)' }}>
            Recibe promociones exclusivas
          </h2>
          <p className="text-lg mb-8 text-white/90" style={{ fontFamily: 'var(--font-sans)' }}>
            Suscríbete a nuestro newsletter y recibe lanzamientos especiales y ofertas únicas
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo electrónico"
              required
              className="flex-1 px-5 py-4 bg-white text-[#3E2412] placeholder:text-[#6B4422] focus:outline-none focus:ring-2 focus:ring-[#D4A445]"
            />
            <button
              type="submit"
              className="bg-[#3E2412] text-white px-8 py-4 hover:bg-[#2E1808] transition-colors duration-300"
            >
              Suscribirse
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}