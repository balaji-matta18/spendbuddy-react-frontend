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
  ArrowRight,
} from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(isAuthenticated ? "/dashboard" : "/auth");
  };

  const features = [
    { icon: TrendingUp, title: "Track Expenses", description: "Monitor every transaction with clarity" },
    { icon: PiggyBank, title: "Smart Budgets", description: "Set limits and manage budgets effortlessly" },
    { icon: BarChart3, title: "Detailed Reports", description: "Analyse trends with insightful charts" },
    { icon: Shield, title: "Secure & Private", description: "Your financial data stays encrypted and safe" },
    { icon: Smartphone, title: "Mobile Friendly", description: "Access SpendBuddy anywhere, anytime" },
    { icon: Zap, title: "Real-time Sync", description: "Instant updates across all devices" },
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
    <div className="relative min-h-screen bg-[#1a1a1a] text-white overflow-hidden">

      {/* GRID OVERLAY – EXACTLY your design */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "22px 22px",
          WebkitMaskImage: `
            radial-gradient(
              circle at center 40%,
              rgba(0,0,0,1) 0%,
              rgba(0,0,0,1) 30%,
              rgba(0,0,0,0.7) 55%,
              rgba(0,0,0,0.0) 85%
            )
          `,
          maskImage: `
            radial-gradient(
              circle at center 40%,
              rgba(0,0,0,1) 0%,
              rgba(0,0,0,1) 30%,
              rgba(0,0,0,0.7) 55%,
              rgba(0,0,0,0.0) 85%
            )
          `,
          opacity: 0.45,
          zIndex: 0,
        }}
      />

      <div className="relative z-10">
        <Navbar />

        {/* HERO SECTION – fully restored, no visual change */}
        {/* <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-24"> */}

        {/* HERO SECTION – fully restored, no visual change except mobile height fix */}
<section
  className="
    min-h-[100svh]     /* Mobile safe height */
    md:min-h-screen    /* Desktop original height */
    flex flex-col justify-center items-center text-center px-6 pt-24
  "
>

          <div className="w-full max-w-6xl mx-auto">

            {/* Desktop: NO WRAP. Mobile: wrap allowed. */}
            <h1 className="
              text-4xl sm:text-5xl md:text-6xl
              font-bold leading-[1.15] mb-6 text-center
              lg:whitespace-nowrap
            ">
              Track spends. Set Budgets. Stay in Control.
            </h1>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.15] mb-12 text-center">
              with <span className="text-[#539600]">SpendBuddy</span>
            </h2>

            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto mb-12">
              SpendBuddy helps you track expenses, manage budgets, and gain financial
              clarity with real-time insights.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <button
                onClick={handleGetStarted}
                className="px-8 py-5 rounded-full bg-white text-[#376400] font-semibold hover:bg-gray-100 transition flex items-center gap-2 shadow-lg"
              >
                Get Started Free <ArrowRight className="h-5 w-5" />
              </button>

              <button className="px-8 py-5 rounded-full border border-[#539600] text-[#539600] hover:bg-[#539600] hover:text-[#050608] transition">
                View Demo
              </button>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="bg-white text-[#050608] py-20 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">Powerful Features</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to manage your money smarter
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="p-8 rounded-3xl bg-gradient-to-br from-[#30391c] to-[#1a1a1a]
                             shadow-[0_18px_50px_rgba(0,0,0,0.6)] border border-[#3b4a28]"
                >
                  <div className="h-12 w-12 rounded-xl bg-[#539600] flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-[#1a1a1a]" />
                  </div>
                  <h3 className="text-[#539600] font-bold mb-2">{feature.title}</h3>
                  <p className="text-white">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="bg-[#3b4a28] py-20 sm:py-24 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                Why choose <span className="text-[#6ec800]">SpendBuddy?</span>
              </h2>

              <p className="text-lg text-gray-300 mb-8">
                Join thousands of users who are transforming their finances with our
                powerful budgeting tools.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#539600] shrink-0 mt-1" />
                    <span className="text-white font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-10 rounded-3xl bg-gradient-to-br from-[#30391c] to-[#1a1a1a]
                               text-white shadow-[0_18px_50px_rgba(0,0,0,0.6)] border border-[#3b4a28]">
              <div className="text-center">
                <div className="text-6xl font-bold text-[#539600] mb-2">₹0</div>
                <div className="text-xl mb-4">Forever Free</div>

                <p className="text-gray-200 mb-8">
                  No credit card required. Start taking control of your money today.
                </p>

                <Button size="lg" asChild className="w-full bg-white text-black hover:bg-white/90 rounded-full">
                  <Link to="/dashboard" className="flex items-center justify-center gap-2">
                    Start Your Journey
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-24 bg-[#1a1a1a]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-12 sm:p-16 rounded-3xl bg-gradient-to-br from-[#30391c] to-[#1a1a1a]
                               text-center shadow-[0_18px_50px_rgba(0,0,0,0.6)] border border-[#3b4a28]">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-[#539600]">
                Ready to transform your finances?
              </h2>

              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
                SpendBuddy makes budgeting simple, powerful, and stress-free.
              </p>

              <Button size="lg" asChild className="bg-white text-[#376400] hover:bg-white/90 rounded-full px-8 py-5">
                <Link to="/dashboard" className="flex items-center gap-2">
                  Get Started Now
                  <ArrowRight className="h-5 w-5 text-[#376400]" />
                </Link>
              </Button>
            </Card>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-[#161513] py-12 border-t border-[#141414]">
          <div className="text-center text-gray-400">
            <p>© 2024 SpendBuddy. All rights reserved.</p>
            <p className="text-sm mt-1">Made with ❤ for better financial wellness</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
