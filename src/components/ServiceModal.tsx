import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Clock, Shield, Users, CheckCircle } from 'lucide-react';
import { Service } from '../types';

interface ServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (service: Service, quantity: number) => void;
}

const platformIcons = {
  instagram: '📷',
  tiktok: '🎵',
  youtube: '📺',
  facebook: '👥'
};

const platformColors = {
  instagram: 'from-pink-500 to-purple-600',
  tiktok: 'from-black to-pink-500',
  youtube: 'from-red-500 to-red-600',
  facebook: 'from-blue-500 to-blue-600'
};

export const ServiceModal: React.FC<ServiceModalProps> = ({
  service,
  isOpen,
  onClose,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !service) return null;

  const total = service.price * quantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= service.minQuantity && newQuantity <= service.maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(service, quantity);
    onClose();
    setQuantity(1);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`bg-gradient-to-r ${platformColors[service.platform as keyof typeof platformColors]} text-white p-2 rounded-lg`}>
              <span className="text-lg">{platformIcons[service.platform as keyof typeof platformIcons]}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{service.name}</h2>
              <p className="text-gray-500 capitalize">{service.platform}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Descrição do Serviço</h3>
            <p className="text-gray-600 leading-relaxed">{service.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-800">Tempo de Entrega</span>
              </div>
              <p className="text-gray-600">{service.deliveryTime}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-800">Garantia</span>
              </div>
              <p className="text-gray-600">100% Seguro e Confiável</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Características do Serviço</span>
            </h3>
            <ul className="grid md:grid-cols-2 gap-3">
              {service.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2 text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Selecionar Quantidade</h3>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= service.minQuantity}
                  className="p-2 rounded-full bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Minus className="h-4 w-4" />
                </button>
                
                <div className="bg-white px-6 py-2 rounded-lg shadow-md">
                  <span className="text-xl font-bold text-gray-800">{quantity}</span>
                </div>
                
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= service.maxQuantity}
                  className="p-2 rounded-full bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">Preço unitário</p>
                <p className="text-2xl font-bold text-gray-800">
                  R$ {service.price.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 mb-4">
              Quantidade: {service.minQuantity} - {service.maxQuantity} pacotes
            </div>
            
            <div className="flex items-center justify-between text-2xl font-bold text-gray-800 border-t pt-4">
              <span>Total:</span>
              <span className="text-purple-600">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="h-6 w-6" />
            <span>Adicionar ao Carrinho</span>
          </button>
        </div>
      </div>
    </div>
  );
};