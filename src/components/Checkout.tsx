import React, { useState } from 'react';
import { X, User, Mail, Phone, AtSign, CreditCard, Check } from 'lucide-react';
import { CartItem, Customer } from '../types';

interface CheckoutProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onCompleteOrder: (customer: Customer) => Promise<{ transactionId: string; pix: { base64: string } }[] | null>;
}

export const Checkout: React.FC<CheckoutProps> = ({
  items,
  isOpen,
  onClose,
  onCompleteOrder
}) => {
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    email: '',
    phone: '',
    socialHandle: ''
  });
  const [pixData, setPixData] = useState<{ transactionId: string; pix: { base64: string } }[] | null>(null);

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + (item.service.price * item.quantity), 0);

  const handleInputChange = (field: keyof Customer, value: string) => {
    setCustomer(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      try {
        const response = await onCompleteOrder(customer);
        setPixData(response);
        setStep(3);
      } catch (err) {
        alert('Falha ao criar pagamento Pix. Tente novamente.');
      }
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return customer.name && customer.email && customer.phone && customer.socialHandle;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Finalizar Pedido</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                <span className="font-bold">1</span>
              </div>
              <div className={`h-1 w-16 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                <span className="font-bold">2</span>
              </div>
              <div className={`h-1 w-16 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {step >= 3 ? <Check className="h-5 w-5" /> : <span className="font-bold">3</span>}
              </div>
            </div>
          </div>

          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Informações do Cliente</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Telefone/WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AtSign className="h-4 w-4 inline mr-2" />
                    CPF/CNPJ
                  </label>
                  <input
                    type="text"
                    value={customer.socialHandle}
                    onChange={(e) => handleInputChange('socialHandle', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="123.456.789-00"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Resumo do Pedido</h3>
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 mb-6 border">
                <h4 className="font-semibold mb-4 text-gray-800">Itens do Pedido</h4>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.service.id}-${item.link}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-800">{item.service.name}</p>
                        <p className="text-sm text-gray-500">Quantidade: {item.quantity} mil ({item.quantity * 1000} unidades)</p>
                        <p className="text-sm text-gray-500">Link: {item.link}</p>
                      </div>
                      <p className="font-semibold text-gray-800">
                        R$ {(item.service.price * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-purple-600">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <h4 className="font-semibold mb-3 text-gray-800 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Dados do Cliente
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Nome:</p>
                    <p className="font-semibold">{customer.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">E-mail:</p>
                    <p className="font-semibold">{customer.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Telefone:</p>
                    <p className="font-semibold">{customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">CPF/CNPJ:</p>
                    <p className="font-semibold">{customer.socialHandle}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Pagamento Pix Criado!</h3>
              <p className="text-gray-600 mb-6">
                Escaneie o QR code abaixo para realizar o pagamento. Os produtos serão liberados após a confirmação do pagamento.
              </p>
              {pixData && pixData.length > 0 && (
                <div className="space-y-4">
                  {pixData.map((pix, index) => (
                    <div key={pix.transactionId} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                      <h4 className="font-semibold mb-2">Item {index + 1}: QR Code Pix</h4>
                      <img src={pix.pix.base64} alt="Pix QR Code" className="mx-auto max-w-xs" />
                      <p className="text-sm text-gray-600 mt-2">
                        Transação ID: {pix.transactionId}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-left mt-6">
                <h4 className="font-semibold mb-2">Próximos Passos:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Escaneie o QR code para pagar via Pix</li>
                  <li>• Você receberá um e-mail de confirmação após o pagamento</li>
                  <li>• Os produtos serão liberados automaticamente após a confirmação</li>
                  <li>• Monitore o status do pedido na sua conta</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && step < 3 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
            )}
            
            {step < 3 && (
              <button
                onClick={handleNextStep}
                disabled={!isStepValid()}
                className="ml-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 1 ? 'Continuar' : 'Confirmar e Gerar Pix'}
              </button>
            )}
            
            {step === 3 && (
              <button
                onClick={onClose}
                className="ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-lg font-semibold transition-all duration-300"
              >
                Concluir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};