import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Send,
  MessageSquare,
  LogOut,
  Menu,
  Upload,
  X,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Mahsulotlar",
    url: "/admin/products",
    icon: Package,
  },
  {
    title: "Kategoriyalar",
    url: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "Buyurtmalar",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Mijozlar",
    url: "/admin/customers",
    icon: Users,
  },
  {
    title: "Chat",
    url: "/admin/chat",
    icon: MessageSquare,
  },
  {
    title: "Xabarlar",
    url: "/admin/broadcasts",
    icon: Send,
  },
  {
    title: "Bannerlar",
    url: "/admin/banners",
    icon: Upload,
  },
  {
    title: "Dastavka",
    url: "/admin/delivery-settings",
    icon: Truck,
  },
];

function AdminSidebar() {
  const [location] = useLocation();
  const [logo, setLogo] = useState<string | null>(() => {
    const stored = localStorage.getItem("adminLogo");
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const logoData = reader.result as string;
        setLogo(logoData);
        localStorage.setItem("adminLogo", JSON.stringify(logoData));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    localStorage.removeItem("adminLogo");
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2 mb-3">
          {logo ? (
            <div className="h-10 w-10 rounded-md overflow-hidden flex items-center justify-center bg-muted">
              <img src={logo} alt="Logo" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <div>
            <h2 className="font-semibold text-sm">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">E-Commerce Bot</p>
          </div>
        </div>
        <div className="flex gap-2">
          <label className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full cursor-pointer"
              asChild
            >
              <span>
                <Upload className="h-3 w-3 mr-1" />
                Logo
              </span>
            </Button>
          </label>
          {logo && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveLogo}
              data-testid="button-remove-logo"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Boshqaruv</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url || 
                  (item.url !== "/admin" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} data-testid={`nav-${item.url.split('/').pop()}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          Chiqish
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-3 p-3 border-b bg-background sticky top-0 z-40">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
