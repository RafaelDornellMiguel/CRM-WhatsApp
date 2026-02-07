/**
 * Inventory - Gerenciamento de estoque
 * Design Philosophy: Minimalismo Corporativo
 * - Lista de produtos
 * - Quantidade disponível
 * - Alertas de estoque baixo
 */

import { useState } from 'react';
import { useCRMStore } from '@/store';
import { Package, AlertCircle, Plus } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { Product } from '@/types';

export default function Inventory() {
  const { products, addProduct } = useCRMStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const lowStockProducts = products.filter((p) => p.stock < 5);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estoque</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {products.length} produtos | {lowStockProducts.length} com estoque baixo
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {/* Alerts */}
      {outOfStockProducts.length > 0 && (
        <div className="p-4 md:p-6 bg-red-50 border-b border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Produtos sem estoque</h3>
              <p className="text-sm text-red-800 mt-1">
                {outOfStockProducts.map((p) => p.name).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="flex-1 overflow-y-auto">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum produto cadastrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Produto</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">SKU</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Preço</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Estoque</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => {
                  const isLowStock = product.stock < 5 && product.stock > 0;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-secondary/50 transition-colors ${
                        isOutOfStock ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {product.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-semibold text-right">
                        R$ {product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span
                          className={`font-semibold ${
                            isOutOfStock
                              ? 'text-red-600'
                              : isLowStock
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            <AlertCircle className="w-3 h-3" />
                            Sem estoque
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            <AlertCircle className="w-3 h-3" />
                            Estoque baixo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Disponível
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

interface AddProductModalProps {
  onClose: () => void;
}

function AddProductModal({ onClose }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    sku: '',
    description: '',
  });

  const { addProduct } = useCRMStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct: Product = {
      id: nanoid(),
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      sku: formData.sku,
      description: formData.description,
    };

    addProduct(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Novo Produto</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nome do Produto
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              SKU
            </label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Preço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Estoque
              </label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
