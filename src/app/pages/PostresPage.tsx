import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { ProductCard } from '../components/ProductCard';
import {
  fetchProductsByCategories,
  flattenToVariants,
  listCategories,
  type Product,
  type Category,
  type DisplayVariant,
} from '@/services/admin';

const CATEGORY_IDS = [4, 5, 6];

export function PostresPage() {
  const [allVariants, setAllVariants] = useState<DisplayVariant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchProductsByCategories(CATEGORY_IDS),
      listCategories(),
    ])
      .then(([products, cats]) => {
        setAllVariants(flattenToVariants(products));
        setCategories(cats.filter(c => CATEGORY_IDS.includes(c.id)));
      })
      .catch(() => {
        setAllVariants([]);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = selectedCategory
    ? allVariants.filter(v => v.categoryId === selectedCategory)
    : allVariants;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      {/* Hero de sección */}
      <section className="relative h-[340px] sm:h-[400px] lg:h-[450px] overflow-hidden">
        <img
          src="/assets/images/fondo-postres.jpg"
          alt="Variedad de postres artesanales"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/75 px-10 py-6 flex flex-col items-center">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl text-[#3E2412] mb-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Nuestros Postres
            </h1>
            <p
              className="text-lg sm:text-xl text-[#6B4422] max-w-2xl mx-auto"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Gelatinas, cupcakes, galletas y más.{' '}
              <strong>Postres artesanales para endulzar tu día.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Grid de productos */}
      <main className="flex-1 bg-[#F5EDE0] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter bar */}
          <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
            <p
              className="text-[#6B4422]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {loading ? 'Cargando...' : `${filtered.length} productos`}
            </p>

            {!loading && categories.length > 0 && (
              <div className="flex items-center gap-3">
                <span
                  className="text-sm font-bold text-[#3E2412] tracking-wide uppercase"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Filtrar por:
                </span>
                <select
                  value={selectedCategory ?? ''}
                  onChange={e => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                  className="bg-white border-2 border-[#3E2412] text-[#3E2412] text-sm font-semibold px-4 py-2 pr-8 uppercase tracking-wide cursor-pointer appearance-none"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%233E2412' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                  }}
                >
                  <option value="">TODOS</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <p className="text-center text-[#6B4422]" style={{ fontFamily: 'var(--font-sans)' }}>Cargando productos...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-[#6B4422] py-12" style={{ fontFamily: 'var(--font-sans)' }}>
              Próximamente agregaremos postres. ¡Vuelve pronto!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filtered.map((variant) => (
                <ProductCard
                  key={variant.id}
                  id={variant.id}
                  name={variant.name}
                  price={variant.price}
                  image={variant.image}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
