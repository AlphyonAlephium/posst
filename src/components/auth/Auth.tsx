
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { AuthHeader } from "./AuthHeader";
import { AccountTypeSelector } from "./AccountTypeSelector";
import { EmailForm } from "./EmailForm";
import { SocialAuth } from "./SocialAuth";
import { AuthFooter } from "./AuthFooter";

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

  const handleAccountTypeChange = (value: string) => {
    setIsCompanyAccount(value === "company");
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 glass-card">
      <AuthHeader isLogin={isLogin} />

      {!isLogin && (
        <AccountTypeSelector onAccountTypeChange={handleAccountTypeChange} />
      )}

      <EmailForm
        isLogin={isLogin}
        isCompanyAccount={isCompanyAccount}
        email={email}
        password={password}
        companyName={companyName}
        loading={loading}
        setEmail={setEmail}
        setPassword={setPassword}
        setCompanyName={setCompanyName}
        handleEmailAuth={handleEmailAuth}
      />

      <SocialAuth loading={loading} />

      <AuthFooter 
        isLogin={isLogin} 
        loading={loading} 
        onToggleMode={toggleAuthMode} 
      />
    </Card>
  );
};
