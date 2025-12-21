import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign, BarChart3, Bot, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTelegramBot } from "@/hooks/use-telegram-bot";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import type { Product } from "@shared/schema";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  ordersToday: number;
  revenueToday: number;
  ordersByStatus: { status: string; count: number }[];
  revenueByDay: { date: string; revenue: number }[];
  topProducts: { product: Product; orderCount: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  monthlyOrders: { month: string; count: number }[];
}

function StatCard({ title, value, icon: Icon, trend, trendValue, isLoading }: {
  title: string;
  value: string | number;
  icon: any;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            )}
            {trendValue && (
              <div className="flex items-center gap-1">
                {trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                {trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                <span className={`text-xs ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { botInfo, isBotConfigured, isBotInfoLoading } = useTelegramBot();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Do'kon statistikasi va ko'rsatkichlari</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jami savdo"
          value={stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString()} so'm` : "0 so'm"}
          icon={DollarSign}
          isLoading={isLoading}
        />
        <StatCard
          title="Buyurtmalar"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          trendValue={`Bugun: ${stats?.ordersToday || 0}`}
          trend="neutral"
          isLoading={isLoading}
        />
        <StatCard
          title="Mijozlar"
          value={stats?.totalCustomers || 0}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          title="Mahsulotlar"
          value={stats?.totalProducts || 0}
          icon={Package}
          isLoading={isLoading}
        />
      </div>

      {/* Telegram Bot Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Telegram Bot Holati
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isBotInfoLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : isBotConfigured && botInfo ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Bot faol</span>
                <Badge variant="secondary">Ulangang</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <p><strong>Bot nomi:</strong> {botInfo.botInfo.first_name}</p>
                <p><strong>Username:</strong> @{botInfo.botInfo.username}</p>
                <p><strong>Bot ID:</strong> {botInfo.botInfo.id}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Bot konfiguratsiya qilinmagan</span>
                <Badge variant="destructive">O'chiq</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Telegram botni faollashtirish uchun .env faylida TELEGRAM_BOT_TOKEN ni sozlang
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Haftalik savdo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : stats?.revenueByDay && stats.revenueByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString()} so'm`, "Savdo"]}
                    contentStyle={{ borderRadius: "8px" }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Ma'lumot yo'q
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Oylik savdo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString()} so'm`, "Savdo"]}
                    contentStyle={{ borderRadius: "8px" }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Ma'lumot yo'q
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Eng ko'p sotilgan mahsulotlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topProducts.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                        {i + 1}
                      </Badge>
                      <span className="font-medium text-sm line-clamp-1">{item.product.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{item.orderCount} dona</div>
                      <div className="text-xs text-muted-foreground">{(item.product.price * item.orderCount).toLocaleString()} so'm</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Ma'lumot yo'q
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Orders by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Buyurtmalar holati</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))
            ) : (
              <>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats?.ordersByStatus?.find(s => s.status === 'new')?.count || 0}
                  </div>
                  <div className="text-sm text-yellow-600">Yangi</div>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.ordersByStatus?.find(s => s.status === 'processing')?.count || 0}
                  </div>
                  <div className="text-sm text-blue-600">Jarayonda</div>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.ordersByStatus?.find(s => s.status === 'completed')?.count || 0}
                  </div>
                  <div className="text-sm text-green-600">Bajarildi</div>
                </div>
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-2xl font-bold text-red-600">
                    {stats?.ordersByStatus?.find(s => s.status === 'cancelled')?.count || 0}
                  </div>
                  <div className="text-sm text-red-600">Bekor qilindi</div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
