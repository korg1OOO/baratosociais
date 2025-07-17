import { apiClient } from '../services/api';
import { Service } from '../types';

// Fetch services dynamically from the API
export const fetchServices = async (): Promise<Service[]> => {
  try {
    const apiServices = await apiClient.getServices();
    return apiServices.map(mapApiServiceToService);
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return [];
  }
};

// Existing categories
export const categories = [
  { id: 'all', name: 'Todos os Serviços', icon: 'Grid3x3' },
  { id: 'followers', name: 'Seguidores', icon: 'Users' },
  { id: 'likes', name: 'Curtidas', icon: 'Heart' },
  { id: 'views', name: 'Visualizações', icon: 'Eye' },
  { id: 'subscribers', name: 'Inscritos', icon: 'UserPlus' },
  { id: 'comments', name: 'Comentários', icon: 'MessageCircle' },
  { id: 'shares', name: 'Compartilhamentos', icon: 'Share2' },
];

// Existing platforms
export const platforms = [
  { id: 'all', name: 'Todas as Redes', icon: 'Smartphone' },
  { id: 'instagram', name: 'Instagram', icon: 'Instagram' },
  { id: 'tiktok', name: 'TikTok', icon: 'Music' },
  { id: 'youtube', name: 'YouTube', icon: 'Youtube' },
  { id: 'facebook', name: 'Facebook', icon: 'Facebook' },
  { id: 'twitter', name: 'Twitter', icon: 'Twitter' },
  { id: 'telegram', name: 'Telegram', icon: 'Send' },
  { id: 'twitch', name: 'Twitch', icon: 'Tv' },
  { id: 'kwai', name: 'Kwai', icon: 'Video' },
  { id: 'threads', name: 'Threads', icon: 'MessageCircle' },
];

// Service mapping function with 2.5x price multiplier
export const mapApiServiceToService = (apiService: any): Service => {
  const rate = parseFloat(apiService.rate) * 2.5; // Multiply price by 2.5
  const min = parseInt(apiService.min);
  const max = parseInt(apiService.max);

  let platform = 'instagram';
  const name = apiService.name.toLowerCase();
  if (name.includes('tiktok') || name.includes('tik tok')) platform = 'tiktok';
  else if (name.includes('youtube')) platform = 'youtube';
  else if (name.includes('facebook')) platform = 'facebook';
  else if (name.includes('twitter')) platform = 'twitter';
  else if (name.includes('telegram')) platform = 'telegram';
  else if (name.includes('twitch')) platform = 'twitch';
  else if (name.includes('kwai')) platform = 'kwai';
  else if (name.includes('threads')) platform = 'threads';

  let category = 'followers';
  if (name.includes('curtida') || name.includes('like')) category = 'likes';
  else if (name.includes('visualiza') || name.includes('view')) category = 'views';
  else if (name.includes('inscrit') || name.includes('subscriber') || name.includes('membros')) category = 'subscribers';
  else if (name.includes('comentário') || name.includes('comment')) category = 'comments';
  else if (name.includes('compartilh') || name.includes('share') || name.includes('salves')) category = 'shares';

  const features = [
    'Entrega rápida',
    'Alta qualidade',
    'Suporte 24h',
    'Garantia total',
  ];
  if (apiService.refill) features.push('Reposição automática');
  if (apiService.cancel) features.push('Cancelamento disponível');

  let deliveryTime = apiService.deliveryTime || '30-50 minutos';
  if (!apiService.deliveryTime) {
    if (category === 'likes' || category === 'views') deliveryTime = '5-30 minutos';
    else if (category === 'comments') deliveryTime = '1-6 horas';
  }

  return {
    id: `api-${apiService.service}`,
    name: apiService.name,
    description: `${apiService.name} - Serviço de alta qualidade para ${platform}. Melhore sua presença online com resultados garantidos.`,
    price: rate,
    category,
    platform,
    minQuantity: Math.max(1, Math.floor(min / 1000)) || 1,
    maxQuantity: Math.max(1, Math.floor(max / 1000)) || 10,
    deliveryTime,
    features,
    popular: rate < 10 && (category === 'likes' || category === 'views'),
    apiServiceId: apiService.service,
  };
};