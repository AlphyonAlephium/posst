
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useLocation = () => {
  const { toast } = useToast();

  const setLocation = async () => {
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

      // Get user profile to check if they're a company
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_company')
        .eq('id', user.id)
        .single();

      const isCompany = profileData?.is_company || false;

      // Check if user already has a location
      const { data: existingLocations } = await supabase
        .from('locations')
        .select('id')
        .eq('user_id', user.id);

      if (existingLocations && existingLocations.length > 0) {
        // Update existing location
        const { error } = await supabase
          .from('locations')
          .update({
            latitude,
            longitude,
            is_company: isCompany
          })
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Success",
          description: "Your location has been updated"
        });
      } else {
        // Insert new location if none exists
        const { error } = await supabase
          .from('locations')
          .insert([{
            latitude,
            longitude,
            user_id: user.id,
            is_company: isCompany
          }]);

        if (error) {
          throw error;
        }

        toast({
          title: "Success",
          description: "Your location has been saved"
        });
      }

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

  const deleteLocation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to delete your location"
        });
        return;
      }

      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Your location has been deleted"
      });

    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete your location. Please try again."
      });
    }
  };

  return {
    setLocation,
    deleteLocation
  };
};
