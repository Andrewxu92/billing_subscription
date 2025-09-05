import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Editor from "@/pages/editor";
import PaymentSuccess from "@/pages/payment-success";
import PaymentFailed from "@/pages/payment-failed";
import AuthPage from "@/pages/auth-page";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      <Navbar />
      <Switch>
        {/* Auth routes - accessible when not authenticated */}
        <Route path="/auth" component={!isAuthenticated ? AuthPage : () => { window.location.href = '/'; return null; }} />
        
        {/* Main routes */}
        {isLoading ? (
          <Route path="/" component={() => <div className="min-h-screen flex items-center justify-center">Loading...</div>} />
        ) : !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/editor" component={Editor} />
          </>
        )}
        
        {/* Payment routes - always accessible */}
        <Route path="/payment-success" component={PaymentSuccess} />
        <Route path="/payment-failed" component={PaymentFailed} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
