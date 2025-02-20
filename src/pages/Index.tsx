
import { Header } from "@/components/Header";
import { LocationInput } from "@/components/LocationInput";
import { RideOptions } from "@/components/RideOptions";
import { Map } from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

const Index = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        if (profile?.email) {
          setUserName(profile.email.split('@')[0]);
        }
      }
    };

    fetchUserProfile();
  }, []);

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
        {userName && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary">
              Welcome back, {userName}! 👋
            </h1>
          </div>
        )}
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

        <div className="slide-up">
          <RideOptions />
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bottom-nav">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-center">
          <Button 
            className="gradient-button text-white font-semibold w-full"
            size="lg"
            onClick={handleSetLocation}
          >
            <MapPin className="mr-2 h-5 w-5" />
            Set Location
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
