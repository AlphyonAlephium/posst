
import { useState } from "react";
import { Header } from "@/components/Header";
import { LocationCard } from "@/components/LocationCard";
import { RideOptions } from "@/components/RideOptions";
import { LocationActions } from "@/components/LocationActions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { TagIcon } from "lucide-react";
import { HotDealDialog } from "@/components/map/HotDealDialog";

const Index = () => {
  const { userName, isCompany } = useUserProfile();
  const [hotDealDialogOpen, setHotDealDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-20 px-4 pb-4 max-w-md mx-auto">
        {userName && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary">
              Welcome back, {userName}! 👋
            </h1>
          </div>
        )}
        
        {isCompany && (
          <div className="mb-4">
            <Button
              variant="secondary"
              size="lg"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => setHotDealDialogOpen(true)}
            >
              <TagIcon className="mr-2 h-5 w-5" />
              Add hot deal
            </Button>
          </div>
        )}
        
        <LocationCard />
        <div className="slide-up">
          <RideOptions />
        </div>
      </main>

      <LocationActions />
      
      <HotDealDialog 
        open={hotDealDialogOpen} 
        onOpenChange={setHotDealDialogOpen} 
      />
    </div>
  );
};

export default Index;
