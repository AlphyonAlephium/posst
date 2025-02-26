
import { useRef, useState, useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { LATVIA_CENTER, NearbyUser } from '../types';
import { useToast } from '@/components/ui/use-toast';

export const useMap = () => {
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  const initializeMap = useCallback(async (container: HTMLDivElement) => {
    try {
      // Initialize mapbox with token
      const { data: { token } } = await supabase.functions.invoke('get-secret', {
        body: { name: 'MAPBOX_PUBLIC_TOKEN' },
      });
      
      mapboxgl.accessToken = token;
      
      // Create the map instance
      const mapInstance = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [LATVIA_CENTER.lng, LATVIA_CENTER.lat],
        zoom: LATVIA_CENTER.zoom,
      });
      
      map.current = mapInstance;
      
      // Add navigation controls
      mapInstance.addControl(new mapboxgl.NavigationControl());
      
      return mapInstance;
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initialize map. Please try again."
      });
      throw error;
    }
  }, [toast]);

  const centerOnUserLocation = useCallback(() => {
    if (!map.current) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          
          setUserLocation([longitude, latitude]);
          
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            essential: true
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Failed to get your location. Please check your browser settings."
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation."
      });
    }
  }, [toast]);

  const updateLocationSource = useCallback(async () => {
    if (!map.current || !map.current.getSource('locations')) {
      return [];
    }

    try {
      // Get current user location
      let userCoords = userLocation;
      
      if (!userCoords && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        
        userCoords = [position.coords.longitude, position.coords.latitude];
        setUserLocation(userCoords);
      }
      
      // Get all locations from database
      const { data: locations, error } = await supabase
        .from('locations')
        .select('*');
      
      if (error) {
        throw error;
      }

      // Get company profiles to identify company markers
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, is_company');
      
      // Create a map for quick lookup of company status
      const companyProfiles = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          companyProfiles.set(profile.id, profile.is_company || false);
        });
      }
      
      // Create array of nearby users
      const nearbyUsers: NearbyUser[] = locations.map(location => ({
        user_id: location.user_id,
        is_company: companyProfiles.get(location.user_id) || false
      }));
      
      // Create GeoJSON features for map
      const features = locations.map(loc => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [loc.longitude, loc.latitude]
        },
        properties: {
          user_id: loc.user_id,
          is_company: companyProfiles.get(loc.user_id) || false
        }
      }));
      
      const geoJson = {
        type: 'FeatureCollection',
        features
      };
      
      (map.current.getSource('locations') as mapboxgl.GeoJSONSource).setData(geoJson as any);
      
      return nearbyUsers;
    } catch (error) {
      console.error('Error updating location source:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update locations. Please try again."
      });
      return [];
    }
  }, [userLocation, toast]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return {
    map,
    initializeMap,
    updateLocationSource,
    centerOnUserLocation
  };
};
