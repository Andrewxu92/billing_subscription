import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentCancel() {
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('checkout_id') || params.get('intent_id');
    setCheckoutId(id);
  }, []);

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  const handleTryAgain = () => {
    window.location.href = '/#pricing';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-yellow-500 mx-auto" />
          </div>
          <CardTitle className="text-2xl text-yellow-700 dark:text-yellow-400">
            Payment Cancelled
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Your payment was cancelled. No charges have been made to your account.
            </p>
            {checkoutId && (
              <p className="text-sm text-muted-foreground">
                Checkout ID: {checkoutId}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Don't worry!</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• You can try subscribing again anytime</li>
              <li>• Your account remains active with free features</li>
              <li>• No charges were processed</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleTryAgain}
              className="bg-gradient-to-r from-primary to-secondary"
              data-testid="button-try-again"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleReturnHome}
              data-testid="button-return-home"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              If you need help, please contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}