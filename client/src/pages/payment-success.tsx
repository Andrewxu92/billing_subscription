import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Home, CreditCard, Calendar } from "lucide-react";
import type { PaymentTransaction } from "@shared/schema";

interface PaymentResponse {
  success: boolean;
  transaction: PaymentTransaction;
  message: string;
}

export default function PaymentSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const intentId = urlParams.get('intent_id');

  const { data: paymentInfo, isLoading } = useQuery<PaymentResponse>({
    queryKey: ["/api/payment-success", { intent_id: intentId }],
    enabled: !!intentId,
  });

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleManageSubscription = () => {
    window.location.href = "/#pricing";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  const formatBillingCycle = (cycle: string) => {
    switch (cycle) {
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      case 'lifetime':
        return 'Lifetime';
      default:
        return cycle;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 text-primary">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L3 7V17C3 18.1 3.9 19 5 19H19C20.1 19 21 18.1 21 17V7L12 2Z"/>
                </svg>
              </div>
              <span className="text-xl font-bold">PhotoPro</span>
            </div>
            <Button 
              variant="outline" 
              onClick={handleGoHome}
              data-testid="button-home-header"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-xl text-muted-foreground">
            Thank you for upgrading to PhotoPro. Your subscription is now active.
          </p>
        </div>

        {paymentInfo?.transaction && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount Paid</label>
                  <div className="text-2xl font-bold text-foreground" data-testid="text-amount">
                    {formatCurrency(paymentInfo.transaction.amount)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Billing Cycle</label>
                  <div className="flex items-center mt-1">
                    <Badge variant="secondary" data-testid="badge-billing-cycle">
                      {formatBillingCycle(paymentInfo.transaction.billingCycle)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-xs" data-testid="text-transaction-id">
                    {paymentInfo.transaction.airwallexPaymentIntentId}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="default" data-testid="badge-status">
                    {paymentInfo.transaction.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-foreground text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Access Your Dashboard</h4>
                  <p className="text-sm text-muted-foreground">
                    Visit your dashboard to see your new subscription status and available features.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-foreground text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Start Creating</h4>
                  <p className="text-sm text-muted-foreground">
                    Begin using unlimited AI tools and advanced editing features right away.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-foreground text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Explore Premium Features</h4>
                  <p className="text-sm text-muted-foreground">
                    Try batch processing, premium templates, and 4K downloads.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary"
            onClick={handleGoHome}
            data-testid="button-go-dashboard"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Dashboard
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleManageSubscription}
            data-testid="button-manage-subscription"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Manage Subscription
          </Button>
        </div>

        {/* Receipt Notice */}
        <div className="mt-8 p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            A receipt has been sent to your email address. You can also view all your transactions in your account dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
