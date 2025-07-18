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

  // Webhook URL
  const WEBHOOK_URL = process.env.REACT_APP_WEBHOOK_URL || 'https://baratosociais-server.onrender.com';
  
  // Minimum price per item (in reais)
  const MINIMUM_PRICE = 1.50;

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
      // Call server to create Pix payments
      const response = await axios.post(`${WEBHOOK_URL}/create-pix`, {
        customer,
        items: cart,
      });

      const pixResponses = response.data; // Array of { transactionId, pix: { base64: string }, pixString }

      // Store orders in frontend with adjusted price
      setOrders((prev) => [
        ...prev,
        ...pixResponses.map((res: { transactionId: string }, index: number) => ({
          id: Date.now().toString() + '-' + cart[index].service.id,
          customer,
          items: [{ ...cart[index], service: { ...cart[index].service, price: Math.max(cart[index].service.price, MINIMUM_PRICE) }}], // Store adjusted price
          total: Math.max(cart[index].service.price, MINIMUM_PRICE) * cart[index].quantity,
          status: 'pending',
          createdAt: new Date(),
          transactionId: res.transactionId,
        })),
      ]);

      setCart([]);
      return pixResponses; // Return Pix data for Checkout
    } catch (err) {
      console.error('Failed to complete order:', err);
      throw err;
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
              service={{ ...service, price: Math.max(service.price, MINIMUM_PRICE) }} // Adjust price for display
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