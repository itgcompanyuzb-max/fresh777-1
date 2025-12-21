import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MapPin, Phone, CreditCard, Truck, Store, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Customer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useTelegramBot } from "@/hooks/use-telegram-bot";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTelegram } from "@/lib/telegram";
import { CustomerHeader } from "@/components/customer-header";
import ScrollHandle from "@/components/scroll-handle";
import type { CartItem, Product } from "@shared/schema";

interface CartItemWithProduct extends CartItem {
  product?: Product;
}

const checkoutSchema = z.object({
  phoneNumber: z.string().min(9, "Telefon raqamni kiriting").max(20),
  deliveryMethod: z.enum(["pickup", "delivery"]),
  deliveryAddress: z.string().optional(),
  paymentMethod: z.enum(["cash", "card"]),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.deliveryMethod === "delivery" && !data.deliveryAddress) {
    return false;
  }
  return true;
}, {
  message: "Yetkazib berish manzilini kiriting",
  path: ["deliveryAddress"],
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface DeliverySettings {
  standardDeliveryFee: number;
  expressDeliveryFee: number;
  freeDeliveryThreshold: number;
}

const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  standardDeliveryFee: 15000,
  expressDeliveryFee: 25000,
  freeDeliveryThreshold: 50000,
};

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [geolocation, setGeolocation] = useState<{ lat: number; lng: number } | null>(null);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(DEFAULT_DELIVERY_SETTINGS);
  const { hapticFeedback, showBackButton, hideBackButton, onBackButtonClick, user } = useTelegram();
  const { notifyOrderStatus, telegramUser } = useTelegramBot();
  const { customer, isLoading: authLoading } = useCustomerAuth();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      phoneNumber: customer?.phoneNumber || "",
      deliveryMethod: "delivery",
      deliveryAddress: "",
      paymentMethod: "cash",
      notes: "",
    },
  });

  // Auto-fill form when customer data is loaded
  useEffect(() => {
    if (customer) {
      form.setValue("phoneNumber", customer.phoneNumber || "");
    }
  }, [customer, form]);

  // Load delivery settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/admin/delivery-settings");
        if (response.ok) {
          const data = await response.json();
          setDeliverySettings(data);
        }
      } catch (error) {
        console.error("Error loading delivery settings:", error);
      }
    };
    loadSettings();
  }, []);

  const deliveryMethod = form.watch("deliveryMethod");

  const { data: cartItems, isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const payload = {
        ...data,
        items: cartItems?.map((it) => ({
          productId: it.product?.id,
          quantity: it.quantity,
          price: it.product?.price,
          productName: it.product?.name,
          productImage: it.product?.images?.[0] || null,
        })) || [],
        deliveryFee,
        totalAmount,
        latitude: geolocation?.lat,
        longitude: geolocation?.lng,
      };

      const res = await apiRequest("POST", "/api/orders", payload);
      return await res.json();
    },
    onSuccess: async (orderResponse) => {
      hapticFeedback.notification("success");
      setOrderSuccess(true);
      
      // Telegram orqali buyurtma bildirishnomasini yuborish
      if (telegramUser && orderResponse?.id) {
        try {
          await notifyOrderStatus(orderResponse.id.toString(), "pending");
        } catch (error) {
          console.error("Failed to send Telegram notification:", error);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart/count"] });
    },
    onError: () => {
      hapticFeedback.notification("error");
      toast({
        title: "Xatolik",
        description: "Buyurtmani rasmiylashtirib bo'lmadi",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    showBackButton?.();
    const cleanup = onBackButtonClick?.(() => {
      navigate("/cart");
    });
    // If opened inside Telegram WebApp, expand viewport and focus address to trigger scroll
    try {
      const webApp = (window as any)?.Telegram?.WebApp;
      if (webApp) {
        // Request Telegram to expand available viewport
        webApp.ready?.();
        webApp.expand?.();

        // Repeatedly try to expand and scroll/focus the address field — helps on Telegram mobile WebApp
        let attempts = 0;
        const maxAttempts = 8;
        const tryScroll = () => {
          attempts += 1;
          try {
            webApp.expand?.();
          } catch (err) {
            /* ignore */
          }

          const el = document.querySelector('[data-testid="input-address"]') as HTMLElement | null;
          if (el) {
            try { el.focus(); } catch (e) { /* ignore */ }
            try {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (e) {
              try { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); } catch (e) { /* ignore */ }
            }
          } else {
            try { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); } catch (e) { /* ignore */ }
          }

          // if not yet scrolled to element, do another attempt
          const rect = el?.getBoundingClientRect();
          const inView = rect && rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
          if (!inView && attempts < maxAttempts) {
            setTimeout(tryScroll, 300);
          }
        };

        setTimeout(tryScroll, 250);
      }
    } catch (e) {
      // ignore
    }
    return () => {
      hideBackButton?.();
      cleanup?.();
    };
  }, []);

  const subtotal = cartItems?.reduce((sum, item) => {
    return sum + (parseInt(String(item.product?.price || "0")) * item.quantity);
  }, 0) || 0;

  // Calculate delivery fee based on settings and threshold
  let deliveryFee = 0;
  if (deliveryMethod === "delivery") {
    // Check if order qualifies for free delivery
    if (subtotal >= deliverySettings.freeDeliveryThreshold) {
      deliveryFee = 0; // Free delivery
    } else {
      deliveryFee = deliverySettings.standardDeliveryFee;
    }
  } else if (deliveryMethod === "express") {
    deliveryFee = deliverySettings.expressDeliveryFee;
  }

  const totalAmount = subtotal + deliveryFee;

  const onSubmit = (data: CheckoutFormData) => {
    createOrderMutation.mutate(data);
  };

  // Request browser geolocation and reverse-geocode to address (Nominatim)
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation mavjud emas", variant: "destructive" });
      return;
    }

    toast({ title: "Manzil olinmoqda..." });
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setGeolocation({ lat: latitude, lng: longitude });
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          { headers: { 'User-Agent': 'Shop-Assistant-Bot/1.0' } }
        );
        if (!res.ok) throw new Error('Reverse geocode failed');
        const data = await res.json();
        const display = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        form.setValue('deliveryAddress', display, { shouldDirty: true, shouldTouch: true });
        toast({ title: 'Manzil avtomatik to\'ldirildi' });
      } catch (err) {
        console.error('Reverse geocode error', err);
        form.setValue('deliveryAddress', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        toast({ title: 'Manzil koordinatalar sifatida qo`yildi' });
      }
    }, (err) => {
      console.error('Geolocation error', err);
      toast({ title: 'Manzilni olish rad etildi yoki xato', variant: 'destructive' });
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Buyurtma qabul qilindi!</h1>
        <p className="text-muted-foreground mb-6">
          Tez orada siz bilan bog'lanamiz
        </p>
        <Button onClick={() => navigate("/")} className="w-full max-w-xs" data-testid="button-continue-shopping">
          Xaridni davom ettirish
        </Button>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <CustomerHeader title="Buyurtma berish" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Contact Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Aloqa ma'lumotlari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon raqam</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+998 90 123 45 67"
                        className="h-12"
                        {...field}
                        data-testid="input-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Delivery Method */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Yetkazib berish usuli
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="deliveryMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-3"
                      >
                        <Label
                          htmlFor="delivery"
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            field.value === "delivery" ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          <RadioGroupItem value="delivery" id="delivery" data-testid="radio-delivery" />
                          <div className="flex-1">
                            <div className="font-medium">Yetkazib berish</div>
                            <div className="text-sm text-muted-foreground">
                              Kuryer orqali ({subtotal >= deliverySettings.freeDeliveryThreshold ? "Bepul" : `${deliverySettings.standardDeliveryFee.toLocaleString()} so'm`})
                            </div>
                          </div>
                          <Truck className="h-5 w-5 text-muted-foreground" />
                        </Label>

                        <Label
                          htmlFor="pickup"
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            field.value === "pickup" ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          <RadioGroupItem value="pickup" id="pickup" data-testid="radio-pickup" />
                          <div className="flex-1">
                            <div className="font-medium">O'zim olib ketaman</div>
                            <div className="text-sm text-muted-foreground">Bepul</div>
                          </div>
                          <Store className="h-5 w-5 text-muted-foreground" />
                        </Label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {deliveryMethod === "delivery" && (
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Yetkazib berish manzili</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Textarea
                            placeholder="To'liq manzilni kiriting..."
                            className="min-h-20 resize-none"
                            {...field}
                            data-testid="input-address"
                          />
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={handleUseCurrentLocation}>
                              <MapPin className="h-4 w-4 mr-2" /> Manzilni olish
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => {
                              form.setValue('deliveryAddress', '', { shouldDirty: true });
                            }}>
                              Tozalash
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                To'lov usuli
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-3"
                      >
                        <Label
                          htmlFor="cash"
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            field.value === "cash" ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          <RadioGroupItem value="cash" id="cash" data-testid="radio-cash" />
                          <div className="flex-1">
                            <div className="font-medium">Naqd to'lov</div>
                            <div className="text-sm text-muted-foreground">Qabul qilganda to'lash</div>
                          </div>
                        </Label>

                        <Label
                          htmlFor="card"
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            field.value === "card" ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          <RadioGroupItem value="card" id="card" data-testid="radio-card" />
                          <div className="flex-1">
                            <div className="font-medium">Karta orqali</div>
                            <div className="text-sm text-muted-foreground">Click, Payme</div>
                          </div>
                        </Label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Izoh (ixtiyoriy)</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Buyurtma uchun qo'shimcha izoh..."
                        className="min-h-20 resize-none"
                        {...field}
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Buyurtma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product?.name} x{item.quantity}
                  </span>
                  <span>
                    {(parseInt(String(item.product?.price || "0")) * item.quantity).toLocaleString()} so'm
                  </span>
                </div>
              ))}
              
              <Separator className="my-2" />
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mahsulotlar:</span>
                <span>{subtotal.toLocaleString()} so'm</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Yetkazib berish:</span>
                <span>{deliveryFee === 0 ? "Bepul" : `${deliveryFee.toLocaleString()} so'm`}</span>
              </div>

              {/* Show free delivery threshold message */}
              {subtotal < deliverySettings.freeDeliveryThreshold && deliveryMethod === "delivery" && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                  Tekin dastavka uchun yana {(deliverySettings.freeDeliveryThreshold - subtotal).toLocaleString()} so'm qo'shing
                </div>
              )}
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-semibold">
                <span>Jami:</span>
                <span data-testid="text-total">{totalAmount.toLocaleString()} so'm</span>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-inset-bottom">
        <Button
          className="w-full h-12"
          onClick={form.handleSubmit(onSubmit)}
          disabled={createOrderMutation.isPending}
          data-testid="button-submit-order"
        >
          {createOrderMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Yuborilmoqda...
            </>
          ) : (
            `Buyurtma berish (${totalAmount.toLocaleString()} so'm)`
          )}
        </Button>
      </div>
      
      <ScrollHandle />
    </div>
  );
}
