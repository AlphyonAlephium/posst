import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
interface LocationInputProps {
  type: "pickup" | "destination";
  placeholder: string;
}
export const LocationInput = ({
  type,
  placeholder
}: LocationInputProps) => {
  return <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        
      </div>
      
      <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
        
      </button>
    </div>;
};