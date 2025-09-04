import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Camera, Menu, X } from "lucide-react";
import { Link } from "wouter";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logoutMutation } = useAuth();

  const navigation = [
    { name: "Editor", href: "/editor" },
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Templates", href: "#templates" },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = href;
    }
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    window.location.href = '/auth';
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">PhotoPro</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 ml-10">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-muted-foreground" data-testid="nav-username">
                  {user?.firstName || user?.username || "User"}
                </span>
                <Button 
                  variant="ghost"
                  onClick={handleLogout}
                  data-testid="nav-logout"
                >
                  Logout
                </Button>
                <Button 
                  className="bg-gradient-to-r from-primary to-secondary"
                  onClick={() => window.location.href = '/'}
                  data-testid="nav-dashboard"
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost"
                  onClick={handleLogin}
                  data-testid="nav-login"
                >
                  Log in
                </Button>
                <Button 
                  className="bg-gradient-to-r from-primary to-secondary"
                  onClick={handleLogin}
                  data-testid="nav-signup"
                >
                  Sign up
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="nav-mobile-toggle"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t border-border">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  data-testid={`nav-mobile-${item.name.toLowerCase()}`}
                >
                  {item.name}
                </button>
              ))}
              
              <div className="pt-4 border-t border-border space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      {user?.firstName || user?.username || "User"}
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={handleLogout}
                      data-testid="nav-mobile-logout"
                    >
                      Logout
                    </Button>
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-secondary"
                      onClick={() => window.location.href = '/'}
                      data-testid="nav-mobile-dashboard"
                    >
                      Dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={handleLogin}
                      data-testid="nav-mobile-login"
                    >
                      Log in
                    </Button>
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-secondary"
                      onClick={handleLogin}
                      data-testid="nav-mobile-signup"
                    >
                      Sign up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
