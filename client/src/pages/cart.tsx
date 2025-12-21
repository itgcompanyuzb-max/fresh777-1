import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Minus, Plus, Trash2, Package, ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTelegram } from "@/lib/telegram";
import { CustomerHeader } from "@/components/customer-header";
import type { CartItem, Product } from "@shared/schema";
import { max } from "drizzle-orm";

interface CartItemWithProduct extends CartItem {
  product?: Product;
}

function CartItemCard({ item, onUpdate, onRemove, isUpdating }: {
  item: CartItemWithProduct;
  onUpdate: (quantity: number) => void;
  onRemove: () => void;
  isUpdating: boolean;
}) {
  const { hapticFeedback } = useTelegram();
  const product = item.product;

  if (!product) return null;

  const handleQuantityChange = (delta: number) => {
    hapticFeedback.selection();
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      onRemove();
    } else {
      onUpdate(newQuantity);
    }
  };

  return (
    <Card className="p-4" data-testid={`cart-item-${item.id}`}>
      <div className="flex gap-3">
        {/* Product Image */}
        <Link href={`/product/${product.id}`}>
          <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-medium text-sm line-clamp-2 mb-1 hover:underline">
              {product.name}
            </h3>
          </Link>
          <p className="font-semibold text-base mb-2">
            {typeof product.price === 'string' ? parseInt(product.price).toLocaleString() : product.price.toLocaleString()} so'm
          </p>

          <div className="flex items-center justify-between">
            {/* Quantity Controls */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(-1)}
                disabled={isUpdating}
                data-testid={`button-decrease-${item.id}`}
              >
                {item.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              </Button>
              <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(1)}
                disabled={isUpdating || item.quantity >= (product.stock || 0)}
                data-testid={`button-increase-${item.id}`}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Item Total */}
            <span className="font-semibold">
              {((typeof product.price === 'string' ? parseInt(product.price) : product.price) * item.quantity).toLocaleString()} so'm
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CartSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <Skeleton className="w-20 h-20 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-5 w-1/3" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function CartPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { hapticFeedback, showBackButton, hideBackButton, onBackButtonClick } = useTelegram();
  const { isLoading: authLoading } = useCustomerAuth();

  const { data: cartItems, isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      return apiRequest("PATCH", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart/count"] });
    },
    onError: () => {
      hapticFeedback.notification("error");
      toast({
        title: "Xatolik",
        description: "Miqdorni o'zgartirib bo'lmadi",
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/cart/${id}`, undefined);
    },
    onSuccess: () => {
      hapticFeedback.notification("success");
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart/count"] });
      toast({
        title: "O'chirildi",
        description: "Mahsulot savatchadan o'chirildi",
      });
    },
    onError: () => {
      hapticFeedback.notification("error");
      toast({
        title: "Xatolik",
        description: "Mahsulotni o'chirib bo'lmadi",
        variant: "destructive",
      });
    },
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

  const totalAmount = cartItems?.reduce((sum, item) => {
    const price = typeof item.product?.price === 'string' ? parseInt(item.product.price) : item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0) || 0;

  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CustomerHeader title="Savatcha" />
        <div className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CartSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = !cartItems || cartItems.length === 0;

  return (
    <div className="min-h-screen bg-background pb-32">
      <CustomerHeader title="Savatcha" />

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium mb-2">Savatcha bo'sh</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Mahsulotlarni ko'rish uchun katalogga o'ting
          </p>
          <Button onClick={() => navigate("/")} data-testid="button-go-catalog">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Katalogga o'tish
          </Button>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {cartItems.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onUpdate={(quantity) => updateMutation.mutate({ id: item.id, quantity })}
              onRemove={() => removeMutation.mutate(item.id)}
              isUpdating={updateMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Bottom Checkout Bar */}
      {!isEmpty && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-inset-bottom">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground">Jami:</span>
            <span className="text-xl font-bold" data-testid="text-total">
              {totalAmount.toLocaleString()} so'm
            </span>
          </div>
          <Button 
            className="w-full h-12" 
            onClick={() => navigate("/checkout")}
            data-testid="button-checkout"
          >
            Buyurtma berish
          </Button>
        </div>
      )}
    </div>
  );
}
