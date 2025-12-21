import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Users, Clock, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Broadcast } from "@shared/schema";

export default function BroadcastsPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const { data: broadcasts, isLoading } = useQuery<Broadcast[]>({
    queryKey: ["/api/admin/broadcasts"],
  });

  const { data: stats } = useQuery<{ totalCustomers: number }>({
    queryKey: ["/api/admin/stats/customers"],
  });

  const sendBroadcast = useMutation({
    mutationFn: async (data: { title: string; message: string }) => {
      const res = await apiRequest("POST", "/api/admin/broadcasts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/broadcasts"] });
      setTitle("");
      setMessage("");
      toast({
        title: "Xabar yuborildi",
        description: "Barcha mijozlarga xabar muvaffaqiyatli yuborildi",
      });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Xabar yuborishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Xatolik",
        description: "Sarlavha va xabar matnini kiriting",
        variant: "destructive",
      });
      return;
    }
    sendBroadcast.mutate({ title, message });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Xabarlar</h1>
        <p className="text-muted-foreground">Barcha mijozlarga xabar yuborish</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Yangi xabar
            </CardTitle>
            <CardDescription>
              Xabar barcha {stats?.totalCustomers || 0} ta mijozga yuboriladi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Sarlavha</Label>
              <Input
                id="title"
                placeholder="Xabar sarlavhasi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-broadcast-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Xabar matni</Label>
              <Textarea
                id="message"
                placeholder="Xabar matnini yozing..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-32"
                data-testid="input-broadcast-message"
              />
            </div>

            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ko'rinishi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{title || "Sarlavha"}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {message || "Xabar matni..."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSend}
              disabled={sendBroadcast.isPending || !title.trim() || !message.trim()}
              className="w-full"
              data-testid="button-send-broadcast"
            >
              {sendBroadcast.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Xabar yuborish
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Yuborilgan xabarlar
            </CardTitle>
            <CardDescription>
              Avval yuborilgan xabarlar tarixi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2 pb-4 border-b last:border-0">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : broadcasts && broadcasts.length > 0 ? (
                <div className="space-y-4">
                  {broadcasts.map((broadcast) => (
                    <div
                      key={broadcast.id}
                      className="pb-4 border-b last:border-0 space-y-2"
                      data-testid={`broadcast-item-${broadcast.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm">{broadcast.title}</h4>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          <Users className="h-3 w-3 mr-1" />
                          {broadcast.recipientCount}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {broadcast.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(broadcast.sentAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Hali xabar yuborilmagan
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
