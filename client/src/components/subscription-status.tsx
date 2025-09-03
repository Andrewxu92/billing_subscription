import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Crown, 
  Calendar, 
  Zap, 
  TrendingUp,
  CreditCard,
  Settings
} from "lucide-react";

export function SubscriptionStatus() {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: userInfo, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
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
      toast({
        title: "Redirecting to Payment",
        description: "You'll be redirected to our secure payment page...",
      });
      
      // Simulate Airwallex redirect for demo
      setTimeout(() => {
        window.location.href = `/payment-success?intent_id=${data.payment_intent.id}`;
      }, 2000);
    },
    onError: (error) => {
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
        title: "Error",
        description: error.message || "Failed to initiate upgrade",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="grid md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const subscription = userInfo?.subscription;
  const plan = subscription?.plan;
  const aiUsageThisMonth = userInfo?.aiUsageThisMonth || 0;
  
  const planName = plan?.name || 'Free';
  const isFreePlan = planName === 'Free';
  const isPro = planName === 'Pro';
  const isEnterprise = planName === 'Enterprise';
  
  const aiCreditLimit = plan?.aiCreditsPerMonth || 5; // Free plan gets 5 credits
  const hasUnlimitedCredits = plan?.aiCreditsPerMonth === null;
  const usagePercentage = hasUnlimitedCredits ? 0 : Math.min((aiUsageThisMonth / aiCreditLimit) * 100, 100);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysRemaining = () => {
    if (!subscription?.currentPeriodEnd) return 0;
    const endDate = new Date(subscription.currentPeriodEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleUpgrade = async () => {
    if (isFreePlan) {
      // Get Pro plan and create payment intent
      const response = await fetch('/api/subscription-plans');
      const plans = await response.json();
      const proPlan = plans.find((p: any) => p.name === 'Pro');
      
      if (proPlan) {
        await createPaymentMutation.mutateAsync({ 
          planId: proPlan.id, 
          billingCycle: 'monthly' 
        });
      }
    } else {
      // Navigate to pricing page for plan changes
      window.location.href = '/#pricing';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Crown className="mr-2 h-5 w-5 text-primary" />
            Subscription Status
          </CardTitle>
          <Badge 
            className={getStatusColor(subscription?.status || 'free')}
            data-testid="badge-plan-status"
          >
            {planName}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-background rounded-lg" data-testid="stat-ai-credits">
            <div className="text-2xl font-bold text-foreground">
              {hasUnlimitedCredits ? '∞' : `${aiUsageThisMonth}/${aiCreditLimit}`}
            </div>
            <div className="text-sm text-muted-foreground">
              AI Credits {hasUnlimitedCredits ? 'Used' : 'This Month'}
            </div>
            {!hasUnlimitedCredits && (
              <Progress value={usagePercentage} className="mt-2 h-2" />
            )}
          </div>
          
          <div className="text-center p-4 bg-background rounded-lg" data-testid="stat-projects">
            <div className="text-2xl font-bold text-foreground">
              <TrendingUp className="h-6 w-6 mx-auto mb-1" />
            </div>
            <div className="text-sm text-muted-foreground">Projects Created</div>
          </div>
          
          <div className="text-center p-4 bg-background rounded-lg" data-testid="stat-days-remaining">
            <div className="text-2xl font-bold text-foreground">
              {subscription?.billingCycle === 'lifetime' ? '∞' : 
               isFreePlan ? '∞' : getDaysRemaining()}
            </div>
            <div className="text-sm text-muted-foreground">
              {subscription?.billingCycle === 'lifetime' ? 'Lifetime Access' :
               isFreePlan ? 'Free Forever' : 'Days Remaining'}
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        {subscription && !isFreePlan && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Plan</span>
              <Badge variant={isPro ? "default" : "secondary"}>
                {planName}
              </Badge>
            </div>
            
            {subscription.currentPeriodEnd && subscription.billingCycle !== 'lifetime' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Renewal Date</span>
                <span className="font-medium" data-testid="text-renewal-date">
                  {formatDate(subscription.currentPeriodEnd)}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Billing Cycle</span>
              <span className="font-medium capitalize" data-testid="text-billing-cycle">
                {subscription.billingCycle}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={subscription.status === 'active' ? "default" : "secondary"}>
                {subscription.status}
              </Badge>
            </div>
          </div>
        )}

        {/* Usage Warning for Free Plan */}
        {isFreePlan && aiUsageThisMonth >= aiCreditLimit * 0.8 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  AI Credit Limit Almost Reached
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  You've used {aiUsageThisMonth} of {aiCreditLimit} monthly AI credits. 
                  Upgrade to Pro for unlimited access.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {isFreePlan ? (
            <Button 
              className="bg-gradient-to-r from-primary to-secondary flex-1"
              onClick={handleUpgrade}
              disabled={createPaymentMutation.isPending}
              data-testid="button-upgrade-plan"
            >
              {createPaymentMutation.isPending ? (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              ) : (
                <Crown className="mr-2 h-4 w-4" />
              )}
              {createPaymentMutation.isPending ? 'Processing...' : 'Upgrade to Pro'}
            </Button>
          ) : (
            <>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => window.location.href = '/#pricing'}
                data-testid="button-change-plan"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Change Plan
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/#pricing'}
                data-testid="button-manage-billing"
              >
                <Settings className="mr-2 h-4 w-4" />
                Manage Billing
              </Button>
            </>
          )}
        </div>

        {/* Feature List for Current Plan */}
        {plan?.features && (
          <div className="pt-4 border-t border-border">
            <h4 className="font-medium text-foreground mb-3">Your Plan Includes:</h4>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              {plan.features.slice(0, 4).map((feature: string, index: number) => (
                <div key={index} className="flex items-center text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
