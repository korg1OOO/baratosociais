import { useState, useEffect } from 'react';
import { Service } from '../types';
import { apiClient } from '../services/api';
import { services as staticServices, mapApiServiceToService } from '../data/services';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>(staticServices);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiServices = await apiClient.getServices();
      const mappedServices = apiServices.map(mapApiServiceToService);
      
      // Filter out services with very high prices or invalid data
      const filteredServices = mappedServices.filter(service => 
        service.price > 0 && 
        service.price < 1000 && 
        service.name.length > 5 &&
        !service.name.includes('SERVIÇO INTERNO')
      );
      
      setServices(filteredServices);
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setError('Falha ao carregar serviços da API. Usando dados estáticos.');
      // Keep static services as fallback
      setServices(staticServices);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    error,
    refetch: fetchServices
  };
};