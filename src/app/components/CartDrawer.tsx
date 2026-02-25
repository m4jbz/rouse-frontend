import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useCart } from '@/context/CartContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from './ui/sheet';

export function CartDrawer() {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, isOpen, closeCart, removeItem, deleteItem, updateQuantity, clearCart } = useCart();

  function handleGoToCart() {
    closeCart();
    navigate('/cart');
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="flex flex-col bg-[#FAF4EB] border-l border-[#D4B888] w-full sm:max-w-md"
      >
        <SheetHeader className="border-b border-[#D4B888] pb-4">
          <SheetTitle
            className="text-xl text-[#3E2412]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Tu carrito ({totalItems})
          </SheetTitle>
          <SheetDescription
            className="text-[#6B4422]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {totalItems === 0
              ? 'Tu carrito esta vacio'
              : `${totalItems} producto${totalItems > 1 ? 's' : ''} en tu carrito`}
          </SheetDescription>
        </SheetHeader>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
            <ShoppingBag className="w-16 h-16 text-[#D4B888]" />
            <p
              className="text-[#6B4422] text-center"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Aun no has agregado productos.
              <br />
              Explora nuestro catalogo.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-3 bg-white rounded-lg border border-[#D4B888]/50 p-3"
              >
                {/* Imagen */}
                <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-[#EAD5B8]/30">
                  <ImageWithFallback
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4
                    className="text-sm font-semibold text-[#3E2412] truncate"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {item.product.name}
                  </h4>
                  <p
                    className="text-sm text-[#C8923A] font-medium mt-0.5"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    ${item.product.price.toLocaleString('es-MX')} MXN
                  </p>

                  {/* Controles de cantidad */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="w-7 h-7 flex items-center justify-center rounded border border-[#D4B888] text-[#3E2412] hover:bg-[#EAD5B8] transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span
                        className="w-8 text-center text-sm text-[#3E2412] font-medium"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded border border-[#D4B888] text-[#3E2412] hover:bg-[#EAD5B8] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => deleteItem(item.product.id)}
                      className="p-1.5 text-[#6B4422] hover:text-[#A63C2E] transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer con total y botones */}
        {items.length > 0 && (
          <SheetFooter className="border-t border-[#D4B888] pt-4 gap-3">
            {/* Total */}
            <div className="flex items-center justify-between w-full">
              <span
                className="text-[#3E2412] font-medium"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Total
              </span>
              <span
                className="text-xl font-bold text-[#C8923A]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                ${totalPrice.toLocaleString('es-MX')} MXN
              </span>
            </div>

            {/* Botones */}
            <button
              onClick={handleGoToCart}
              className="w-full bg-[#C8923A] text-white py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md font-medium rounded-md"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Ver carrito completo
            </button>
            <button
              onClick={clearCart}
              className="w-full text-[#6B4422] hover:text-[#A63C2E] py-2 text-sm transition-colors"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Vaciar carrito
            </button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
