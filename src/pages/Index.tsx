import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { 
  TrendingUp, 
  PiggyBank, 
  BarChart3, 
  Shield, 
  Smartphone, 
  Zap,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const features = [
    {
      icon: TrendingUp,
      title: "Track Expenses",
      description: "Monitor every transaction and understand your spending patterns",
    },
    {
      icon: PiggyBank,
      title: "Smart Budgets",
      description: "Set and manage budgets that adapt to your lifestyle",
    },
    {
      icon: BarChart3,
      title: "Detailed Reports",
      description: "Get insights with beautiful charts and analytics",
    },
    {
      icon: Shield,
      title: "Bank-level Security",
      description: "Your financial data is encrypted and protected",
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Access your finances anywhere, on any device",
    },
    {
      icon: Zap,
      title: "Real-time Sync",
      description: "Instant updates across all your devices",
    },
  ];

  const benefits = [
    "Track unlimited transactions",
    "Set custom budget categories",
    "Generate financial reports",
    "Secure cloud sync",
    "Multi-currency support",
    "Export data anytime",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-hero opacity-90" />
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Take Control of Your
              <br />
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Financial Future
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              SpendBuddy helps you track expenses, manage budgets, and achieve your financial goals with ease
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-large gap-2"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="hero"
                onClick={handleGetStarted}
                className="w-full sm:w-auto"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help you manage your money better
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="p-6 sm:p-8 hover:shadow-large transition-all duration-300 animate-scale-in bg-gradient-card border-border/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-soft mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
                Why Choose SpendBuddy?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of users who have transformed their financial lives with our intuitive budgeting platform
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={benefit}
                    className="flex items-start gap-3 animate-slide-in"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <CheckCircle2 className="h-6 w-6 text-success shrink-0 mt-0.5" />
                    <span className="text-foreground font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-8 sm:p-12 bg-gradient-primary shadow-large animate-scale-in">
              <div className="text-center text-white">
                <div className="text-5xl sm:text-6xl font-bold mb-2">$0</div>
                <div className="text-xl sm:text-2xl mb-4">Forever Free</div>
                <p className="text-white/90 mb-8">
                  No credit card required. Start managing your finances today.
                </p>
                <Button 
                  size="lg" 
                  asChild
                  className="w-full bg-white text-primary hover:bg-white/90"
                >
                  <Link to="/dashboard" className="flex items-center justify-center gap-2">
                    Start Your Journey
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 sm:p-16 bg-gradient-hero text-center animate-scale-in shadow-large">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Finances?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join SpendBuddy today and take the first step towards financial freedom
            </p>
            <Button 
              size="lg" 
              asChild
              className="bg-white text-primary hover:bg-white/90 shadow-large"
            >
              <Link to="/dashboard" className="flex items-center gap-2">
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">© 2024 SpendBuddy. All rights reserved.</p>
            <p className="text-sm">Made with ❤️ for better financial wellness</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
