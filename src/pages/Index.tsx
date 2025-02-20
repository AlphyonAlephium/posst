
import { Header } from "@/components/Header";
import { LocationInput } from "@/components/LocationInput";
import { RideOptions } from "@/components/RideOptions";
import { Map } from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();

  const handleSetLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Location Services Not Available",
        description: "Your browser doesn't support location services. Please try using a different browser."
      });
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              toast({
                variant: "destructive",
                title: "Location Access Denied",
                description: "Please enable location services in your browser settings to use this feature."
              });
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              toast({
                variant: "destructive",
                title: "Location Unavailable",
                description: "Unable to detect your location. Please check if location services are enabled on your device."
              });
            } else if (error.code === error.TIMEOUT) {
              toast({
                variant: "destructive",
                title: "Request Timeout",
                description: "Location request timed out. Please check your connection and try again."
              });
            }
            reject(error);
          },
          { 
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to set your location"
        });
        return;
      }

      const { error } = await supabase
        .from('locations')
        .insert([{
          latitude,
          longitude,
          user_id: user.id
        }]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Your location has been saved"
      });

    } catch (error) {
      console.error('Error setting location:', error);
      // Only show generic error if it wasn't handled by the geolocation error handler
      if (error instanceof GeolocationPositionError === false) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save your location. Please try again."
        });
      }
    }
  };

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
            onClick={handleSetLocation}
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
