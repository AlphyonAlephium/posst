
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from 'react-icons/fc';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isCompanyAccount, setIsCompanyAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login flow
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });

        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          navigate("/");
        }
      } else {
        // Registration flow
        const metadata = isCompanyAccount 
          ? { company_name: companyName, is_company: true } 
          : { is_company: false };
          
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: metadata
          }
        });

        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
        } else {
          if (data.user?.identities?.length === 0) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "An account with this email already exists.",
            });
          } else {
            toast({
              title: "Success!",
              description: "Please check your email to confirm your account.",
            });
          }
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 glass-card">
      <div className="flex flex-col items-center mb-8">
        <img
          src="/lovable-uploads/25d6ab78-31af-482a-a80c-f87edbe32e96.png"
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

      {!isLogin && (
        <Tabs defaultValue="individual" className="mb-6" onValueChange={(value) => setIsCompanyAccount(value === "company")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="company">Company/Service</TabsTrigger>
          </TabsList>
          <TabsContent value="individual">
            <p className="text-sm text-muted-foreground mb-4">
              Register as an individual user to send and receive files.
            </p>
          </TabsContent>
          <TabsContent value="company">
            <p className="text-sm text-muted-foreground mb-4">
              Register as a company or service provider to manage your business presence.
            </p>
          </TabsContent>
        </Tabs>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-4">
        {!isLogin && isCompanyAccount && (
          <div className="space-y-2">
            <Label htmlFor="companyName">Company/Service Name</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Enter your company or service name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required={isCompanyAccount}
              disabled={loading}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full gradient-button text-white"
          disabled={loading || (!companyName && isCompanyAccount && !isLogin)}
        >
          {loading ? "Loading..." : isLogin ? "Sign in" : "Create account"}
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
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          Sign in with Google
        </Button>

        <div className="text-center mt-6">
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
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
