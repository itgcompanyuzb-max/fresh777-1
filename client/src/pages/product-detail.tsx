import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { Minus, Plus, Star, Package, Heart, Share2, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTelegram } from "@/lib/telegram";
import { CustomerHeader } from "@/components/customer-header";
import type { Product, Review, Customer } from "@shared/schema";

interface ProductWithReviews extends Product {
  reviews?: (Review & { customer?: Customer })[];
  averageRating?: number;
}

function ImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const validImages = Array.isArray(images) ? images.filter(img => img && img.trim() !== '') : [];

  if (!validImages || validImages.length === 0) {
    return (
      <div className="aspect-[4/3] bg-muted flex items-center justify-center w-full">
        <Package className="h-20 w-20 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="aspect-[4/3] overflow-hidden bg-muted w-full">
        <img
          src={validImages[currentIndex]}
          alt="Product"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      {validImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
            onClick={() => setCurrentIndex(i => i === 0 ? validImages.length - 1 : i - 1)}
            data-testid="button-prev-image"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
            onClick={() => setCurrentIndex(i => i === validImages.length - 1 ? 0 : i + 1)}
            data-testid="button-next-image"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          
          {/* Dots indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {validImages.map((_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? "bg-primary" : "bg-background/60"
                }`}
                onClick={() => setCurrentIndex(i)}
                data-testid={`button-image-dot-${i}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "h-5 w-5" : "h-4 w-4";
  
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review & { customer?: Customer } }) {
  const date = new Date(review.createdAt);
  const formattedDate = date.toLocaleDateString('uz-UZ', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={review.customer?.photoUrl || undefined} />
          <AvatarFallback>
            {review.customer?.firstName?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-medium text-sm truncate">
              {review.customer?.firstName || "Foydalanuvchi"} {review.customer?.lastName?.[0]}.
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{formattedDate}</span>
          </div>
          <StarRating rating={review.rating} />
          {review.comment && (
            <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

function RelatedProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="w-36 flex-shrink-0 overflow-hidden hover-elevate cursor-pointer" data-testid={`card-related-${product.id}`}>
        <div className="aspect-square bg-muted">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-2">
          <h4 className="text-xs font-medium line-clamp-2 mb-1">{product.name}</h4>
          <span className="text-sm font-semibold">{typeof product.price === 'string' ? parseInt(product.price).toLocaleString() : product.price.toLocaleString()} so'm</span>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ProductDetailPage() {
  const [, params] = useRoute("/product/:id");
  const [, navigate] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const { hapticFeedback, showBackButton, hideBackButton, onBackButtonClick } = useTelegram();

  const productId = params?.id ? parseInt(params.id) : null;

  const { data: product, isLoading } = useQuery<ProductWithReviews>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const { data: relatedProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!product?.categoryId,
    select: (data) => data
      .filter(p => p.categoryId === product?.categoryId && p.id !== Number(productId))
      .slice(0, 5)
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart", { productId, quantity });
    },
    onSuccess: () => {
      hapticFeedback.notification("success");
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart/count"] });
      toast({
        title: "Savatchaga qo'shildi",
        description: `${product?.name} (${quantity} dona)`,
      });
    },
    onError: () => {
      hapticFeedback.notification("error");
      toast({
        title: "Xatolik",
        description: "Savatchaga qo'shib bo'lmadi",
        variant: "destructive",
      });
    },
  });

  const { data: likedProducts } = useQuery({ queryKey: ['/api/likes'] });
  const isLiked = !!(Array.isArray(likedProducts) && likedProducts.find((p: any) => p.id === productId));

  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!productId) throw new Error('Product ID required');
      const res = await apiRequest('POST', '/api/likes', { productId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/likes'] });
      hapticFeedback.notification("success");
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Like qo'shib bo'lmadi",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    showBackButton?.();
    const cleanup = onBackButtonClick?.(() => {
      navigate("/");
    });
    return () => {
      hideBackButton?.();
      cleanup?.();
    };
  }, []);

  const handleQuantityChange = (delta: number) => {
    hapticFeedback.selection();
    setQuantity(q => Math.max(1, Math.min(99, q + delta)));
  };

  const hasDiscount = product?.originalPrice && parseFloat(String(product.originalPrice)) > parseFloat(String(product.price));
  const discountPercent = hasDiscount 
    ? Math.round((1 - parseFloat(String(product!.price)) / parseFloat(String(product!.originalPrice!))) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CustomerHeader title="Mahsulot" />
        <Skeleton className="aspect-[4/3]" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium mb-2">Mahsulot topilmadi</h2>
        <Button variant="outline" onClick={() => navigate("/")}>
          Katalogga qaytish
        </Button>
      </div>
    );
  }

  const filteredRelated = relatedProducts?.filter(p => p.id !== product.id && p.isActive).slice(0, 6);

  return (
    <div className="min-h-screen bg-background pb-24">
      <CustomerHeader title="Mahsulot" hideActions={true} />

      {/* Image Carousel */}
      <ImageCarousel images={product.images && Array.isArray(product.images) ? product.images : []} />

      {/* Product Info */}
      <div className="p-4 space-y-4">
        <div>
          {hasDiscount && (
            <Badge variant="destructive" className="mb-2">
              -{discountPercent}% chegirma
            </Badge>
          )}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl font-semibold flex-1" data-testid="text-product-name">{product.name}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleLikeMutation.mutate()}
              disabled={toggleLikeMutation.isPending}
              className="flex-shrink-0 mt-0"
              data-testid="button-toggle-like"
            >
              <Heart
                className={`h-6 w-6 transition-colors ${
                  isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
                }`}
              />
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold" data-testid="text-product-price">
              {parseInt(String(product.price)).toLocaleString()} so'm
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                {parseInt(String(product.originalPrice!)).toLocaleString()} so'm
              </span>
            )}
          </div>

          {product.averageRating && product.averageRating > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={Math.round(product.averageRating)} size="md" />
              <span className="text-sm text-muted-foreground">
                ({product.reviews?.length || 0} sharh)
              </span>
            </div>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2">
          {product.stock > 0 ? (
            <>
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Sotuvda mavjud ({product.stock} dona)</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm text-muted-foreground">Sotuvda yo'q</span>
            </>
          )}
        </div>

        <Separator />

        {/* Description */}
        {product.description && (
          <div>
            <h3 className="font-medium mb-2">Tavsif</h3>
            <p className="text-muted-foreground text-sm whitespace-pre-line" data-testid="text-product-description">
              {product.description}
            </p>
          </div>
        )}

        {/* Related Products */}
        {filteredRelated && filteredRelated.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">O'xshash mahsulotlar</h3>
            <ScrollArea className="w-full">
              <div className="flex gap-3 pb-2">
                {filteredRelated.map((p) => (
                  <RelatedProductCard key={p.id} product={p} />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Sharhlar ({product.reviews.length})</h3>
            <div className="space-y-3">
              {product.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-inset-bottom">
        <div className="flex items-center gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              data-testid="button-quantity-minus"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium" data-testid="text-quantity">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= product.stock}
              data-testid="button-quantity-plus"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {/* Add to Cart Button */}
          <Button
            className="h-12 w-12"
            variant={isLiked ? 'ghost' : 'outline'}
            onClick={() => toggleLikeMutation.mutate()}
            disabled={!product || toggleLikeMutation.isPending}
            data-testid="button-like"
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'text-red-500' : ''}`} />
          </Button>

          <Button
            className="flex-1 h-12"
            onClick={() => addToCartMutation.mutate()}
            disabled={product.stock === 0 || addToCartMutation.isPending}
            data-testid="button-add-to-cart"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {addToCartMutation.isPending ? "Qo'shilmoqda..." : "Savatchaga qo'shish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
