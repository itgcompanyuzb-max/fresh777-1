import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Package, Search, MoreHorizontal, Eye, EyeOff, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Product, Category } from "@shared/schema";
import ProductFormDialog from "./product-form";

export default function AdminProducts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/admin/products/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({ title: "Muvaffaqiyatli yangilandi" });
    },
    onError: () => {
      toast({ title: "Xatolik", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/products/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setDeleteDialogOpen(false);
      toast({ title: "Mahsulot o'chirildi" });
    },
    onError: () => {
      toast({ title: "Xatolik", variant: "destructive" });
    },
  });

  const filteredProducts = products?.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "-";
    return categories?.find(c => c.id === categoryId)?.name || "-";
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Mahsulotlar</h1>
          <p className="text-muted-foreground">Mahsulotlarni boshqarish</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          Yangi mahsulot
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-base">Barcha mahsulotlar ({products?.length || 0})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-products"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rasm</TableHead>
                    <TableHead>Nomi</TableHead>
                    <TableHead>Kategoriya</TableHead>
                    <TableHead>Narx</TableHead>
                    <TableHead>Zaxira</TableHead>
                    <TableHead className="w-20">Aktiv</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                      <TableCell>
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {product.name}
                            {product.isFeatured && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                          </div>
                          {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                            <Badge variant="destructive" className="mt-1 text-xs">Chegirma</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getCategoryName(product.categoryId)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{parseInt(product.price).toLocaleString()} so'm</div>
                          {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                            <div className="text-xs text-muted-foreground line-through">
                              {parseInt(product.originalPrice).toLocaleString()} so'm
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                          {product.stock} dona
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={product.isActive}
                          onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: product.id, isActive: checked })}
                          data-testid={`switch-active-${product.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-menu-${product.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Tahrirlash
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              O'chirish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">Mahsulotlar topilmadi</h3>
              <p className="text-muted-foreground text-sm">Yangi mahsulot qo'shing</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        product={editingProduct}
        categories={categories || []}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mahsulotni o'chirish</DialogTitle>
            <DialogDescription>
              "{productToDelete?.name}" mahsulotini o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Bekor qilish</Button>
            <Button
              variant="destructive"
              onClick={() => productToDelete && deleteMutation.mutate(productToDelete.id)}
              disabled={deleteMutation.isPending}
            >
              O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
