
import React from "react";

interface AuthHeaderProps {
  isLogin: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ isLogin }) => {
  return (
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
  );
};
