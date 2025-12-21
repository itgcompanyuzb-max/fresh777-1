import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTelegram } from '@/lib/telegram';
import { useToast } from '@/hooks/use-toast';
import { useCustomerAuth } from '@/hooks/use-customer-auth';
import { CustomerHeader } from '@/components/customer-header';
import { Send } from 'lucide-react';

export default function ChatPage() {
  const { customer, isLoading: authLoading } = useCustomerAuth();
  const [text, setText] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const { hapticFeedback } = useTelegram();
  const { toast } = useToast();

  // Auto-fill from customer data if registered
  useEffect(() => {
    if (customer && customer.phoneNumber) {
      setPhone(customer.phoneNumber);
      if (customer.firstName) {
        setName(`${customer.firstName} ${customer.lastName || ''}`.trim());
      }
    }
  }, [customer]);

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest('POST', '/api/messages', payload);
      return res;
    },
    onSuccess: () => {
      hapticFeedback.notification?.('success');
      toast({
        title: "Yuborildi",
        description: "Savolingiz adminga yetkazildi",
      });
      setText('');
      setName('');
      setPhone('');
    },
    onError: () => {
      hapticFeedback.notification?.('error');
      toast({
        title: "Xatolik",
        description: "Savolingizni yuborib bo'lmadi",
        variant: "destructive",
      });
    }
  });

  const handleSend = () => {
    if (!text.trim()) {
      toast({
        title: "Xato",
        description: "Savolingizni yozing",
        variant: "destructive",
      });
      return;
    }

    // Require name and phone if not registered
    if (!customer || !customer.phoneNumber) {
      if (!name.trim()) {
        toast({
          title: "Xato",
          description: "Ismingizni kiriting",
          variant: "destructive",
        });
        return;
      }

      if (!phone.trim()) {
        toast({
          title: "Xato",
          description: "Telefon raqamingizni kiriting",
          variant: "destructive",
        });
        return;
      }

      if (phone.trim().length < 9) {
        toast({
          title: "Xato",
          description: "Telefon raqami noto'g'ri",
          variant: "destructive",
        });
        return;
      }
    }

    mutation.mutate({ text, phoneNumber: phone, name });
  };

  const isRegistered = customer && customer.phoneNumber;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CustomerHeader title="Admin bilan chat" />

      <main className="flex-1 flex flex-col px-4 py-4 pb-20">
        <p className="text-sm text-muted-foreground mb-6">
          Savolingizni yozing — adminga Telegram orqali ham yetkaziladi va u javob beradi.
        </p>

        <Card className="p-4">
          <div className="space-y-3">
            {!isRegistered && (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">Ismingiz *</label>
                  <Input 
                    placeholder="Ismingiz" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    disabled={mutation.isPending}
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Telefon raqam *</label>
                  <Input 
                    placeholder="+998 (XX) XXX-XX-XX" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={mutation.isPending}
                    required
                  />
                </div>
              </>
            )}

            {isRegistered && (
              <>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <p className="text-muted-foreground"><strong>Ism:</strong> {name}</p>
                  <p className="text-muted-foreground"><strong>Telefon:</strong> {phone}</p>
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium mb-1 block">Savolingiz</label>
              <textarea 
                placeholder="Savolingizni shu yerga yozing..."
                value={text} 
                onChange={(e) => setText(e.target.value)}
                disabled={mutation.isPending}
                className="w-full p-3 border rounded-lg min-h-[120px] bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <Button 
              onClick={handleSend}
              disabled={!text.trim() || mutation.isPending}
              className="w-full"
              size="lg"
            >
              <Send className="h-4 w-4 mr-2" />
              Yuborish
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
