
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LocationInputProps {
  type: "pickup" | "destination";
  placeholder: string;
}

export const LocationInput = ({ type, placeholder }: LocationInputProps) => {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <MapPin className="h-5 w-5 text-primary" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-12 h-14 text-lg bg-background border-2 focus:border-primary transition-colors"
      />
      <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <Search className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
      </button>
    </div>
  );
};
