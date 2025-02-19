
import { Header } from "@/components/Header";
import { LocationInput } from "@/components/LocationInput";
import { RideOptions } from "@/components/RideOptions";
import { Map } from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Send } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
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
            <Button className="w-full h-12 text-lg gradient-button" size="lg">
              Confirm Pickup
            </Button>
          </div>
        </Card>

        <div className="slide-up">
          <RideOptions />
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bottom-nav">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between gap-4">
          <Button 
            className="flex-1 gradient-button text-white font-semibold"
            size="lg"
          >
            <MapPin className="mr-2 h-5 w-5" />
            Set Location
          </Button>
          <Button 
            className="flex-1 gradient-button text-white font-semibold"
            size="lg"
          >
            <Send className="mr-2 h-5 w-5" />
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
