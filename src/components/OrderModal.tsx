import React, { useState } from 'react';
import { X, AlertCircle, ShoppingCart } from 'lucide-react';
import { Service } from '../types';

interface OrderModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (service: Service, quantity: number, link: string) => void;
  onOpenCart: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  service,
  isOpen,
  onClose,
  onAddToCart,
  onOpenCart
}) => {
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState(1); // Default to 1 (1000 units)
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !service) return null;

  const handleQuantityChange = (value: string) => {
    const num = parseFloat(value) || service.minQuantity;
    const cappedQuantity = Math.max(service.minQuantity, Math.min(num, service.maxQuantity));
    setQuantity(cappedQuantity);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!link.trim()) {
      setError('Por favor, insira o link do perfil/post');
      return;
    }
    if (quantity < service.minQuantity) {
      setError(`A quantidade mínima é ${service.minQuantity} mil unidades`);
      return;
    }
    if (quantity > service.maxQuantity) {
      setError(`A quantidade máxima é ${service.maxQuantity} mil unidades`);
      return;
    }
    setError(null);
    onAddToCart(service, quantity, link.trim());
    onOpenCart();
    setLink('');
    setQuantity(service.minQuantity);
    onClose();
  };

  const total = service.price * quantity; // Price per 1000 units

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Adicionar ao Carrinho</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">{service.name}</h3>
            <p className="text-sm text-gray-600">
              Preço: R$ {service.price.toFixed(2).replace('.', ',')} por 1000 unidades
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link do Perfil/Post
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://instagram.com/seuusuario"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Cole o link completo do seu perfil ou post
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade (em milhares)
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              min={service.minQuantity}
              max={service.maxQuantity}
              step={0.001} // Allow decimals for precision (e.g., 1.05 = 1050 units)
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Mín: {service.minQuantity} mil - Máx: {service.maxQuantity} mil (ex.: 1 = 1000 unidades)
            </p>
          </div>

          <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span className="text-purple-600">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {quantity} mil unidades × R$ {service.price.toFixed(2).replace('.', ',')} por mil
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Adicionar ao Carrinho</span>
          </button>
        </form>
      </div>
    </div>
  );
};