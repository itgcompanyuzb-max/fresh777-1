import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Customer, Message } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminChatPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [text, setText] = useState("");

  const { data: customers } = useQuery<Customer[]>({ queryKey: ["/api/admin/customers"] });

  const { data: messages } = useQuery<Message[]>({
    queryKey: selectedCustomer ? [`/api/admin/messages?customerId=${selectedCustomer}`] : ["/api/admin/messages"],
    enabled: !!selectedCustomer,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (payload: { customerId: number; text: string }) => {
      const res = await apiRequest("POST", "/api/admin/messages/send", payload);
      return res.json();
    },
    onSuccess: () => {
      setText("");
      if (selectedCustomer) {
        queryClient.invalidateQueries({ queryKey: [`/api/admin/messages?customerId=${selectedCustomer}`] });
      }
    }
  });

  const selectedCustomerObj = (customers && Array.isArray(customers) ? customers : []).find((c: any) => c.id === selectedCustomer);

  return (
    <div className="flex h-full gap-4">
      <aside className="w-64 border rounded p-2 overflow-auto">
        <h3 className="font-semibold mb-2">Mijozlar</h3>
        {(!customers || (Array.isArray(customers) && customers.length === 0)) && <div>Hech qanday mijoz yo'q</div>}
        <ul>
          {customers && Array.isArray(customers) && customers.map((c: any) => (
            <li key={c.id} className={`p-2 rounded cursor-pointer ${selectedCustomer === c.id ? 'bg-muted' : ''}`} onClick={() => setSelectedCustomer(c.id)}>
              <div className="font-medium">{c.firstName || c.username || ('#' + c.id)}</div>
              <div className="text-xs text-muted-foreground">{c.phoneNumber || c.address || ''}</div>
            </li>
          ))}
        </ul>
      </aside>
      <section className="flex-1 flex flex-col border rounded p-2">
        <div className="p-2 border-b mb-2">
          {selectedCustomerObj ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{selectedCustomerObj.firstName || selectedCustomerObj.username || ('#' + selectedCustomerObj.id)}</div>
                <div className="text-xs text-muted-foreground">Telegram ID: {selectedCustomerObj.telegramId} • {selectedCustomerObj.phoneNumber || '—'}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Mijoz tanlang</div>
          )}
        </div>
        <div className="flex-1 overflow-auto p-2">
          {!selectedCustomer && <div className="text-sm text-muted-foreground">Mijoz tanlang</div>}
          {messages && Array.isArray(messages) && messages.map((m: any) => (
            <div key={m.id} className={`mb-2 max-w-2xl ${m.sender === 'admin' ? 'ml-auto text-right' : ''}`}>
              <div className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</div>
              <div className={`p-2 rounded ${m.sender === 'admin' ? 'bg-primary text-primary-foreground inline-block' : 'bg-gray-100 inline-block'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <Input value={text} onChange={(e) => setText((e.target as HTMLInputElement).value)} placeholder="Xabar yuborish..." />
          <Button onClick={() => selectedCustomer && sendMutation.mutate({ customerId: selectedCustomer, text })} disabled={!selectedCustomer || !text || sendMutation.isPending}>
            Yuborish
          </Button>
        </div>
      </section>
    </div>
  );
}
