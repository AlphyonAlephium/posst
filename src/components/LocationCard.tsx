import { Card } from "@/components/ui/card";
import { Map } from "@/components/Map";
import { LocationInput } from "@/components/LocationInput";
export const LocationCard = () => {
  return <Card className="instagram-card p-0 mb-6 fade-in overflow-hidden">
      <div className="space-y-0">
        <div className="relative w-full h-[300px] lg:h-[400px]">
          <Map />
        </div>
        
        
      </div>
    </Card>;
};