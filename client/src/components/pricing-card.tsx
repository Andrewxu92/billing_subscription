import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Check } from "lucide-react";
import type { SubscriptionPlan } from "@shared/schema";

interface PricingCardProps {
  billingPeriod: 'monthly' | 'yearly';
}

export function PricingCard({ billingPeriod }: PricingCardProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  const { data: plans = [], isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const createPaymentMutation = useMutation({
    mutationFn: async ({ planId, billingCycle }: { planId: string; billingCycle: string }) => {
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        planId,
        billingCycle,
      });
      return response.json();
    },
    onSuccess: async (data) => {
      setPaymentLoading(null);
      
      toast({
        title: "Redirecting to Payment",
        description: "You'll be redirected to Airwallex secure checkout...",
      });
      
      // Redirect to Airwallex billing checkout page
      window.location.href = data.checkout_url;
    },
    onError: (error) => {
      setPaymentLoading(null);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Payment Error",
        description: error.message || "Failed to create payment intent",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = async (planId: string, billingCycle: string) => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }

    setPaymentLoading(planId + billingCycle);
    await createPaymentMutation.mutateAsync({ planId, billingCycle });
  };

  const handleLifetimePurchase = async (planId: string) => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }

    setPaymentLoading(planId + 'lifetime');
    await createPaymentMutation.mutateAsync({ planId, billingCycle: 'lifetime' });
  };

  const getPrice = (plan: SubscriptionPlan, cycle: 'monthly' | 'yearly') => {
    if (cycle === 'monthly') {
      return parseFloat(plan.monthlyPrice || '0');
    }
    return parseFloat(plan.yearlyPrice || '0');
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-8">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-3 bg-muted rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Plans */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan: SubscriptionPlan, index: number) => {
          const price = getPrice(plan, billingPeriod);
          const isPopular = plan.name === 'Pro';
          const isFree = plan.name === 'Free';
          const loadingKey = plan.id + billingPeriod;
          const isLoading = paymentLoading === loadingKey;

          return (
            <Card 
              key={plan.id} 
              className={`relative ${isPopular ? 'border-2 border-primary shadow-xl scale-105' : 'border hover:shadow-lg'} transition-all`}
              data-testid={`pricing-card-${plan.name.toLowerCase()}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="text-4xl font-bold text-foreground mb-2">
                  {formatPrice(price)}
                  {!isFree && (
                    <span className="text-lg text-muted-foreground font-normal">
                      /{billingPeriod === 'monthly' ? 'month' : 'year'}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {isFree ? 'Perfect for getting started' : 
                   plan.name === 'Pro' ? 'For serious photographers' : 
                   'For teams and businesses'}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {(plan.features as string[]).map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-center text-muted-foreground">
                      <Check className="h-4 w-4 text-accent mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full ${
                    isPopular 
                      ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90' 
                      : isFree 
                        ? 'border border-border hover:bg-muted' 
                        : 'border border-border hover:bg-muted'
                  } transition-all transform hover:scale-105`}
                  variant={isPopular ? 'default' : 'outline'}
                  disabled={isLoading}
                  onClick={() => isFree ? window.location.href = '/api/login' : handleSubscribe(plan.id, billingPeriod)}
                  data-testid={`button-subscribe-${plan.name.toLowerCase()}`}
                >
                  {isLoading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  ) : null}
                  {isFree ? 'Get Started Free' : 
                   isLoading ? 'Processing...' : 
                   `Subscribe to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lifetime Option */}
      {plans.find((p: SubscriptionPlan) => p.lifetimePrice) && (
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-accent">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                  Best Value
                </Badge>
              </div>
              <CardTitle className="text-xl font-semibold">One-Time Purchase</CardTitle>
              <div className="text-2xl font-bold text-foreground mb-2">
                $99
              </div>
              <p className="text-muted-foreground">Lifetime access to Pro features</p>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-gradient-to-r from-accent to-secondary hover:opacity-90 transition-opacity"
                disabled={paymentLoading === 'lifetime'}
                onClick={() => {
                  const proPlan = plans.find((p: SubscriptionPlan) => p.name === 'Pro');
                  if (proPlan) {
                    handleLifetimePurchase(proPlan.id);
                  }
                }}
                data-testid="button-lifetime-purchase"
              >
                {paymentLoading === 'lifetime' ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Processing...
                  </>
                ) : (
                  'Buy Lifetime Access'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
