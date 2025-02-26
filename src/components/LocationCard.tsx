
import { Card } from "@/components/ui/card";
import { Map } from "@/components/Map";
import { LocationInput } from "@/components/LocationInput";

export const LocationCard = () => {
  return (
    <Card className="instagram-card p-0 mb-6 fade-in overflow-hidden">
      <div className="space-y-0">
        <div className="relative w-full h-[300px]">
          <Map />
        </div>
        
        <div className="p-4 space-y-2">
          <LocationInput type="pickup" placeholder="Enter pickup location" />
          <LocationInput type="destination" placeholder="Where to?" />
          
          <div className="text-center p-4 bg-gray-50 rounded-lg mt-3">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Find Users Nearby</h2>
            <p className="text-sm text-gray-500">Tap on users to share your news</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
