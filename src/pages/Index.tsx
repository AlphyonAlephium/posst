
import { Header } from "@/components/Header";
import { LocationCard } from "@/components/LocationCard";
import { RideOptions } from "@/components/RideOptions";
import { LocationActions } from "@/components/LocationActions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { TagIcon } from "lucide-react";

const Index = () => {
  const { userName, isCompany } = useUserProfile();

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
              className="w-full"
              onClick={() => {
                // TODO: Implement hot deal functionality
                console.log("Add hot deal clicked");
              }}
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
    </div>
  );
};

export default Index;
