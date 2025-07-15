import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ServiceCard } from './components/ServiceCard';
import { ServiceModal } from './components/ServiceModal';
import { OrderModal } from './components/OrderModal';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { Filters } from './components/Filters';
import { ApiStatus } from './components/ApiStatus';
import { useServices } from './hooks/useServices';
import { Service, CartItem, Customer, Order, ApiOrder } from './types';
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
  const [apiOrders, setApiOrders] = useState<ApiOrder[]>([]);
  const [balance, setBalance] = useState<{ balance: string; currency: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // Moved up
  const [selectedCategory, setSelectedCategory] = useState('all'); // Moved up
  const [selectedPlatform, setSelectedPlatform] = useState('all'); // Moved up

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

  const handleDirectOrder = (service: Service) => {
    setSelectedService(service);
    setIsOrderModalOpen(true);
  };

  const handleOrderSuccess = (orderId: number) => {
    alert(`Pedido criado com sucesso! ID: ${orderId}`);
    const newApiOrder: ApiOrder = {
      id: orderId.toString(),
      serviceId: selectedService?.apiServiceId || 0,
      link: '', // Placeholder; should come from OrderModal
      quantity: 0, // Placeholder; should come from OrderModal
      status: 'pending',
      apiOrderId: orderId,
      createdAt: new Date(),
    };
    setApiOrders((prev) => [...prev, newApiOrder]);
    setIsOrderModalOpen(false);
    setSelectedService(null);
  };

  const handleAddToCart = (service: Service, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.service.id === service.id);

      if (existingItem) {
        return prevCart.map((item) =>
          item.service.id === service.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, service.maxQuantity) }
            : item
        );
      } else {
        return [...prevCart, { service, quantity }];
      }
    });
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const handleUpdateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(serviceId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.service.id === serviceId
          ? { ...item, quantity }
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

  const handleCompleteOrder = (customer: Customer) => {
    // Convert cart items to orders
    const newOrder: Order = {
      id: Date.now().toString(),
      customer,
      items: [...cart],
      total: cart.reduce((sum, item) => sum + item.service.price * item.quantity, 0),
      status: 'pending',
      createdAt: new Date(),
    };
    setOrders((prev) => [...prev, newOrder]);

    // Optionally convert any pending API orders with this customer
    setApiOrders((prevApiOrders) =>
      prevApiOrders.map((apiOrder) => {
        const matchingCartItem = cart.find((item) => item.service.apiServiceId === apiOrder.serviceId);
        if (matchingCartItem) {
          return { ...apiOrder, status: 'processing' }; // Mark as processing
        }
        return apiOrder;
      })
    );

    setCart([]);
    setIsCheckoutOpen(false);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setCart([]);
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
              onAddToCart={handleAddToCart}
              onDirectOrder={handleDirectOrder}
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
        onAddToCart={handleAddToCart}
      />

      <OrderModal
        service={selectedService}
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedService(null);
        }}
        onSuccess={handleOrderSuccess}
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