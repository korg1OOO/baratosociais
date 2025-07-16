import React from 'react';
import { X, Clock, Shield, CheckCircle } from 'lucide-react';
import { Service } from '../types';

interface ServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
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

export const ServiceModal: React.FC<ServiceModalProps> = ({
  service,
  isOpen,
  onClose
}) => {
  if (!isOpen || !service) return null;

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

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
            <div className="flex items-center justify-between text-2xl font-bold text-gray-800">
              <span>Preço:</span>
              <span className="text-purple-600">R$ {service.price.toFixed(2).replace('.', ',')} / 1000 unidades</span>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Quantidade: {service.minQuantity} - {service.maxQuantity} pacotes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};