import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Heart } from 'lucide-react';
import { useCustomerAuth } from '@/hooks/use-customer-auth';
import { CustomerHeader } from '@/components/customer-header';

export default function LikedPage() {
  const { isLoading: authLoading } = useCustomerAuth();
  const { data: products } = useQuery({ queryKey: ['/api/likes'], enabled: true, refetchOnWindowFocus: false });

  const isEmpty = !products || products.length === 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CustomerHeader title="Sevimli" />

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium mb-2">Sevimli mahsulot yo'q</h2>
          <p className="text-muted-foreground text-sm">
            Mahsulotlar ustiga <span className="text-red-500">❤️</span> bosganda shu yerda ko'rinadi
          </p>
        </div>
      ) : (
        <main className="flex-1 px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            {products?.map((p: any) => (
              <Link key={p.id} href={`/product/${p.id}`}>
                <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {p.images && p.images[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <CardContent className="p-3 space-y-1">
                    <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">
                        {parseInt(String(p.price)).toLocaleString()} so'm
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}
