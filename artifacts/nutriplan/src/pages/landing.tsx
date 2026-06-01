import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Apple, Activity, Target, Zap, CalendarDays } from "lucide-react";
import { generate_image_tool } from "@workspace/api-client-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-6 py-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <Apple className="w-6 h-6" />
          <span>NutriPlan</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link href="/register">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-5xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              Fuel your day,<br/>
              <span className="text-primary">without the fuss.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto md:mx-0">
              NutriPlan is the smart meal planner for busy people. Log your meals, hit your macros, and feel your best.
            </p>
            <div className="flex justify-center md:justify-start">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-base">Get Started for Free</Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
             <div className="w-full max-w-md aspect-square rounded-2xl bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-primary/40 font-medium overflow-hidden relative shadow-xl">
                {/* Visual placeholder for hero image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
                <div className="p-8 bg-card rounded-xl shadow-lg transform rotate-3 absolute z-10 w-3/4">
                  <div className="h-4 w-1/3 bg-muted rounded mb-4"></div>
                  <div className="h-8 w-full bg-primary/20 rounded mb-2"></div>
                  <div className="h-8 w-5/6 bg-primary/20 rounded mb-2"></div>
                  <div className="h-8 w-4/6 bg-primary/20 rounded"></div>
                </div>
             </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full bg-muted/30 py-24">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Everything you need to succeed</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-card rounded-2xl border shadow-sm flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold">Track Macros</h3>
                <p className="text-muted-foreground text-sm">Log your food and see your protein, carbs, and fat instantly.</p>
              </div>
              <div className="p-6 bg-card rounded-2xl border shadow-sm flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold">Plan Ahead</h3>
                <p className="text-muted-foreground text-sm">Create weekly meal plans and generate shopping lists automatically.</p>
              </div>
              <div className="p-6 bg-card rounded-2xl border shadow-sm flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold">Hit Goals</h3>
                <p className="text-muted-foreground text-sm">Set custom calorie and macro goals tailored to your lifestyle.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="w-full max-w-3xl mx-auto px-6 py-24 text-center space-y-6">
          <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Ready to take control?</h2>
          <p className="text-muted-foreground">Join thousands of students and busy professionals hitting their goals every day.</p>
          <div className="pt-4">
            <Link href="/register">
              <Button size="lg">Start Your Journey</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <p>© 2024 NutriPlan. All rights reserved.</p>
      </footer>
    </div>
  );
}
