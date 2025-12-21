import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, FolderOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Category } from "@shared/schema";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Nom kiritish shart"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export default function AdminCategories() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const { toast } = useToast();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", description: "", isActive: true },
  });

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      if (editingCategory) {
        return apiRequest("PATCH", `/api/admin/categories/${editingCategory.id}`, data);
      }
      return apiRequest("POST", "/api/admin/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: editingCategory ? "Kategoriya yangilandi" : "Kategoriya qo'shildi" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Xatolik", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/categories/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setDeleteDialogOpen(false);
      toast({ title: "Kategoriya o'chirildi" });
    },
    onError: () => {
      toast({ title: "Xatolik", variant: "destructive" });
    },
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive,
    });
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    form.reset({ name: "", description: "", isActive: true });
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Kategoriyalar</h1>
          <p className="text-muted-foreground">Mahsulot kategoriyalarini boshqarish</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} data-testid="button-add-category">
          <Plus className="h-4 w-4 mr-2" />
          Yangi kategoriya
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Barcha kategoriyalar ({categories?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-lg border"
                  data-testid={`category-item-${category.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {category.name}
                        {!category.isActive && <Badge variant="secondary">Noaktiv</Badge>}
                      </div>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(category)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">Kategoriyalar topilmadi</h3>
              <p className="text-muted-foreground text-sm">Yangi kategoriya qo'shing</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Tahrirlash" : "Yangi kategoriya"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomi</FormLabel>
                    <FormControl>
                      <Input placeholder="Kategoriya nomi" {...field} data-testid="input-category-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tavsif</FormLabel>
                    <FormControl>
                      <Input placeholder="Qisqa tavsif" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Aktiv</FormLabel>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>Bekor qilish</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingCategory ? "Saqlash" : "Qo'shish"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>O'chirish</DialogTitle>
            <DialogDescription>
              "{categoryToDelete?.name}" kategoriyasini o'chirishni xohlaysizmi?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Bekor qilish</Button>
            <Button
              variant="destructive"
              onClick={() => categoryToDelete && deleteMutation.mutate(categoryToDelete.id)}
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
