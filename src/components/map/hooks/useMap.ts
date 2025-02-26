
import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { Location, LATVIA_CENTER } from '../types';
import { useToast } from '@/components/ui/use-toast';

export const useMap = () => {
  const map = useRef<mapboxgl.Map | null>(null);
  const toast = useToast();

  const updateLocationSource = async (filterType: 'all' | 'businesses' | 'users' = 'all') => {
    if (!map.current) return [];

    try {
      let query = supabase
        .from('locations')
        .select('locations.latitude, locations.longitude, locations.user_id, profiles.is_company');

      // Join with profiles to get is_company status
      query = query.join('profiles', 'locations.user_id', 'eq', 'profiles.id');

      // Apply filter if needed
      if (filterType === 'businesses') {
        query = query.eq('profiles.is_company', true);
      } else if (filterType === 'users') {
        query = query.eq('profiles.is_company', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching locations:', error);
        return [];
      }

      if (data && data.length > 0) {
        const geoJson = {
          type: 'FeatureCollection',
          features: data.map(location => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            },
            properties: {
              user_id: location.user_id,
              is_company: location.is_company
            }
          }))
        };

        // Check if the source already exists before setting data
        const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData(geoJson as any);
        }
        
        return data.map(loc => ({ 
          user_id: loc.user_id,
          is_company: loc.is_company
        }));
      }
    } catch (error) {
      console.error('Error in updateLocationSource:', error);
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
