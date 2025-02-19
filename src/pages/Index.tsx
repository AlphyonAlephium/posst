
import { Header } from "@/components/Header";
import { LocationInput } from "@/components/LocationInput";
import { RideOptions } from "@/components/RideOptions";
import { Map } from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 px-4 pb-4 max-w-md mx-auto">
        <Card className="glass-card p-6 mb-6 fade-in">
          <div className="space-y-4">
            <Map />
            <LocationInput
              type="pickup"
              placeholder="Enter pickup location"
            />
            <LocationInput
              type="destination"
              placeholder="Where to?"
            />
            <Button className="w-full h-12 text-lg" size="lg">
              Confirm Pickup
            </Button>
          </div>
        </Card>

        <div className="slide-up">
          <RideOptions />
        </div>
      </main>
    </div>
  );
};

export default Index;
