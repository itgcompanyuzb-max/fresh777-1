import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category, Product } from "@shared/schema";
import { useTelegram } from "@/lib/telegram";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { CustomerHeader } from "@/components/customer-header";

function ProductCard({ product }: { product: Product }) {
  const hasDiscount = product.originalPrice && parseFloat(String(product.originalPrice)) > parseFloat(String(product.price));
  const discountPercent = hasDiscount 
    ? Math.round((1 - parseFloat(String(product.price)) / parseFloat(String(product.originalPrice!))) * 100) 
    : 0;

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer group" data-testid={`card-product-${product.id}`}>
        <div className="aspect-square relative bg-muted overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center index-1000" style={{zIndex: 1000}}>
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {hasDiscount && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 left-2 text-xs z-50" style={{zIndex:1000}}
            >
              -{discountPercent}%
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-muted-foreground font-medium">Sotuvda yo'q</span>
            </div>
          )}
        </div>
        <CardContent className="p-3 space-y-1">
          <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">
              {parseInt(String(product.price)).toLocaleString()} so'm
            </span>
            {hasDiscount && (
              <span className="text-muted-foreground text-xs line-through">
                {parseInt(String(product.originalPrice!)).toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ProductSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square" />
      <CardContent className="p-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </CardContent>
    </Card>
  );
}

function CategoryPill({ category, isActive, onClick }: { 
  category: Category; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      className="rounded-full whitespace-nowrap"
      onClick={onClick}
      data-testid={`button-category-${category.id}`}
    >
      {category.name}
    </Button>
  );
}

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { hapticFeedback } = useTelegram();
  const { isLoading: authLoading } = useCustomerAuth();

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="px-4 py-8 space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  const filteredProducts = products?.filter(p => 
    p.isActive && 
    (!selectedCategory || p.categoryId === selectedCategory) &&
    (!searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCategoryClick = (categoryId: number | null) => {
    hapticFeedback.selection();
    setSelectedCategory(categoryId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <CustomerHeader title="Katalog" />

      {/* Search Bar */}
      <div className="px-4 py-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Mahsulot qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-lg"
            data-testid="input-search"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-3 border-b">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => handleCategoryClick(null)}
              data-testid="button-category-all"
            >
              Barchasi
            </Button>
            {categoriesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))
            ) : (
              categories?.filter(c => c.isActive).map((category) => (
                <CategoryPill
                  key={category.id}
                  category={category}
                  isActive={selectedCategory === category.id}
                  onClick={() => handleCategoryClick(category.id)}
                />
              ))
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Products Grid */}
      <main className="flex-1 px-4 py-4">
        {productsLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-1">Mahsulot topilmadi</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery ? "Boshqa so'z bilan qidirib ko'ring" : "Hozircha mahsulotlar yo'q"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
