
import { Header } from "@/components/Header";
import { LocationCard } from "@/components/LocationCard";
import { RideOptions } from "@/components/RideOptions";
import { LocationActions } from "@/components/LocationActions";
import { useUserProfile } from "@/hooks/useUserProfile";

const Index = () => {
  const { userName } = useUserProfile();

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
