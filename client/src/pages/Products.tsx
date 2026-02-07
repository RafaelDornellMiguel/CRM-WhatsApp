/**
 * Products - Catálogo de produtos com filtros
 * Design Philosophy: Minimalismo Corporativo
 * Facilitar busca rápida durante atendimento
 */

import { useState, useMemo } from 'react';
import { useCRMStore } from '@/store';
import { Search, Package, Filter } from 'lucide-react';

export default function Products() {
  const { products } = useCRMStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModelo, setSelectedModelo] = useState<string>('');
  const [selectedMedida, setSelectedMedida] = useState<string>('');

  // Extrair modelos únicos
  const modelos = useMemo(() => {
    const modelosSet = new Set(products.map((p) => p.modelo).filter(Boolean));
    return Array.from(modelosSet).sort();
  }, [products]);

  // Extrair medidas únicas
  const medidas = useMemo(() => {
    const medidasSet = new Set(products.map((p) => p.medida).filter(Boolean));
    return Array.from(medidasSet).sort();
  }, [products]);

  // Filtrar produtos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchTerm === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.medida?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModelo = selectedModelo === '' || product.modelo === selectedModelo;
      const matchesMedida = selectedMedida === '' || product.medida === selectedMedida;

      return matchesSearch && matchesModelo && matchesMedida;
    });
  }, [products, searchTerm, selectedModelo, selectedMedida]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedModelo('');
    setSelectedMedida('');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Catálogo de Produtos</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Busque produtos por modelo, medida ou nome
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 md:p-6 border-b border-border space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filter Selects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Modelo
            </label>
            <select
              value={selectedModelo}
              onChange={(e) => setSelectedModelo(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="">Todos os modelos</option>
              {modelos.map((modelo) => (
                <option key={modelo} value={modelo}>
                  {modelo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Medida
            </label>
            <select
              value={selectedMedida}
              onChange={(e) => setSelectedMedida(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="">Todas as medidas</option>
              {medidas.map((medida) => (
                <option key={medida} value={medida}>
                  {medida}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-foreground font-semibold mb-2">
              Nenhum produto encontrado
            </p>
            <p className="text-sm text-muted-foreground">
              Tente ajustar os filtros ou buscar por outro termo
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Product Info */}
                <div className="mb-3">
                  <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                  {product.modelo && (
                    <p className="text-xs text-muted-foreground">
                      Modelo: {product.modelo}
                    </p>
                  )}
                  {product.medida && (
                    <p className="text-xs text-muted-foreground">
                      Medida: {product.medida}
                    </p>
                  )}
                </div>

                {/* Price and Stock */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-lg font-bold text-primary">
                      R$ {product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Estoque</p>
                    <p
                      className={`text-sm font-semibold ${
                        product.stock === 0
                          ? 'text-red-600'
                          : product.stock < 5
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {product.stock} un
                    </p>
                  </div>
                </div>

                {/* Stock Status */}
                {product.stock === 0 && (
                  <div className="mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded text-center">
                    Sem estoque
                  </div>
                )}
                {product.stock > 0 && product.stock < 5 && (
                  <div className="mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded text-center">
                    Estoque baixo
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
