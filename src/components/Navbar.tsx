// src/components/Navbar.tsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Wallet, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import UserPreferencesModal from "@/components/UserPreferencesModal";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    navigate("/auth");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/expenses", label: "Expenses" },
    { href: "/budgets", label: "Budgets" },
    { href: "/subcategories", label: "Subcategories" },
    { href: "/payment-types", label: "Payment Types" },
    { href: "/reports", label: "Reports" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 transition-transform hover:scale-105"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SpendBuddy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive(link.href)
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop – Settings + Logout */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPreferencesOpen(true)}
                  className="h-8 w-8 p-0 rounded-md"
                  aria-label="Preferences"
                >
                  <Settings className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Login</Link>
                </Button>

                <Button
                  asChild
                  className="bg-gradient-primary shadow-glow hover:opacity-90"
                >
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden rounded-lg p-2 hover:bg-muted"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden animate-fade-in border-t border-border py-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors hover:bg-muted rounded-lg",
                    isActive(link.href)
                      ? "text-primary bg-muted"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated && (
                <div className="flex flex-col gap-2 px-4 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsPreferencesOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Preferences
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="w-full gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Preferences modal (works perfectly now) */}
      <UserPreferencesModal
        open={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
