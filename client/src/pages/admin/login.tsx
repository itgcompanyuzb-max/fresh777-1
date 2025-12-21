import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, User, Loader2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  username: z.string().min(1, "Foydalanuvchi nomini kiriting"),
  password: z.string().min(1, "Parolni kiriting"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      return apiRequest("POST", "/api/admin/login", data);
    },
    onSuccess: (data: any) => {
      localStorage.setItem("adminToken", data.token);
      navigate("/admin");
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Login yoki parol noto'g'ri",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Panel</CardTitle>
          <CardDescription>Do'kon boshqaruv paneli</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foydalanuvchi nomi</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="admin"
                          className="pl-10 h-11"
                          {...field}
                          data-testid="input-username"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parol</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="********"
                          className="pl-10 h-11"
                          {...field}
                          data-testid="input-password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kirish...
                  </>
                ) : (
                  "Kirish"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Demo ma'lumotlari */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Store className="h-4 w-4" />
            Demo ma'lumotlari
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-700 dark:text-amber-300">
          <p className="mb-2">Test uchun quyidagi ma'lumotlarni kiriting:</p>
          <div className="space-y-1 font-mono">
            <p><strong>Username:</strong> admin</p>
            <p><strong>Parol:</strong> admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
