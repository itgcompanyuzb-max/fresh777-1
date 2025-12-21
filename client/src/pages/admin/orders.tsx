import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Package, Phone, MapPin, Clock, ChevronDown, ChevronUp, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Order, OrderItem, Customer, Product } from "@shared/schema";

interface OrderWithDetails extends Order {
  customer?: Customer;
  items?: (OrderItem & { product?: Product })[];
  latitude?: number;
  longitude?: number;
}

const statusLabels: Record<string, string> = {
  new: "Yangi",
  processing: "Jarayonda",
  completed: "Bajarildi",
  cancelled: "Bekor qilindi",
};

const statusColors: Record<string, string> = {
  new: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

function OrderCard({ order, onStatusChange, isSelected, onSelect, onDelete }: { order: OrderWithDetails; onStatusChange: (status: string) => void; isSelected: boolean; onSelect: () => void; onDelete: () => void }) {
  const [isOpen, setIsOpen] = useState(isSelected);
  const date = new Date(order.createdAt);

  useEffect(() => {
    setIsOpen(isSelected);
  }, [isSelected]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card data-testid={`order-card-${order.id}`} className={isSelected ? 'border-primary' : ''} onClick={onSelect}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover-elevate">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">#{order.id}</span>
                  <Badge className={`${statusColors[order.status]} border`}>
                    {statusLabels[order.status]}
                  </Badge>
                  <Badge variant="outline">
                    {order.paymentMethod === "cash" ? "Naqd" : "Karta"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {order.customer?.firstName || "Mijoz"} {order.customer?.lastName?.[0]}.
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {date.toLocaleDateString('uz-UZ')} {date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  <div className="font-semibold">{parseInt(order.totalAmount).toLocaleString()} so'm</div>
                  <div className="text-xs text-muted-foreground">{order.items?.length || 0} ta mahsulot</div>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 space-y-4 border-t">
            {/* Customer Info */}
            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${order.phoneNumber}`} className="text-primary">{order.phoneNumber}</a>
              </div>
              {order.deliveryMethod === "delivery" && order.deliveryAddress && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{order.deliveryAddress}</span>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                {order.deliveryMethod === "delivery" ? "Yetkazib berish" : "O'zi olib ketadi"}
                {order.deliveryMethod === "delivery" && ` (+${parseInt(order.deliveryFee).toLocaleString()} so'm)`}
              </div>
              {order.notes && (
                <div className="text-sm p-2 bg-muted rounded-lg">
                  <span className="font-medium">Izoh:</span> {order.notes}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Mahsulotlar:</h4>
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {item.product?.images && item.product.images.length > 0 ? (
                      <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.product?.name || "Nomalum mahsulot"}</div>
                    <div className="text-xs text-muted-foreground">{parseInt(String(item.product?.price || item.price)).toLocaleString()} so'm x {item.quantity}</div>
                  </div>
                  <div className="font-medium text-sm">
                    {(parseInt(String(item.product?.price || item.price)) * item.quantity).toLocaleString()} so'm
                  </div>
                </div>
              ))}
            </div>

            {/* Status Change and Delete */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-sm text-muted-foreground">Holatini o'zgartirish:</span>
              <Select value={order.status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Yangi</SelectItem>
                  <SelectItem value="processing">Jarayonda</SelectItem>
                  <SelectItem value="completed">Bajarildi</SelectItem>
                  <SelectItem value="cancelled">Bekor qilindi</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={onDelete}
                className="ml-auto"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                O'chirish
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery<OrderWithDetails[]>({
    queryKey: ["/api/admin/orders"],
  });

  const selectedOrder = orders?.find(o => o.id === selectedOrderId);

  useEffect(() => {
    if (selectedOrder?.latitude && selectedOrder?.longitude) {
      // Load Yandex Maps API if not already loaded
      if (!(window as any).ymaps) {
        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=uz_UZ';
        script.onload = () => {
          setTimeout(() => {
            initMap(selectedOrder.latitude!, selectedOrder.longitude!, selectedOrder.deliveryAddress || '');
          }, 100);
        };
        script.onerror = () => {
          console.error('Failed to load Yandex Maps');
        };
        document.head.appendChild(script);
      } else {
        // Already loaded, init map immediately
        initMap(selectedOrder.latitude, selectedOrder.longitude, selectedOrder.deliveryAddress || '');
      }
    }
  }, [selectedOrder?.latitude, selectedOrder?.longitude, selectedOrder?.deliveryAddress]);

  const initMap = (lat: number, lng: number, address: string) => {
    const ymaps = (window as any).ymaps;
    if (!ymaps) {
      console.error('Yandex Maps API not loaded');
      return;
    }

    ymaps.ready(() => {
      const mapElement = document.getElementById('yandex-map');
      if (!mapElement) {
        console.error('Map element not found');
        return;
      }

      try {
        // Clear previous map if exists
        mapElement.innerHTML = '';

        const myMap = new ymaps.Map(mapElement, {
          center: [lat, lng],
          zoom: 15,
          controls: ['zoomControl', 'fullscreenControl']
        });

        const myPlacemark = new ymaps.Placemark(
          [lat, lng],
          { 
            balloonContent: `<div style="padding: 10px;"><strong>Yetkazib berish manzili</strong><br/>${address || 'Koordinatalar: ' + lat.toFixed(4) + ', ' + lng.toFixed(4)}</div>`,
            hintContent: address || 'Manzil'
          },
          { preset: 'islands#redDotIcon' }
        );

        myMap.geoObjects.add(myPlacemark);
        myPlacemark.balloon.open();
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    });
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/admin/orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Holat yangilandi" });
    },
    onError: () => {
      toast({ title: "Xatolik", variant: "destructive" });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedOrderId(null);
      toast({ title: "Buyurtma o'chirildi" });
    },
    onError: () => {
      toast({ title: "Xatolik", description: "Buyurtmani o'chira olmadi", variant: "destructive" });
    },
  });

  const filteredOrders = orders?.filter(o => {
    const matchesSearch = o.id.toString().includes(searchQuery) ||
      o.customer?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phoneNumber.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-semibold">Buyurtmalar</h1>
        <p className="text-muted-foreground">Buyurtmalarni ko'rish va boshqarish</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Holati" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barchasi</SelectItem>
              <SelectItem value="new">Yangi</SelectItem>
              <SelectItem value="processing">Jarayonda</SelectItem>
              <SelectItem value="completed">Bajarildi</SelectItem>
              <SelectItem value="cancelled">Bekor qilindi</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-orders"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Orders List */}
        <div className="w-full sm:w-96 overflow-auto border rounded">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))
          ) : filteredOrders && filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isSelected={selectedOrderId === order.id}
                onSelect={() => setSelectedOrderId(order.id)}
                onStatusChange={(status) => updateStatusMutation.mutate({ id: order.id, status })}
                onDelete={() => deleteOrderMutation.mutate(order.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center p-4">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">Buyurtmalar topilmadi</h3>
            </div>
          )}
        </div>

        {/* Map */}
        {selectedOrder && (
          <div className="hidden sm:flex flex-1 flex-col border rounded overflow-hidden">
            {selectedOrder.latitude && selectedOrder.longitude ? (
              <div id="yandex-map" style={{ width: '100%', height: '100%' }} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Manzil koordinatalari mavjud emas
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
