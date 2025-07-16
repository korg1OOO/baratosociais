import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header } from './components/Header';
import { ServiceCard } from './components/ServiceCard';
import { ServiceModal } from './components/ServiceModal';
import { OrderModal } from './components/OrderModal';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { Filters } from './components/Filters';
import { ApiStatus } from './components/ApiStatus';
import { useServices } from './hooks/useServices';
import { Service, CartItem, Customer, Order } from './types';
import { placeOrder, getBalance } from './services/order';
import { fetchServices } from './data/services';

function App() {
  const { services, loading, error, refetch } = useServices();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [balance, setBalance] = useState<{ balance: string; currency: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  // API credentials
  const API_BASE_URL = 'https://app.duckfy.com.br/api/v1';
  const PUBLIC_KEY = 'latelieronline01_ge7s6u5s5wi2rvgw';
  const SECRET_KEY = 't4mubgfc587z4kunu28olwlq5qp8xf14j6zmwftd4vw9skjdia2l46hbcj1lscze';
  const WEBHOOK_URL = process.env.REACT_APP_WEBHOOK_URL || 'https://your-webhook-url.com/webhook';

  // Fetch balance on mount
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const bal = await getBalance();
        setBalance(bal);
      } catch (err) {
        console.error('Failed to load balance:', err);
      }
    };
    loadBalance();
  }, []);

  // Filter services based on search and filters
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesPlatform = selectedPlatform === 'all' || service.platform === selectedPlatform;

    return matchesSearch && matchesCategory && matchesPlatform;
  });

  const handleViewDetails = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleAddToCart = (service: Service, quantity: number, link: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.service.id === service.id && item.link === link);
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, service.maxQuantity);
        return prevCart.map((item) =>
          item.service.id === service.id && item.link === link
            ? { ...item, quantity: Math.max(service.minQuantity, newQuantity) }
            : item
        );
      } else {
        return [...prevCart, { service, quantity: Math.max(service.minQuantity, Math.min(quantity, service.maxQuantity)), link }];
      }
    });
    setIsOrderModalOpen(false);
    setSelectedService(null);
    setIsCartOpen(true);
  };

  const handleOpenOrderModal = (service: Service) => {
    setSelectedService(service);
    setIsOrderModalOpen(true);
  };

  const handleUpdateQuantity = (serviceId: string, quantity: number) => {
    const service = cart.find((item) => item.service.id === serviceId)?.service;
    if (!service) return;

    if (quantity < service.minQuantity) {
      handleRemoveItem(serviceId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.service.id === serviceId
          ? { ...item, quantity: Math.min(quantity, item.service.maxQuantity) }
          : item
      )
    );
  };

  const handleRemoveItem = (serviceId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.service.id !== serviceId));
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCompleteOrder = async (customer: Customer) => {
    try {
      // Create Pix payments for each cart item
      const pixResponses = await Promise.all(
        cart.map(async (item) => {
          if (!item.service.apiServiceId) {
            throw new Error(`Serviço ${item.service.name} não suporta API`);
          }
          const response = await axios.post(
            `${API_BASE_URL}/gateway/pix/receive`,
            {
              identifier: `order-${Date.now()}-${item.service.id}`,
              amount: item.service.price * item.quantity, // Price per 1000 units
              client: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                document: customer.socialHandle, // CPF/CNPJ
              },
              products: [
                {
                  id: item.service.id,
                  name: item.service.name,
                  quantity: item.quantity, // In thousands
                  price: item.service.price, // Price per 1000 units
                },
              ],
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day from now
              metadata: { orderId: `order-${Date.now()}` },
              callbackUrl: WEBHOOK_URL,
            },
            {
              headers: {
                'x-public-key': PUBLIC_KEY,
                'x-secret-key': SECRET_KEY,
              },
            }
          );

          const { transactionId, status, pix } = response.data;
          if (status !== 'OK') {
            throw new Error(`Falha na transação para ${item.service.name}: ${response.data.errorDescription || 'Erro desconhecido'}`);
          }

          // Store order for webhook updates
          const order: Order = {
            id: Date.now().toString() + '-' + item.service.id,
            customer,
            items: [item],
            total: item.service.price * item.quantity,
            status: 'pending',
            createdAt: new Date(),
            transactionId,
          };

          // Send order to webhook server
          await axios.post(`${WEBHOOK_URL}/update-order`, { transactionId, order });

          return { transactionId, pix };
        })
      );

      setOrders((prev) => [...prev, ...pixResponses.map((res, index) => ({
        id: Date.now().toString() + '-' + cart[index].service.id,
        customer,
        items: [cart[index]],
        total: cart[index].service.price * cart[index].quantity,
        status: 'pending',
        createdAt: new Date(),
        transactionId: res.transactionId,
      }))]);

      setCart([]);
      return pixResponses; // Return Pix data for Checkout
    } catch (err) {
      console.error('Failed to complete order:', err);
      throw err;
    }
  };

  const handleWebhookUpdate = async (webhookData: any) => {
    const { event, transaction } = webhookData;
    if (event === 'TRANSACTION_PAID' && transaction.status === 'COMPLETED') {
      const transactionId = transaction.id;
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.transactionId === transactionId
            ? { ...order, status: 'processing' } // Set to processing until placeOrder completes
            : order
        )
      );

      // Trigger placeOrder for each item in the order
      const order = orders.find((o) => o.transactionId === transactionId);
      if (order) {
        try {
          const apiOrderIds = await Promise.all(
            order.items.map(async (item) => {
              if (item.service.apiServiceId) {
                return await placeOrder(item.service.apiServiceId, item.link, item.quantity * 1000); // Convert to actual units
              }
              return null;
            })
          );

          setOrders((prevOrders) =>
            prevOrders.map((o) =>
              o.transactionId === transactionId
                ? { ...o, status: 'completed', apiOrderId: apiOrderIds[0] || undefined }
                : o
            )
          );
        } catch (err) {
          console.error('Failed to place order after payment:', err);
          setOrders((prevOrders) =>
            prevOrders.map((o) =>
              o.transactionId === transactionId ? { ...o, status: 'failed' } : o
            )
          );
        }
      }
    }
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Header
        cartItemsCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Serviços Premium para <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Redes Sociais</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Impulsione sua presença online com nossos serviços de alta qualidade.
            Seguidores reais, curtidas instantâneas e muito mais!
          </p>
        </div>

        <ApiStatus loading={loading} error={error} onRefresh={refetch} />

        <Filters
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          selectedPlatform={selectedPlatform}
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          onPlatformChange={setSelectedPlatform}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onViewDetails={handleViewDetails}
              onAddToCart={handleOpenOrderModal}
            />
          ))}
        </div>

        {filteredServices.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Nenhum serviço encontrado</h3>
            <p className="text-gray-600">Tente ajustar seus filtros ou termo de busca</p>
          </div>
        )}
      </main>

      <ServiceModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
      />

      <OrderModal
        service={selectedService}
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedService(null);
        }}
        onAddToCart={handleAddToCart}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <Cart
        items={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      <Checkout
        items={cart}
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        onCompleteOrder={handleCompleteOrder}
      />
    </div>
  );
}

export default App;