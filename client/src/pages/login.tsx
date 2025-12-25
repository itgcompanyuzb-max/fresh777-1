import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, LogIn as LoginIcon, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useTelegram } from "@/lib/telegram";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user: telegramUser, hapticFeedback } = useTelegram();
  
  const [phoneNumber, setPhoneNumber] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!phoneNumber.trim()) {
        throw new Error("Telefon raqamini kiriting");
      }

      if (phoneNumber.trim().length < 9) {
        throw new Error("Telefon raqami noto'g'ri");
      }

      // Get headers with Telegram info
      const headers: HeadersInit = {};
      if (telegramUser?.id) {
        headers['x-telegram-id'] = String(telegramUser.id);
        if (telegramUser.first_name) headers['x-telegram-firstname'] = telegramUser.first_name;
        if (telegramUser.last_name) headers['x-telegram-lastname'] = telegramUser.last_name;
        if (telegramUser.username) headers['x-telegram-username'] = telegramUser.username;
      }

      // Search for customer by phone number using direct fetch
      const response = await fetch(
        `/api/customers/search?phone=${encodeURIComponent(phoneNumber.trim())}`,
        {
          method: 'GET',
          headers,
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error("Bu telefon raqami bilan account topilmadi");
      }

      const customer = await response.json();
      
      if (!customer || !customer.id) {
        throw new Error("Bu telefon raqami bilan account topilmadi");
      }

      return customer;
    },
    onSuccess: () => {
      hapticFeedback.notification?.("success");
      queryClient.invalidateQueries({ queryKey: ["/api/customers/me"] });
      toast({
        title: "Muvaffaqiyatli",
        description: "Kirish amalga oshdi!",
      });
      
      // Navigate to catalog after short delay
      setTimeout(() => {
        navigate("/");
      }, 500);
    },
    onError: (error: any) => {
      hapticFeedback.notification?.("error");
      toast({
        title: "Xatolik",
        description: error?.message || "Kirish amalga oshmadi",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hapticFeedback.selection?.();
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4 py-8">
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Orqaga
        </Button>
      </div>
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <LoginIcon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Kirish</CardTitle>
          <CardDescription>Mavjud accountingiz bilan kiring</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium">
                Telefon raqami
              </label>
              <Input
                id="phoneNumber"
                placeholder="+998 (XX) XXX-XX-XX"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loginMutation.isPending}
                className="text-base"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Ro'yxatdan o'tishda kiritgan telefon raqamingizni kiriting
              </p>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending || !phoneNumber.trim()}
              className="w-full h-11 text-base"
              size="lg"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kirilmoqda...
                </>
              ) : (
                <>
                  <LoginIcon className="h-4 w-4 mr-2" />
                  Kirish
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-2">
              Hali accountingiz yo'qmi?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-primary hover:underline"
              >
                Ro'yxatdan o'tish
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
