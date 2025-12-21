import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Product, Category } from "@shared/schema";

const productFormSchema = z.object({
  name: z.string().min(1, "Nom kiritish shart"),
  description: z.string().optional(),
  price: z.string().min(1, "Narx kiritish shart"),
  originalPrice: z.string().optional(),
  categoryId: z.string().optional(),
  stock: z.string().min(1, "Zaxirani kiriting"),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
}

export default function ProductFormDialog({ open, onClose, product, categories }: ProductFormDialogProps) {
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const isEditing = !!product;

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      categoryId: "",
      stock: "0",
      isActive: true,
      isFeatured: false,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        price: product.price?.toString() || "",
        originalPrice: product.originalPrice?.toString() || "",
        categoryId: product.categoryId?.toString() || "",
        stock: product.stock.toString(),
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      });
      setImages(Array.isArray(product.images) ? product.images : []);
    } else {
      form.reset({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        categoryId: "",
        stock: "0",
        isActive: true,
        isFeatured: false,
      });
      setImages([]);
    }
  }, [product, open]);

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const payload = {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        stock: parseInt(data.stock),
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        images,
      };

      if (isEditing) {
        return apiRequest("PATCH", `/api/admin/products/${product.id}`, payload);
      }
      return apiRequest("POST", "/api/admin/products", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: isEditing ? "Mahsulot yangilandi" : "Mahsulot qo'shildi" });
      onClose();
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    console.log('Upload started, files:', files.length);

    const formData = new FormData();
    Array.from(files).forEach(file => {
      console.log('Adding file:', file.name, file.type, file.size);
      formData.append("images", file);
    });

    try {
      console.log('Sending request to /api/admin/upload');
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.urls) {
        setImages(prev => [...prev, ...data.urls]);
        toast({ title: "Rasmlar muvaffaqiyatli yuklandi" });
      } else {
        throw new Error('No URLs returned');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Rasm yuklashda xatolik", variant: "destructive" });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Images */}
            <div className="space-y-2">
              <Label>Rasmlar</Label>
              <div className="grid grid-cols-4 gap-3">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeImage(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Yuklash</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="Mahsulot nomi" {...field} data-testid="input-product-name" />
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
                    <Textarea placeholder="Mahsulot haqida..." className="min-h-24" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Narx (so'm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} data-testid="input-price" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="originalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asl narx (chegirma uchun)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoriya</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zaxira (dona)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} data-testid="input-stock" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-6">
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

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Tavsiya etilgan</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={mutation.isPending} data-testid="button-save-product">
                {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? "Saqlash" : "Qo'shish"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
