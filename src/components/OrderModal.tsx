import React, { useState } from 'react';
import { X, AlertCircle, ShoppingCart, Info } from 'lucide-react';
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
  onOpenCart,
}) => {
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState(1); // Default to 1 (1000 units)
  const [error, setError] = useState<string | null>(null);
  const MINIMUM_PRICE = 1.50;

  if (!isOpen || !service) return null;

  const handleQuantityChange = (value: string) => {
    // Replace comma with dot for parsing (e.g., "1,25" → "1.25")
    const sanitizedValue = value.replace(',', '.');
    const num = parseFloat(sanitizedValue) || service.minQuantity;
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

  const adjustedPrice = Math.max(service.price, MINIMUM_PRICE);
  const total = adjustedPrice * quantity; // Price per 1000 units

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
              Preço: R$ {adjustedPrice.toFixed(2).replace('.', ',')} por 1000 unidades
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
              type="text" // Changed to text to allow comma input
              value={quantity.toString().replace('.', ',')} // Display with comma
              onChange={(e) => handleQuantityChange(e.target.value)}
              min={service.minQuantity}
              max={service.maxQuantity}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
              <Info className="h-4 w-4" />
              <p>
                Use vírgula para quantidades fracionadas (ex.: 1,25 = 1250 unidades). Mín: {service.minQuantity} mil - Máx: {service.maxQuantity} mil.
              </p>
            </div>
          </div>

          <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span className="text-purple-600">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {quantity.toFixed(3).replace('.', ',')} mil unidades × R$ {adjustedPrice.toFixed(2).replace('.', ',')} por mil
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