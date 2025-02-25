
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface EmailFormProps {
  isLogin: boolean;
  isCompanyAccount: boolean;
  email: string;
  password: string;
  companyName: string;
  loading: boolean;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setCompanyName: (name: string) => void;
  handleEmailAuth: (e: React.FormEvent) => Promise<void>;
}

export const EmailForm: React.FC<EmailFormProps> = ({
  isLogin,
  isCompanyAccount,
  email,
  password,
  companyName,
  loading,
  setEmail,
  setPassword,
  setCompanyName,
  handleEmailAuth,
}) => {
  return (
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
    </form>
  );
};
