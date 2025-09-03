import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, Home, RefreshCw, MessageCircle, CreditCard } from "lucide-react";

export default function PaymentFailed() {
  const [isRetrying, setIsRetrying] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const intentId = urlParams.get('intent_id');
  const error = urlParams.get('error') || 'Payment failed';

  const handleRetryPayment = async () => {
    setIsRetrying(true);
    // Redirect back to pricing page
    setTimeout(() => {
      window.location.href = "/#pricing";
    }, 1000);
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support chat or email
    window.open('mailto:support@photopro.com?subject=Payment Issue&body=Payment failed for intent ID: ' + intentId);
  };

  const commonIssues = [
    {
      issue: "Insufficient funds",
      solution: "Check your account balance or try a different payment method"
    },
    {
      issue: "Card declined",
      solution: "Contact your bank or try a different card"
    },
    {
      issue: "Expired card",
      solution: "Update your card information and try again"
    },
    {
      issue: "Network timeout",
      solution: "Check your internet connection and retry the payment"
    }
  ];

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
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment Failed</h1>
          <p className="text-xl text-muted-foreground">
            We were unable to process your payment. Please try again or use a different payment method.
          </p>
        </div>

        {/* Error Details */}
        <Alert className="mb-8" data-testid="alert-error">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error}
            {intentId && (
              <>
                <br />
                <span className="text-xs text-muted-foreground">
                  Reference ID: {intentId}
                </span>
              </>
            )}
          </AlertDescription>
        </Alert>

        {/* Troubleshooting */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Common Issues & Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commonIssues.map((item, index) => (
                <div key={index} className="border-l-2 border-primary pl-4" data-testid={`issue-${index}`}>
                  <h4 className="font-medium text-foreground">{item.issue}</h4>
                  <p className="text-sm text-muted-foreground">{item.solution}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What You Can Do</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-foreground text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Check Your Payment Method</h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure your card details are correct and you have sufficient funds.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-foreground text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Try Again</h4>
                  <p className="text-sm text-muted-foreground">
                    Return to the pricing page and attempt the payment again.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-foreground text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Contact Support</h4>
                  <p className="text-sm text-muted-foreground">
                    If the problem persists, our support team is here to help.
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
            onClick={handleRetryPayment}
            disabled={isRetrying}
            data-testid="button-retry-payment"
          >
            {isRetrying ? (
              <div className="animate-spin mr-2 h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
            ) : (
              <RefreshCw className="mr-2 h-5 w-5" />
            )}
            {isRetrying ? 'Redirecting...' : 'Try Again'}
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleContactSupport}
            data-testid="button-contact-support"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Contact Support
          </Button>
        </div>

        {/* Alternative Options */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-medium text-foreground mb-2">Alternative Options</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Try using a different credit or debit card</p>
            <p>• Use PayPal or another payment method if available</p>
            <p>• Contact your bank to ensure international payments are enabled</p>
            <p>• Check if your card supports online transactions</p>
          </div>
        </div>

        {/* Continue with Free Plan */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground mb-4">
            Or continue using PhotoPro with our free plan while you resolve the payment issue.
          </p>
          <Button 
            variant="ghost"
            onClick={handleGoHome}
            data-testid="button-continue-free"
          >
            Continue with Free Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
