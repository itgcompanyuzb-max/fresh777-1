import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { initTelegramApp } from "@/lib/telegram";
import NotFound from "@/pages/not-found";
import SignupPage from "@/pages/signup";
import LoginPage from "@/pages/login";
import CatalogPage from "@/pages/catalog";
import ProductDetailPage from "@/pages/product-detail";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import LikedPage from "@/pages/liked";
import ChatPage from "@/pages/chat";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminCategories from "@/pages/admin/categories";
import AdminOrders from "@/pages/admin/orders";
import AdminCustomers from "@/pages/admin/customers";
import AdminBroadcasts from "@/pages/admin/broadcasts";
import AdminChat from "@/pages/admin/chat";
import BannersPage from "@/pages/admin/banners";
import DeliverySettings from "@/pages/admin/delivery-settings";
import AdminLayout from "@/pages/admin/layout";

function CustomerRouter() {
  return (
    <Switch>
      <Route path="/signup" component={SignupPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/" component={CatalogPage} />
      <Route path="/product/:id" component={ProductDetailPage} />
      <Route path="/liked" component={LikedPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AdminRouter() {
  const [location] = useLocation();
  
  if (location === "/admin/login") {
    return <AdminLoginPage />;
  }

  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/categories" component={AdminCategories} />
        <Route path="/admin/chat" component={AdminChat} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/customers" component={AdminCustomers} />
        <Route path="/admin/broadcasts" component={AdminBroadcasts} />
        <Route path="/admin/banners" component={BannersPage} />
        <Route path="/admin/delivery-settings" component={DeliverySettings} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  return isAdminRoute ? <AdminRouter /> : <CustomerRouter />;
}

function App() {
  useEffect(() => {
    // Initialize Telegram WebApp
    initTelegramApp();
    
    // Set viewport height for mobile WebApp
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    
    // Allow scrolling for content
    document.body.style.overflow = 'auto';
    document.body.style.touchAction = 'pan-x pan-y';
    
    return () => {
      window.removeEventListener('resize', setVH);
    };
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
