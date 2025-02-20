
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from 'react-icons/fc';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle authentication here
    console.log("Auth submitted:", { email, password, isLogin });
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 glass-card">
      <div className="flex flex-col items-center mb-8">
        <img
          src="/lovable-uploads/84d4060d-cfc0-4bc5-bf85-247ddb5bfce3.png"
          alt="Posst Logo"
          className="h-16 mb-4"
        />
        <h1 className="text-2xl font-bold mb-2">
          {isLogin ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-muted-foreground text-center">
          {isLogin
            ? "Enter your details to sign in"
            : "Sign up to start using Posst"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full gradient-button text-white">
          {isLogin ? "Sign in" : "Create account"}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => console.log("Google sign in")}
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          Sign in with Google
        </Button>

        <div className="text-center mt-6">
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </form>
    </Card>
  );
};
