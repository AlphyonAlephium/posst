
import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { Location, LATVIA_CENTER } from '../types';
import { useToast } from '@/components/ui/use-toast';

export const useMap = () => {
  const map = useRef<mapboxgl.Map | null>(null);
  const toast = useToast();

  const updateLocationSource = async () => {
    if (!map.current) return;

    const { data: locations, error } = await supabase
      .from('locations')
      .select('latitude, longitude, user_id') as { data: Location[] | null, error: any };

    if (error) {
      console.error('Error fetching locations:', error);
      return;
    }

    if (locations) {
      const geoJson = {
        type: 'FeatureCollection',
        features: locations.map(location => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          properties: {
            user_id: location.user_id
          }
        }))
      };

      // Check if the source already exists before setting data
      const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(geoJson as any);
      }
      
      return locations.map(loc => ({ user_id: loc.user_id! }));
    }
    return [];
  };

  const centerOnUserLocation = async () => {
    if (!map.current) return;
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to use this feature"
        });
        return;
      }

      // Get user's location from database
      const { data: userLocation, error } = await supabase
        .from('locations')
        .select('latitude, longitude')
        .eq('user_id', user.id)
        .single();

      if (error || !userLocation) {
        // If no stored location, try to get current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              map.current?.flyTo({
                center: [longitude, latitude],
                zoom: 15,
                speed: 1.5
              });
            },
            (error) => {
              console.error('Error getting current position:', error);
              toast.toast({
                variant: "destructive",
                title: "Location Error",
                description: "Could not access your location. Please check browser permissions."
              });
            }
          );
        }
        return;
      }

      // If we have a stored location, center the map on it
      map.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 15,
        speed: 1.5
      });
      
    } catch (error) {
      console.error('Error centering on user location:', error);
      toast.toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to center map on your location"
      });
    }
  };

  const initializeMap = async (containerRef: HTMLDivElement) => {
    try {
      const { data: { MAPBOX_PUBLIC_TOKEN }, error } = await supabase
        .functions.invoke('get-secret', {
          body: { secretName: 'MAPBOX_PUBLIC_TOKEN' }
        });

      if (error || !MAPBOX_PUBLIC_TOKEN) {
        throw new Error('Failed to get Mapbox token');
      }

      mapboxgl.accessToken = MAPBOX_PUBLIC_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: containerRef,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [LATVIA_CENTER.lng, LATVIA_CENTER.lat],
        zoom: LATVIA_CENTER.zoom
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      return map.current;
    } catch (error) {
      console.error('Error initializing map:', error);
      throw error;
    }
  };

  return {
    map,
    initializeMap,
    updateLocationSource,
    centerOnUserLocation
  };
};
