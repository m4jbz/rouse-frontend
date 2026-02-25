import { ImageWithFallback } from './figma/ImageWithFallback';

interface CategoryCardProps {
  image: string;
  title: string;
  link: string;
}

export function CategoryCard({ image, title, link }: CategoryCardProps) {
  return (
    <a 
      href={link}
      className="group relative overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300"
    >
      <div className="aspect-square overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
        <div className="p-6 w-full">
          <h3 className="text-white text-2xl mb-0" style={{ fontFamily: 'var(--font-serif)' }}>
            {title}
          </h3>
        </div>
      </div>
      <div className="absolute top-4 right-4 bg-[#D4A445] text-white px-3 py-1 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Ver más
      </div>
    </a>
  );
}