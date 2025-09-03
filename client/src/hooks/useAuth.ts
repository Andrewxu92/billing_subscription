import { useQuery } from "@tanstack/react-query";
import type { User, UserSubscription, SubscriptionPlan } from "@shared/schema";

interface UserWithSubscription extends User {
  subscription?: UserSubscription & { plan: SubscriptionPlan };
  aiUsageThisMonth?: number;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<UserWithSubscription>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
