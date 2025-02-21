
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again."
      });
    } else {
      navigate("/login");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-background/80 backdrop-blur-lg border-b z-50">
      <div className="w-10" /> {/* Spacer for centering */}
      
      <div className="flex items-center gap-4">
        <img src="/lovable-uploads/25d6ab78-31af-482a-a80c-f87edbe32e96.png" alt="Posst Logo" className="h-8" />
      </div>

      <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
        <LogOut className="h-6 w-6" />
      </Button>
    </header>
  );
};

