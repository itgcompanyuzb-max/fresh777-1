import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Upload, Loader2 } from 'lucide-react';

interface Banner {
  id: number;
  imageUrl: string;
  title?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export default function BannersPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ['/api/banners'],
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to create banner');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Muvaffaqiyat',
        description: 'Banner qo\'shildi',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      setTitle('');
      setDescription('');
      setSortOrder('0');
      setImageFile(null);
      setPreview(null);
    },
    onError: () => {
      toast({
        title: 'Xato',
        description: 'Bannerni qo\'shib bo\'lmadi',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete banner');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Muvaffaqiyat',
        description: 'Banner o\'chirildi',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
    },
    onError: () => {
      toast({
        title: 'Xato',
        description: 'Bannerni o\'chib bo\'lmadi',
        variant: 'destructive',
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      toast({
        title: 'Xato',
        description: 'Rasmni tanlang',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('sortOrder', sortOrder);

    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Banner Boshqaruvi</h1>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Yangi Banner Qo'shish</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="image">Rasm *</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={createMutation.isPending}
                required
              />
              {preview && (
                <div className="mt-3 h-40 w-full overflow-hidden rounded-lg border">
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="title">Sarlavha</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bannerning sarlavhasi"
                disabled={createMutation.isPending}
              />
            </div>

            <div>
              <Label htmlFor="description">Tavsifi</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bannerning tavsifi"
                disabled={createMutation.isPending}
              />
            </div>

            <div>
              <Label htmlFor="sortOrder">Tartibi</Label>
              <Input
                id="sortOrder"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>

            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Qo'shilmoqda...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Banner Qo'shish
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Banners List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Mavjud Bannerlar</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        ) : banners && banners.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {banners.map((banner) => (
              <Card key={banner.id} className="overflow-hidden">
                <div className="h-40 w-full overflow-hidden bg-muted">
                  <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
                </div>
                <CardContent className="pt-4 space-y-2">
                  {banner.title && <p className="font-semibold text-sm">{banner.title}</p>}
                  {banner.description && <p className="text-xs text-muted-foreground">{banner.description}</p>}
                  <p className="text-xs text-muted-foreground">Tartibi: {banner.sortOrder}</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => deleteMutation.mutate(banner.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    O'chirish
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Bannerlar yo'q</p>
        )}
      </div>
    </div>
  );
}
