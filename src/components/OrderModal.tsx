import React, { useState } from 'react';
import { X, ExternalLink, AlertCircle } from 'lucide-react';
import { Service } from '../types';
import { apiClient } from '../services/api';

interface OrderModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: number, link: string, quantity: number) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  service,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !service) return null;

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!service?.apiServiceId) {
    setError('Este serviço não está disponível via API');
    return;
  }
  if (!link.trim()) {
    setError('Por favor, insira o link do perfil/post');
    return;
  }
  setLoading(true);
  setError(null);
  try {
    const response = await apiClient.addOrder(
      service.apiServiceId,
      link.trim(),
      quantity * 1000
    );
    onSuccess(response.order, link, quantity); // Pass link and quantity
  } catch (err) {
    setError('Falha ao criar pedido. Tente novamente.');
    console.error('Order creation failed:', err);
  } finally {
    setLoading(false);
  }
};

  const total = service.price * quantity;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Fazer Pedido</h2>
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
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min={service.minQuantity}
              max={service.maxQuantity}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Mín: {service.minQuantity}k - Máx: {service.maxQuantity}k
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
              {quantity * 1000} unidades × R$ {service.price.toFixed(2).replace('.', ',')}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processando...' : 'Fazer Pedido'}
          </button>

          <div className="mt-4 text-center">
            <a
              href="https://baratosociais.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-sm text-gray-500 hover:text-purple-600 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Powered by Barato Sociais</span>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};