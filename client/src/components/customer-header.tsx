import { Link, useLocation } from "wouter";
import { ShoppingCart, Heart, MessageCircle, LogIn, User, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Customer } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BannerCarousel } from "@/components/banner-carousel";

export function CustomerHeader({ title, hideActions = false }: { title: string; hideActions?: boolean }) {
  const [logo, setLogo] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("adminLogo");
    if (stored) {
      setLogo(JSON.parse(stored));
    }
  }, []);

  const { data: cartCount } = useQuery<{ count: number }>({
    queryKey: ["/api/cart/count"],
  });

  const { data: likedProducts } = useQuery<{ id: number }[]>({
    queryKey: ["/api/likes"],
  });

  const { data: customer } = useQuery<Customer>({
    queryKey: ["/api/customers/me"],
  });

  const handleLogout = async () => {
    try {
      // Clear user data by updating customer with null phoneNumber
      await apiRequest("PATCH", "/api/customers/me", {
        phoneNumber: null,
      });
      
      // Invalidate queries to clear cached data
      queryClient.invalidateQueries({ queryKey: ["/api/customers/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart/count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/likes"] });
      
      setOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Banner Carousel */}
      <BannerCarousel />

      {/* Header (title yashirilgan) */}
      <header className="sticky top-0 z-50 bg-background border-b px-4 py-3 safe-area-inset-top">
        <div className="flex items-center justify-start gap-3">
          {/* <h1 className="text-xl font-semibold">{title}</h1> */}
        </div>
      </header>

      {/* Top Navigation Bar (web app nav bar) */}
      <nav className="w-full bg-background border-b px-4 py-3 flex items-center justify-start gap-2 safe-area-inset-top">
        {!hideActions && logo && (
          <div className="h-8 w-8 rounded-md overflow-hidden flex-shrink-0">
            <img src={logo} alt="Logo" className="h-full w-full object-cover" />
          </div>
        )}
        {hideActions ? (
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <>
            <Link href="/liked">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {likedProducts && likedProducts.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 flex items-center justify-center text-xs" variant="default">
                    {likedProducts.length}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="ghost" size="icon">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount && cartCount.count > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 flex items-center justify-center text-xs" variant="default">
                    {cartCount.count}
                  </Badge>
                )}
              </Button>
            </Link>
          </>
        )}
        {/* User Profile or Sign Up */}
        {customer?.phoneNumber ? (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <User className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Ism</p>
                  <p className="font-semibold text-sm">{customer.firstName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Telefon</p>
                  <p className="font-semibold text-sm">{customer.phoneNumber}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Chiqish
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="default" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Kirish</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 space-y-3">
              <Link href="/login" className="block">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  Mavjud accounti bilan kirish
                </Button>
              </Link>
              <Link href="/signup" className="block">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  Yangi account yaratish
                </Button>
              </Link>
            </PopoverContent>
          </Popover>
        )}
      </nav>
    </>
  );
}
