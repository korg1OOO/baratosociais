import React from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface ApiStatusProps {
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const ApiStatus: React.FC<ApiStatusProps> = ({ loading, error, onRefresh }) => {
  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
          <span className="text-blue-800">Carregando serviços da API...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800">{error}</span>
          </div>
          <button
            onClick={onRefresh}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800">Serviços carregados da API com sucesso!</span>
        </div>
        <button
          onClick={onRefresh}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
        >
          Atualizar
        </button>
      </div>
    </div>
  );
};