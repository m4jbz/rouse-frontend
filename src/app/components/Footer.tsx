import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  return (
    <footer id="contacto" className="bg-[#3E2412] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl mb-4 text-[#D4A445]" style={{ fontFamily: 'var(--font-serif)' }}>
              Pastelería Rouse
            </h3>
            <p className="text-white/80 mb-4" style={{ fontFamily: 'var(--font-sans)' }}>
              Tradición mexicana en cada bocado. Elaboramos nuestros productos con ingredientes de la más alta calidad.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-[#D4A445] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl mb-4 text-[#D4A445]" style={{ fontFamily: 'var(--font-serif)' }}>
              Enlaces rápidos
            </h3>
            <ul className="space-y-2" style={{ fontFamily: 'var(--font-sans)' }}>
              <li>
                <Link to="/pasteles" className="text-white/80 hover:text-[#D4A445] transition-colors">
                  Pasteles
                </Link>
              </li>
              <li>
                <Link to="/panaderia" className="text-white/80 hover:text-[#D4A445] transition-colors">
                  Panadería
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-xl mb-4 text-[#D4A445]" style={{ fontFamily: 'var(--font-serif)' }}>
              Atención al cliente
            </h3>
            <ul className="space-y-2" style={{ fontFamily: 'var(--font-sans)' }}>
              <li>
                <a href="#" className="text-white/80 hover:text-[#D4A445] transition-colors">
                  Preguntas frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-[#D4A445] transition-colors">
                  Envíos y entregas
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-[#D4A445] transition-colors">
                  Política de devoluciones
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-[#D4A445] transition-colors">
                  Términos y condiciones
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl mb-4 text-[#D4A445]" style={{ fontFamily: 'var(--font-serif)' }}>
              Contacto
            </h3>
            <ul className="space-y-3" style={{ fontFamily: 'var(--font-sans)' }}>
              <li className="flex items-start gap-2 text-white/80">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Ermenejildo Galeana 612, Col. Huizache, Santa Teresa, Iguala, Gro.</span>
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+52 733 126 1644</span>
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>info@pasteleriarouse.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm" style={{ fontFamily: 'var(--font-sans)' }}>
              © 2026 Pastelería Rouse. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
