import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus, Edit2, Trash2, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface Produto {
  id: number;
  nome: string;
  modelo: string;
  medida: string;
  preco: string;
  estoque: number;
  sku?: string;
  descricao?: string;
  categoria?: string;
  ativo: boolean;
}

export default function ProductsInventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModelo, setFilterModelo] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    modelo: '',
    medida: '',
    preco: '',
    estoque: '',
    sku: '',
    descricao: '',
    categoria: '',
  });

  // Mock data - substituir por tRPC quando disponível
  const [produtos, setProdutos] = useState<Produto[]>([
    {
      id: 1,
      nome: 'Colchão Royale',
      modelo: 'Royale',
      medida: 'Casal 1.88x1.38',
      preco: '1.500,00',
      estoque: 5,
      sku: 'COL-ROY-001',
      descricao: 'Colchão premium Royale',
      categoria: 'Colchões',
      ativo: true,
    },
    {
      id: 2,
      nome: 'Colchão Royale',
      modelo: 'Royale',
      medida: 'Queen 1.98x1.58',
      preco: '1.800,00',
      estoque: 3,
      sku: 'COL-ROY-002',
      descricao: 'Colchão premium Royale Queen',
      categoria: 'Colchões',
      ativo: true,
    },
    {
      id: 3,
      nome: 'Colchão Amsterdã',
      modelo: 'Amsterdã',
      medida: 'King 2.03x1.93',
      preco: '2.200,00',
      estoque: 2,
      sku: 'COL-AMS-001',
      descricao: 'Colchão Amsterdã King',
      categoria: 'Colchões',
      ativo: true,
    },
    {
      id: 4,
      nome: 'Colchão Amsterdã',
      modelo: 'Amsterdã',
      medida: 'Casal 1.88x1.38',
      preco: '1.600,00',
      estoque: 0,
      sku: 'COL-AMS-002',
      descricao: 'Colchão Amsterdã Casal',
      categoria: 'Colchões',
      ativo: true,
    },
    {
      id: 5,
      nome: 'Sofá Cama',
      modelo: 'Sofá Cama',
      medida: '2.30m',
      preco: '2.500,00',
      estoque: 4,
      sku: 'SOF-CAM-001',
      descricao: 'Sofá cama 2.30m',
      categoria: 'Sofás',
      ativo: true,
    },
    {
      id: 6,
      nome: 'Sofá Cama',
      modelo: 'Sofá Cama',
      medida: '2.90m',
      preco: '3.200,00',
      estoque: 1,
      sku: 'SOF-CAM-002',
      descricao: 'Sofá cama 2.90m',
      categoria: 'Sofás',
      ativo: true,
    },
    {
      id: 7,
      nome: 'Sofá Infinity',
      modelo: 'Infinity',
      medida: '2.50',
      preco: '2.800,00',
      estoque: 6,
      sku: 'SOF-INF-001',
      descricao: 'Sofá Infinity 2.50',
      categoria: 'Sofás',
      ativo: true,
    },
    {
      id: 8,
      nome: 'Sofá Infinity',
      modelo: 'Infinity',
      medida: '3.50',
      preco: '3.500,00',
      estoque: 2,
      sku: 'SOF-INF-002',
      descricao: 'Sofá Infinity 3.50',
      categoria: 'Sofás',
      ativo: true,
    },
  ]);

  const filteredProdutos = produtos.filter((p) => {
    const matchesSearch =
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModelo = !filterModelo || p.modelo === filterModelo;
    return matchesSearch && matchesModelo;
  });

  const modelos = Array.from(new Set(produtos.map((p) => p.modelo)));

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      nome: '',
      modelo: '',
      medida: '',
      preco: '',
      estoque: '',
      sku: '',
      descricao: '',
      categoria: '',
    });
    setIsOpen(true);
  };

  const handleEdit = (produto: Produto) => {
    setEditingId(produto.id);
    setFormData({
      nome: produto.nome,
      modelo: produto.modelo,
      medida: produto.medida,
      preco: produto.preco,
      estoque: produto.estoque.toString(),
      sku: produto.sku || '',
      descricao: produto.descricao || '',
      categoria: produto.categoria || '',
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!formData.nome || !formData.modelo || !formData.medida || !formData.preco) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingId) {
      setProdutos(
        produtos.map((p) =>
          p.id === editingId
            ? {
                ...p,
                ...formData,
                estoque: parseInt(formData.estoque),
              }
            : p
        )
      );
      toast.success('Produto atualizado com sucesso!');
    } else {
      const newProduto: Produto = {
        id: Math.max(...produtos.map((p) => p.id), 0) + 1,
        ...formData,
        estoque: parseInt(formData.estoque),
        ativo: true,
      };
      setProdutos([...produtos, newProduto]);
      toast.success('Produto criado com sucesso!');
    }

    setIsOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      setProdutos(produtos.filter((p) => p.id !== id));
      toast.success('Produto deletado com sucesso!');
    }
  };

  const getEstoqueStatus = (estoque: number) => {
    if (estoque === 0) return { label: 'Sem estoque', color: 'bg-red-100 text-red-800' };
    if (estoque < 3) return { label: 'Estoque baixo', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Em estoque', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Produtos & Estoque</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Gerenciar produtos e controlar estoque em um único lugar
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Filters and Actions */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, modelo ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
                  <DialogDescription>
                    {editingId ? 'Atualize os dados do produto' : 'Adicione um novo produto ao catálogo'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome *</label>
                    <Input
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Colchão Royale"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Modelo *</label>
                    <Input
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      placeholder="Ex: Royale, Amsterdã"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Medida *</label>
                    <Input
                      value={formData.medida}
                      onChange={(e) => setFormData({ ...formData, medida: e.target.value })}
                      placeholder="Ex: 1.88x1.38, 2.30m"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Preço *</label>
                    <Input
                      value={formData.preco}
                      onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                      placeholder="Ex: 1.500,00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Estoque *</label>
                    <Input
                      type="number"
                      value={formData.estoque}
                      onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">SKU</label>
                    <Input
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Ex: COL-ROY-001"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Categoria</label>
                    <Input
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      placeholder="Ex: Colchões, Sofás"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Input
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descrição do produto"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave}>Salvar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filter by modelo */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterModelo === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterModelo('')}
            >
              Todos
            </Button>
            {modelos && modelos.map((modelo) => (
              <Button
                key={modelo}
                variant={filterModelo === modelo ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterModelo(modelo)}
              >
                {modelo}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProdutos.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProdutos.map((produto) => {
              const estoqueStatus = getEstoqueStatus(produto.estoque);
              return (
                <Card key={produto.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{produto.nome}</CardTitle>
                        <CardDescription className="text-xs">
                          {produto.modelo} • {produto.medida}
                        </CardDescription>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${estoqueStatus.color}`}>
                        {estoqueStatus.label}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Preço</p>
                        <p className="font-semibold">R$ {produto.preco}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Estoque</p>
                        <p className="font-semibold">{produto.estoque} un</p>
                      </div>
                    </div>

                    {produto.sku && (
                      <div className="text-xs text-muted-foreground">
                        SKU: <span className="font-mono">{produto.sku}</span>
                      </div>
                    )}

                    {produto.estoque === 0 && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded text-red-700 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        Produto sem estoque
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(produto)}
                        className="flex-1 gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(produto.id)}
                        className="flex-1 gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Deletar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
