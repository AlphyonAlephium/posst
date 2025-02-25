
import React from "react";

interface AuthFooterProps {
  isLogin: boolean;
  loading: boolean;
  onToggleMode: () => void;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({ isLogin, loading, onToggleMode }) => {
  return (
    <div className="text-center mt-6">
      <button
        type="button"
        className="text-sm text-primary hover:underline"
        onClick={onToggleMode}
        disabled={loading}
      >
        {isLogin
          ? "Don't have an account? Sign up"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
};
