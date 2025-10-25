import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Download } from "lucide-react";
import { useState, useEffect } from "react";

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Smartphone className="h-12 w-12 text-primary" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">Install RAIT Confession</h1>
            <p className="text-muted-foreground">
              Get the full app experience! Install RAIT Confession on your device for quick access and offline support.
            </p>
          </div>

          {isInstallable ? (
            <Button 
              onClick={handleInstall} 
              size="lg" 
              className="w-full"
            >
              <Download className="mr-2 h-5 w-5" />
              Install App
            </Button>
          ) : (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-semibold">How to install:</p>
              <ul className="text-left space-y-2">
                <li>• <strong>iPhone/iPad:</strong> Tap Share → Add to Home Screen</li>
                <li>• <strong>Android:</strong> Tap Menu (⋮) → Install App or Add to Home Screen</li>
                <li>• <strong>Desktop:</strong> Look for the install icon in your browser's address bar</li>
              </ul>
            </div>
          )}

          <Button variant="outline" asChild className="w-full">
            <a href="/">Continue to Website</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
