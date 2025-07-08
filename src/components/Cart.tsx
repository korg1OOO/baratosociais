import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (serviceId: string, quantity: number) => void;
  onRemoveItem: (serviceId: string) => void;
  onCheckout: () => void;
}

export const Cart: React.FC<CartProps> = ({
  items,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + (item.service.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-end p-4 z-50">
      <div className="bg-white h-full w-full max-w-md rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6" />
            <span>Carrinho</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Seu carrinho está vazio</p>
              <p className="text-gray-400 text-sm">Adicione alguns serviços para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.service.id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm">{item.service.name}</h3>
                      <p className="text-gray-500 text-xs capitalize">{item.service.platform}</p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.service.id)}
                      className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateQuantity(item.service.id, item.quantity - 1)}
                        disabled={item.quantity <= item.service.minQuantity}
                        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="bg-white px-3 py-1 rounded-md text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.service.id, item.quantity + 1)}
                        disabled={item.quantity >= item.service.maxQuantity}
                        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">
                        R$ {(item.service.price * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-gray-500">
                        R$ {item.service.price.toFixed(2).replace('.', ',')} cada
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4 text-xl font-bold">
              <span>Total:</span>
              <span className="text-purple-600">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105"
            >
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
};