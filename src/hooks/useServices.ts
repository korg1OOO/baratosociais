import { useState, useEffect } from 'react';
import { Service } from '../types';
import { apiClient } from '../services/api';
import { fetchServices, mapApiServiceToService } from '../data/services';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiServices = await apiClient.getServices();
      console.log('Raw API Response:', apiServices); // Log the raw response
      
      const mappedServices = apiServices.map(mapApiServiceToService);
      console.log('Mapped Services:', mappedServices); // Log after mapping
      
      // Filter out services with very high prices or invalid data
      const filteredServices = mappedServices.filter(service => 
        service.price > 0 && 
        service.price < 1000 && 
        service.name.length > 5 &&
        !service.name.includes('SERVIÇO INTERNO')
      );
      console.log('Filtered Services:', filteredServices); // Log after filtering
      
      setServices(filteredServices);
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setError('Falha ao carregar serviços da API. Usando dados padrão.');
      setServices([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    services,
    loading,
    error,
    refetch
  };
};