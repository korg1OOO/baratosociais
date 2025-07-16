import React from 'react';
import { Eye, Clock, CheckCircle, Star, ShoppingCart } from 'lucide-react';
import { Service } from '../types';

interface ServiceCardProps {
  service: Service;
  onViewDetails: (service: Service) => void;
  onAddToCart: (service: Service) => void; // Updated to trigger OrderModal
}

const platformIcons = {
  instagram: '📷',
  tiktok: '🎵',
  youtube: '📺',
  facebook: '👥',
  twitter: '🐦',
  telegram: '✈️',
  twitch: '🎮',
  kwai: '🎬'
};

const platformColors = {
  instagram: 'from-pink-500 to-purple-600',
  tiktok: 'from-black to-pink-500',
  youtube: 'from-red-500 to-red-600',
  facebook: 'from-blue-500 to-blue-600',
  twitter: 'from-blue-400 to-blue-500',
  telegram: 'from-blue-500 to-cyan-500',
  twitch: 'from-purple-500 to-purple-700',
  kwai: 'from-orange-500 to-red-500'
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onViewDetails, 
  onAddToCart
}) => {
  const hasApiIntegration = !!service.apiServiceId;

  return (
    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:scale-105 border border-gray-100">
      {service.popular && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-2 text-sm font-bold">
          ⭐ MAIS POPULAR
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`bg-gradient-to-r ${platformColors[service.platform as keyof typeof platformColors] || 'from-gray-500 to-gray-600'} text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-2`}>
            <span>{platformIcons[service.platform as keyof typeof platformIcons] || '🌐'}</span>
            <span className="capitalize">{service.platform}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-1 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-semibold">4.9</span>
            </div>
            {hasApiIntegration && (
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                API
              </div>
            )}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
          {service.name}
        </h3>
        
        <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2">
          {service.description}
        </p>
        
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{service.deliveryTime}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Garantido</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-3xl font-bold text-gray-800">
              R$ {service.price.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-gray-500 text-sm block">por 1000 unidades</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(service)}
            className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors text-sm font-medium flex-1"
          >
            <Eye className="h-4 w-4" />
            <span>Detalhes</span>
          </button>
          
          <button
            onClick={() => onAddToCart(service)}
            className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all duration-300 font-semibold text-sm hover:scale-105 flex-1"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Adicionar ao Carrinho</span>
          </button>
        </div>
      </div>
    </div>
  );
};