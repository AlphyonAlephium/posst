
import { LogOut, Search, Heart, MessageCircle } from "lucide-react";
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
    <header className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 bg-white border-b border-gray-200 z-50">
      <div className="flex-1 flex justify-start">
        <Button variant="ghost" size="icon" className="text-gray-800">
          <Search className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 flex justify-center">
        <img src="/lovable-uploads/25d6ab78-31af-482a-a80c-f87edbe32e96.png" alt="Posst Logo" className="h-7" />
      </div>

      <div className="flex-1 flex justify-end items-center gap-1">
        <Button variant="ghost" size="icon" className="text-gray-800">
          <Heart className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-gray-800">
          <MessageCircle className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out" className="text-gray-800">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
