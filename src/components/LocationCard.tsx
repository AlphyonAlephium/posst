
import { Card } from "@/components/ui/card";
import { Map } from "@/components/Map";
import { LocationInput } from "@/components/LocationInput";

export const LocationCard = () => {
  return (
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
        <div className="text-center p-4 bg-primary/5 rounded-lg">
          <h2 className="text-lg font-semibold text-primary mb-2">Find Users Nearby</h2>
          <p className="text-muted-foreground">
            Share your location to connect with users in your area and promote your services
          </p>
        </div>
      </div>
    </Card>
  );
};
