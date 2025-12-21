import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTelegram } from "@/lib/telegram";

export default function SignupPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user: telegramUser, hapticFeedback } = useTelegram();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const signupMutation = useMutation({
    mutationFn: async () => {
      // Use mock data for testing if telegramUser is not available
      const userId = telegramUser?.id || 123456;
      const username = telegramUser?.username || "testuser";

      const res = await apiRequest("POST", "/api/customers", {
        telegramId: String(userId),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        username: username || null,
      });
      return res.json();
    },
    onSuccess: () => {
      hapticFeedback.notification?.("success");
      queryClient.invalidateQueries({ queryKey: ["/api/customers/me"] });
      toast({
        title: "Muvaffaqiyatli",
        description: "Ro'yxatdan o'ttingiz!",
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
        description: error?.message || "Ro'yxatdan o'ta olmadi",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim()) {
      toast({
        title: "Xato",
        description: "Ismingizni kiriting",
        variant: "destructive",
      });
      return;
    }

    if (!lastName.trim()) {
      toast({
        title: "Xato",
        description: "Familyangizni kiriting",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.trim()) {
      toast({
        title: "Xato",
        description: "Telefon raqamingizni kiriting",
        variant: "destructive",
      });
      return;
    }

    if (phoneNumber.trim().length < 9) {
      toast({
        title: "Xato",
        description: "Telefon raqami noto'g'ri",
        variant: "destructive",
      });
      return;
    }

    hapticFeedback.selection?.();
    signupMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Ro'yxatdan o'tish</CardTitle>
          <CardDescription>Davom etish uchun ma'lumotingizni kiriting</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                Ismingiz *
              </label>
              <Input
                id="firstName"
                placeholder="Masalan: Muhammad"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={signupMutation.isPending}
                className="text-base"
                autoFocus
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">
                Familyangiz *
              </label>
              <Input
                id="lastName"
                placeholder="Masalan: Qodirov"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={signupMutation.isPending}
                className="text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium">
                Telefon raqami *
              </label>
              <Input
                id="phoneNumber"
                placeholder="+998 (XX) XXX-XX-XX"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={signupMutation.isPending}
                className="text-base"
                required
              />
              <p className="text-xs text-muted-foreground">
                Buyurtma uchun telefon raqami kerak bo'ladi
              </p>
            </div>

            <Button
              type="submit"
              disabled={signupMutation.isPending || !firstName.trim() || !lastName.trim() || !phoneNumber.trim()}
              className="w-full h-11 text-base"
              size="lg"
            >
              {signupMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ro'yxatdan o'tilmoqda...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ro'yxatdan o'tish
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-2">
              Telegram ma'lumotlaringiz xavfli saqlangan
            </p>
            
            <p className="text-xs text-center text-muted-foreground pt-2">
              Allaqachon accountingiz bormi?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-primary hover:underline"
              >
                Kirish
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
