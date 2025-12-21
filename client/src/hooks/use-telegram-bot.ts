import { useTelegram } from "@/lib/telegram";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface BotInfo {
  isConfigured: boolean;
  botInfo: {
    id: number;
    username: string;
    first_name: string;
    is_bot: boolean;
  };
}

interface NotificationRequest {
  chatId: number;
  message: string;
  type?: 'text' | 'photo';
  photo?: string;
}

interface OrderNotificationRequest {
  chatId: number;
  orderId: string;
  status: string;
}

export function useTelegramBot() {
  const { user, isInTelegram } = useTelegram();
  const queryClient = useQueryClient();

  // Bot ma'lumotlarini olish
  const { data: botInfo, isLoading: isBotInfoLoading } = useQuery<BotInfo>({
    queryKey: ['/api/telegram/bot-info'],
    queryFn: async () => {
      const response = await fetch('/api/telegram/bot-info');
      if (!response.ok) {
        throw new Error('Failed to fetch bot info');
      }
      return response.json();
    },
  });

  // Bildirishnoma yuborish
  const sendNotification = useMutation({
    mutationFn: async (request: NotificationRequest) => {
      const response = await fetch('/api/telegram/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/telegram'] });
    },
  });

  // Buyurtma bildirishnomasini yuborish
  const sendOrderNotification = useMutation({
    mutationFn: async (request: OrderNotificationRequest) => {
      const response = await fetch('/api/telegram/order-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to send order notification');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/telegram'] });
    },
  });

  // Webhook o'rnatish
  const setWebhook = useMutation({
    mutationFn: async (webhookUrl: string) => {
      const response = await fetch('/api/telegram/set-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to set webhook');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/telegram/bot-info'] });
    },
  });

  // Webhook o'chirish
  const removeWebhook = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/telegram/webhook', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove webhook');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/telegram/bot-info'] });
    },
  });

  // Telegram foydalanuvchi ma'lumotlari
  const telegramUser = isInTelegram && user ? {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    languageCode: user.language_code,
    photoUrl: user.photo_url,
  } : null;

  // Buyurtma bildirishnomasini yuborish (helper function)
  const notifyOrderStatus = (orderId: string, status: string) => {
    if (telegramUser) {
      return sendOrderNotification.mutateAsync({
        chatId: telegramUser.id,
        orderId,
        status,
      });
    }
    return Promise.resolve();
  };

  // Oddiy bildirishnoma yuborish (helper function)
  const notify = (message: string, type: 'text' | 'photo' = 'text', photo?: string) => {
    if (telegramUser) {
      return sendNotification.mutateAsync({
        chatId: telegramUser.id,
        message,
        type,
        photo,
      });
    }
    return Promise.resolve();
  };

  return {
    // Bot ma'lumotlari
    botInfo,
    isBotInfoLoading,
    isBotConfigured: botInfo?.isConfigured || false,

    // Telegram foydalanuvchi ma'lumotlari
    telegramUser,
    isInTelegram,

    // Mutations
    sendNotification,
    sendOrderNotification,
    setWebhook,
    removeWebhook,

    // Helper functions
    notifyOrderStatus,
    notify,

    // Loading states
    isSendingNotification: sendNotification.isPending,
    isSendingOrderNotification: sendOrderNotification.isPending,
    isSettingWebhook: setWebhook.isPending,
    isRemovingWebhook: removeWebhook.isPending,
  };
}