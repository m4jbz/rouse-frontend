import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ShoppingCart, X } from 'lucide-react';
import { useCart, type CartProduct } from '@/context/CartContext';
import type { DisplayProduct, DisplayVariant } from '@/services/admin';

interface ProductCardProps {
  product: DisplayProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);

  const hasMultipleVariants = product.variants.length > 1;
  const singleVariant = product.variants.length === 1 ? product.variants[0] : null;

  // Get all unique sizes (sorted alphabetically for consistent order)
  const allSizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))].sort() as string[];
  
  // Get all unique flavors (sorted alphabetically for consistent order)
  const allFlavors = [...new Set(product.variants.map(v => v.flavor).filter(Boolean))].sort() as string[];
  
  // Get flavors available for the selected size (sorted)
  const availableFlavors = selectedSize
    ? [...new Set(product.variants.filter(v => v.size === selectedSize).map(v => v.flavor).filter(Boolean))].sort() as string[]
    : allFlavors;

  // Get sizes available for the selected flavor (sorted)
  const availableSizes = selectedFlavor
    ? [...new Set(product.variants.filter(v => v.flavor === selectedFlavor).map(v => v.size).filter(Boolean))].sort() as string[]
    : allSizes;

  // Find the selected variant based on current selections
  const selectedVariant = product.variants.find(v => {
    const sizeMatch = !allSizes.length || v.size === selectedSize;
    const flavorMatch = !allFlavors.length || v.flavor === selectedFlavor;
    return sizeMatch && flavorMatch;
  }) || null;

  function handleAddToCart() {
    if (hasMultipleVariants) {
      setIsModalOpen(true);
      // Pre-select first variant's size and flavor (using sorted lists for consistency)
      if (product.variants.length > 0) {
        const firstSize = allSizes[0] || null;
        const firstFlavor = allFlavors[0] || null;
        setSelectedSize(firstSize);
        setSelectedFlavor(firstFlavor);
      }
    } else if (singleVariant) {
      addVariantToCart(singleVariant);
    }
  }

  function addVariantToCart(variant: DisplayVariant) {
    const cartProduct: CartProduct = {
      id: variant.id,
      name: `${product.name}${variant.size ? ` - ${variant.size}` : ''}${variant.flavor ? ` (${variant.flavor})` : ''}`,
      price: variant.price,
      image: variant.image || product.image,
    };
    addItem(cartProduct);
    setIsModalOpen(false);
    setSelectedSize(null);
    setSelectedFlavor(null);
  }

  function handleSizeSelect(size: string) {
    setSelectedSize(size);
    // Check if current flavor is available for this size
    const flavorsForSize = product.variants
      .filter(v => v.size === size)
      .map(v => v.flavor)
      .filter(Boolean);
    
    if (selectedFlavor && !flavorsForSize.includes(selectedFlavor)) {
      // Current flavor not available, select first available or null
      setSelectedFlavor(flavorsForSize[0] || null);
    } else if (!selectedFlavor && flavorsForSize.length > 0) {
      // No flavor selected, select first available
      setSelectedFlavor(flavorsForSize[0] || null);
    }
  }

  function handleFlavorSelect(flavor: string) {
    setSelectedFlavor(flavor);
    // Check if current size is available for this flavor
    const sizesForFlavor = product.variants
      .filter(v => v.flavor === flavor)
      .map(v => v.size)
      .filter(Boolean);
    
    if (selectedSize && !sizesForFlavor.includes(selectedSize)) {
      // Current size not available, select first available or null
      setSelectedSize(sizesForFlavor[0] || null);
    } else if (!selectedSize && sizesForFlavor.length > 0) {
      // No size selected, select first available
      setSelectedSize(sizesForFlavor[0] || null);
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedSize(null);
    setSelectedFlavor(null);
  }

  // Display price: show range if multiple prices, otherwise show single price
  const displayPrice = product.minPrice === product.maxPrice
    ? `$${product.minPrice.toLocaleString('es-MX')} MXN`
    : `$${product.minPrice.toLocaleString('es-MX')} - $${product.maxPrice.toLocaleString('es-MX')} MXN`;

  return (
    <>
      <div className="group bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="relative aspect-[1] overflow-hidden bg-[#EAD5B8]/30">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-5 text-center">
          <h3 className="product-name text-2xl mb-3 text-[#3E2412] group-hover:text-[#C8923A] transition-colors leading-tight">
            {product.name}
          </h3>
          <p className="text-lg text-[#C8923A] font-medium mb-4" style={{ fontFamily: 'var(--font-sans)' }}>
            {displayPrice}
          </p>
          <button
            onClick={handleAddToCart}
            className="bg-[#C8923A] text-white px-6 py-2.5 hover:bg-[#A67A28] transition-all duration-300 hover:scale-105 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide"
            title={hasMultipleVariants ? 'Seleccionar opciones' : 'Agregar al carrito'}
          >
            <ShoppingCart className="w-4 h-4" />
            {hasMultipleVariants ? 'Opciones' : 'Agregar'}
          </button>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="relative bg-white max-w-md w-full max-h-[90vh] overflow-auto shadow-2xl">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-[#6B4422] hover:text-[#3E2412] z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Product image */}
            <div className="aspect-square bg-[#EAD5B8]/30">
              <ImageWithFallback
                src={selectedVariant?.image || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6">
              <h2 className="product-name text-2xl text-[#3E2412] mb-2">
                {product.name}
              </h2>

              {product.description && (
                <p
                  className="text-[#6B4422] mb-4"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {product.description}
                </p>
              )}

              {/* Size selector */}
              {allSizes.length > 0 && (
                <div className="mb-4">
                  <label
                    className="block text-sm font-bold text-[#3E2412] mb-2 uppercase tracking-wide"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    Tamaño
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map((size) => {
                      const isAvailable = availableSizes.includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(size)}
                          disabled={!isAvailable}
                          className={`px-4 py-2 border-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                            selectedSize === size
                              ? 'border-[#C8923A] bg-[#C8923A] text-white'
                              : isAvailable
                                ? 'border-[#3E2412] text-[#3E2412] hover:border-[#C8923A] hover:text-[#C8923A]'
                                : 'border-gray-300 text-gray-300 cursor-not-allowed'
                          }`}
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Flavor selector - only show flavors available for selected size */}
              {availableFlavors.length > 0 && (
                <div className="mb-4">
                  <label
                    className="block text-sm font-bold text-[#3E2412] mb-2 uppercase tracking-wide"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    Sabor
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableFlavors.map((flavor) => (
                      <button
                        key={flavor}
                        onClick={() => handleFlavorSelect(flavor)}
                        className={`px-4 py-2 border-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                          selectedFlavor === flavor
                            ? 'border-[#C8923A] bg-[#C8923A] text-white'
                            : 'border-[#3E2412] text-[#3E2412] hover:border-[#C8923A] hover:text-[#C8923A]'
                        }`}
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        {flavor}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected variant price */}
              {selectedVariant && (
                <div className="mb-6">
                  <p
                    className="text-2xl text-[#C8923A]"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    ${selectedVariant.price.toLocaleString('es-MX')} MXN
                  </p>
                </div>
              )}

              {/* Add to cart button */}
              <button
                onClick={() => selectedVariant && addVariantToCart(selectedVariant)}
                disabled={!selectedVariant}
                className="w-full bg-[#C8923A] text-white py-3 px-6 font-bold uppercase tracking-wide hover:bg-[#A67A28] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <ShoppingCart className="w-5 h-5" />
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
