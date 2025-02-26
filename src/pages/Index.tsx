
import { useState } from "react";
import { Header } from "@/components/Header";
import { LocationCard } from "@/components/LocationCard";
import { RideOptions } from "@/components/RideOptions";
import { LocationActions } from "@/components/LocationActions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { TagIcon, Home, Search, Heart, User } from "lucide-react";
import { HotDealDialog } from "@/components/map/HotDealDialog";

const Index = () => {
  const { userName, isCompany } = useUserProfile();
  const [hotDealDialogOpen, setHotDealDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      
      <main className="pt-16 px-0 pb-4 max-w-md mx-auto">
        {userName && (
          <div className="px-4 mb-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {userName}! 👋
            </h1>
          </div>
        )}
        
        {isCompany && (
          <div className="px-4 mb-4">
            <Button
              size="lg"
              className="w-full instagram-button py-3"
              onClick={() => setHotDealDialogOpen(true)}
            >
              <TagIcon className="mr-2 h-5 w-5" />
              Manage hot deals
            </Button>
          </div>
        )}
        
        <div className="px-4">
          <LocationCard />
          <div className="slide-up">
            <RideOptions />
          </div>
        </div>
      </main>

      <LocationActions />
      
      {/* Instagram-style bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bottom-nav h-14 flex items-center justify-around px-4 z-40">
        <Button variant="ghost" size="icon" className="text-gray-800">
          <Home className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-800">
          <Search className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="instagram-gradient text-white rounded-full h-8 w-8 flex items-center justify-center">
          <Plus className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-800">
          <Heart className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-800">
          <User className="h-6 w-6" />
        </Button>
      </div>
      
      <HotDealDialog 
        open={hotDealDialogOpen} 
        onOpenChange={setHotDealDialogOpen} 
      />
    </div>
  );
};

export default Index;
