
import { LogOut, Search, Heart, MessageCircle, Menu } from "lucide-react";
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
    <header className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 lg:px-6 bg-white border-b border-gray-200 z-50">
      <div className="flex-1 flex justify-start items-center">
        <Button variant="ghost" size="icon" className="text-gray-800 lg:hidden">
          <Search className="h-5 w-5" />
        </Button>
        
        <div className="hidden lg:flex items-center space-x-6">
          <img src="/lovable-uploads/25d6ab78-31af-482a-a80c-f87edbe32e96.png" alt="Posst Logo" className="h-7" />
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              className="instagram-input py-2 pl-10 pr-4 w-64 bg-gray-50"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex justify-center lg:justify-start lg:ml-4">
        <img src="/lovable-uploads/25d6ab78-31af-482a-a80c-f87edbe32e96.png" alt="Posst Logo" className="h-7 lg:hidden" />
      </div>

      <div className="flex-1 flex justify-end items-center gap-1 lg:gap-3">
        <Button variant="ghost" size="icon" className="text-gray-800">
          <Heart className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-gray-800">
          <MessageCircle className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out" className="text-gray-800">
          <LogOut className="h-5 w-5" />
        </Button>
        
        <div className="hidden lg:block ml-2">
          <Button variant="ghost" className="rounded-full w-8 h-8 bg-gray-200">
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
