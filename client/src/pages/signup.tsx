import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, UserPlus, Check, ArrowLeft } from "lucide-react";
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
  const [step, setStep] = useState<"info" | "verify">("info");
  const [otpCode, setOtpCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/send-otp", {
        phoneNumber: phoneNumber.trim(),
      });
      return res.json();
    },
    onSuccess: () => {
      hapticFeedback.notification?.("success");
      setStep("verify");
      setTimeLeft(600);
      
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: "Kod yuborilvdi",
        description: "SMS orqali kod yuborilvdi",
      });
    },
    onError: (error: any) => {
      hapticFeedback.notification?.("error");
      toast({
        title: "Xatolik",
        description: error?.message || "Kod yuborish xatosi",
        variant: "destructive",
      });
      console.error("Send OTP error:", error);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/verify-otp", {
        phoneNumber: phoneNumber.trim(),
        code: otpCode,
      });
      return res.json();
    },
    onSuccess: () => {
      hapticFeedback.notification?.("success");
      signupMutation.mutate();
    },
    onError: (error: any) => {
      hapticFeedback.notification?.("error");
      toast({
        title: "Xatolik",
        description: error?.message || "Kod tasdiqlash xatosi",
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async () => {
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

  const handlePhoneSubmit = (e: React.FormEvent) => {
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
    sendOtpMutation.mutate();
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode.trim() || otpCode.length !== 6) {
      toast({
        title: "Xato",
        description: "6 ta raqamli kod kiriting",
        variant: "destructive",
      });
      return;
    }

    hapticFeedback.selection?.();
    verifyOtpMutation.mutate();
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
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Ro'yxatdan o'tish</CardTitle>
          {step === "info" ? (
            <CardDescription>Ma'lumotingizni kiriting</CardDescription>
          ) : (
            <CardDescription>Telefon raqamingizni tasdiqlang</CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {step === "info" ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  Ismingiz *
                </label>
                <Input
                  id="firstName"
                  placeholder="Masalan: Muhammad"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={sendOtpMutation.isPending}
                  required
                  data-testid="input-firstname"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Familyangiz *
                </label>
                <Input
                  id="lastName"
                  placeholder="Masalan: Ahmadov"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={sendOtpMutation.isPending}
                  required
                  data-testid="input-lastname"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="text-sm font-medium">
                  Telefon raqami *
                </label>
                <Input
                  id="phoneNumber"
                  placeholder="+998 (XX) XXX-XX-XX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={sendOtpMutation.isPending}
                  type="tel"
                  required
                  data-testid="input-phone"
                />
                <p className="text-xs text-muted-foreground">
                  Buyurtma uchun telefon raqami kerak bo'ladi
                </p>
              </div>

              <Button
                type="submit"
                className="w-full mt-6 h-11 text-base"
                disabled={sendOtpMutation.isPending || !firstName.trim() || !lastName.trim() || !phoneNumber.trim()}
                size="lg"
                data-testid="button-send-otp"
              >
                {sendOtpMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Davom etish
                  </>
                )}
              </Button>

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
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900">
                  <strong>{phoneNumber}</strong> raqamiga SMS orqali kod yuborilvdi
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="otpCode" className="text-sm font-medium">
                  Tasdiqlash kodi *
                </label>
                <Input
                  id="otpCode"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={verifyOtpMutation.isPending}
                  type="tel"
                  maxLength={6}
                  required
                  className="text-center text-2xl tracking-widest font-bold"
                  data-testid="input-otp"
                  autoFocus
                />
              </div>

              {timeLeft > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Kod amaliyati: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </p>
              )}

              <Button
                type="submit"
                className="w-full mt-6 h-11 text-base"
                disabled={verifyOtpMutation.isPending || otpCode.length !== 6}
                size="lg"
                data-testid="button-verify-otp"
              >
                {verifyOtpMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Tasdiqlash oranmoqda...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Tasdiqlash
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => {
                  setStep("info");
                  setOtpCode("");
                }}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Orqaga qaytish
              </Button>

              {timeLeft === 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-xs"
                  onClick={() => sendOtpMutation.mutate()}
                  disabled={sendOtpMutation.isPending}
                  data-testid="button-resend-otp"
                >
                  Kod qayta yuborish
                </Button>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
