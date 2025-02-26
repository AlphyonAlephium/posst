
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LocationInputProps {
  type: "pickup" | "destination";
  placeholder: string;
}

export const LocationInput = ({ type, placeholder }: LocationInputProps) => {
  return (
    <div className="relative mb-3">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <MapPin className="h-4 w-4" />
      </div>
      
      <input
        type="text"
        placeholder={placeholder}
        className="instagram-input pl-10 pr-10 py-3 w-full transition-all focus:shadow-md"
      />
      
      <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Search className="h-4 w-4" />
      </button>
    </div>
  );
};
