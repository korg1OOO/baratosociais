import React from 'react';
import { Search } from 'lucide-react';
import * as Icons from 'lucide-react';
import { categories, platforms } from '../data/services';

interface FiltersProps {
  searchTerm: string;
  selectedCategory: string;
  selectedPlatform: string;
  onSearchChange: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onPlatformChange: (platform: string) => void;
}

export const Filters: React.FC<FiltersProps> = ({
  searchTerm,
  selectedCategory,
  selectedPlatform,
  onSearchChange,
  onCategoryChange,
  onPlatformChange
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Categorias</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Plataformas</h3>
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => {
              const IconComponent = Icons[platform.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
              return (
                <button
                  key={platform.id}
                  onClick={() => onPlatformChange(platform.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedPlatform === platform.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{platform.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};