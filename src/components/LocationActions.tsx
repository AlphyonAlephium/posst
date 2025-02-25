
import { Button } from "@/components/ui/button";
import { MapPin, Trash2 } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";

export const LocationActions = () => {
  const { setLocation, deleteLocation } = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bottom-nav">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-center gap-2">
        <Button 
          className="gradient-button text-white font-semibold w-full"
          size="lg"
          onClick={setLocation}
        >
          <MapPin className="mr-2 h-5 w-5" />
          Set Location
        </Button>

        <Button 
          variant="destructive"
          size="lg"
          onClick={deleteLocation}
          className="w-full"
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Delete Location
        </Button>
      </div>
    </div>
  );
};
