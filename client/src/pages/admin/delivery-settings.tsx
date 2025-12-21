import { useState, useEffect } from "react";
import { Truck, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface DeliverySettings {
  standardDeliveryFee: number;
  expressDeliveryFee: number;
  freeDeliveryThreshold: number;
}

export default function DeliverySettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<DeliverySettings>({
    standardDeliveryFee: 15000,
    expressDeliveryFee: 25000,
    freeDeliveryThreshold: 200000,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/delivery-settings");
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (key: keyof DeliverySettings, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSettings(prev => ({
      ...prev,
      [key]: numValue,
    }));
    setIsChanged(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/admin/delivery-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Saqlash amalga oshmadi");
      }

      setIsChanged(false);
      toast({
        title: "Muvaffaqiyatli",
        description: "Dastavka sozlamalari saqlandi",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Xatolik",
        description: "Saqlash amalga oshmadi",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Truck className="h-8 w-8" />
          Dastavka Sozlamalari
        </h1>
        <p className="text-muted-foreground mt-1">Dastavka narxlari va shartlarini o'zgartiring</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 max-w-2xl">
          {/* Standard Delivery */}
          <Card>
            <CardHeader>
              <CardTitle>Oddiy Dastavka</CardTitle>
              <CardDescription>Standart dastavka xizmati narxi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="standard">Narxi (so'm)</Label>
                <Input
                  id="standard"
                  type="number"
                  value={settings.standardDeliveryFee}
                  onChange={(e) => handleChange("standardDeliveryFee", e.target.value)}
                  placeholder="15000"
                  className="text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Express Delivery */}
          <Card>
            <CardHeader>
              <CardTitle>Tezkor Dastavka</CardTitle>
              <CardDescription>Shoshilinch dastavka xizmati narxi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="express">Narxi (so'm)</Label>
                <Input
                  id="express"
                  type="number"
                  value={settings.expressDeliveryFee}
                  onChange={(e) => handleChange("expressDeliveryFee", e.target.value)}
                  placeholder="25000"
                  className="text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Free Delivery Threshold */}
          <Card>
            <CardHeader>
              <CardTitle>Bepul Dastavka</CardTitle>
              <CardDescription>Bu miqdordan ortiq buyurtmalarda dastavka bepul bo'ladi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="threshold">Minimalʻ Summa (so'm)</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={settings.freeDeliveryThreshold}
                  onChange={(e) => handleChange("freeDeliveryThreshold", e.target.value)}
                  placeholder="200000"
                  className="text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!isChanged || isSaving}
            size="lg"
            className="w-full h-11"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saqlanmoqda...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Saqlash
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
