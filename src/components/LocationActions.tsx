import { Button } from "@/components/ui/button";
import { MapPin, Trash2, Plus } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
export const LocationActions = () => {
  const {
    setLocation,
    deleteLocation
  } = useLocation();
  return <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50">
      <Button onClick={setLocation} className="instagram-button h-14 w-14 rounded-full shadow-lg flex items-center justify-center my-0">
        <MapPin className="h-6 w-6" />
      </Button>

      <Button variant="outline" onClick={deleteLocation} className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center border-gray-200 bg-white my-[44px]">
        <Trash2 className="h-6 w-6 text-red-500" />
      </Button>
    </div>;
};