import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, Phone, ShoppingBag, Calendar, CheckCircle2, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer } from "@shared/schema";

interface CustomerWithOrders extends Customer {
  ordersCount?: number;
  totalSpent?: number;
}

export default function AdminCustomers() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: customers, isLoading } = useQuery<CustomerWithOrders[]>({
    queryKey: ["/api/admin/customers"],
  });

  const filteredCustomers = customers?.filter(c =>
    c.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phoneNumber?.includes(searchQuery) ||
    c.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const totalCustomers = customers?.length || 0;
  const customersWithPhone = customers?.filter(c => c.phoneNumber).length || 0;
  const customersWithOrders = customers?.filter(c => (c.ordersCount || 0) > 0).length || 0;
  const totalRevenue = customers?.reduce((sum, c) => sum + (c.totalSpent || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ro'yxatdan o'tganlar</h1>
        <p className="text-muted-foreground mt-1">Barcha foydalanuvchilar va mijozlar</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jami ro'yxatdan o'tgan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">{totalCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">foydalanuvchi</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Telefon bilan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">{customersWithPhone}</div>
                <p className="text-xs text-muted-foreground mt-1">to'ldirgan</p>
              </div>
              <Phone className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Buyurtma bergan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">{customersWithOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">foydalanuvchi</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Umumiy savdo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">{(totalRevenue / 1000).toFixed(0)}K</div>
                <p className="text-xs text-muted-foreground mt-1">so'm</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-base">Barcha mijozlar ({filteredCustomers?.length || 0})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-customers"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredCustomers && filteredCustomers.length > 0 ? (
            <div className="space-y-3">
              {filteredCustomers.map((customer) => {
                const date = new Date(customer.createdAt);
                const isVerified = !!customer.phoneNumber;
                return (
                  <Card key={customer.id} className="p-4 hover:bg-muted/50 transition-colors" data-testid={`customer-card-${customer.id}`}>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={customer.photoUrl || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {customer.firstName?.[0] || customer.username?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-base">
                            {customer.firstName || "Foydalanuvchi"} {customer.lastName || ""}
                          </span>
                          {isVerified && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Tasdiqlandi
                            </Badge>
                          )}
                          {customer.username && (
                            <span className="text-sm text-muted-foreground">@{customer.username}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
                          {customer.phoneNumber ? (
                            <span className="flex items-center gap-1 text-foreground font-medium">
                              <Phone className="h-3 w-3" />
                              {customer.phoneNumber}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600 font-medium">
                              <Clock className="h-3 w-3" />
                              Telefon kiritilmadi
                            </span>
                          )}
                          {customer.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {customer.address}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {date.toLocaleDateString('uz-UZ')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end mb-2">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-lg">{customer.ordersCount || 0}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(customer.totalSpent || 0).toLocaleString()} so'm
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">Mijozlar topilmadi</h3>
              <p className="text-sm text-muted-foreground">Qidiruv shartlariga mos mijoz yo'q</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
