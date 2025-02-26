import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { Location, LATVIA_CENTER, MapFilter } from '../types';
import { useToast } from '@/components/ui/use-toast';

export const useMap = (filter?: MapFilter) => {
  const map = useRef<mapboxgl.Map | null>(null);
  const toast = useToast();
  const [lastLocations, setLastLocations] = useState<Location[]>([]);

  const updateLocationSource = async () => {
    if (!map.current) return;

    const { data: locations, error } = await supabase
      .from('locations')
      .select('latitude, longitude, user_id, is_company') as { data: Location[] | null, error: any };

    if (error) {
      console.error('Error fetching locations:', error);
      return;
    }

    if (locations) {
      setLastLocations(locations);
      
      let filteredLocations = [...locations];
      if (filter) {
        filteredLocations = locations.filter(location => {
          if (location.is_company === true) {
            return filter.showBusinesses;
          }
          return filter.showUsers;
        });
      }

      const geoJson = {
        type: 'FeatureCollection',
        features: filteredLocations.map(location => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          properties: {
            user_id: location.user_id,
            is_company: location.is_company || false
          }
        }))
      };

      const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(geoJson as any);
      }
      
      return locations.map(loc => ({ 
        user_id: loc.user_id!,
        is_company: loc.is_company || false 
      }));
    }
    return [];
  };

  useEffect(() => {
    if (filter && map.current && lastLocations.length > 0) {
      const filteredLocations = lastLocations.filter(location => {
        if (location.is_company === true) {
          return filter.showBusinesses;
        }
        return filter.showUsers;
      });

      const geoJson = {
        type: 'FeatureCollection',
        features: filteredLocations.map(location => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          properties: {
            user_id: location.user_id,
            is_company: location.is_company || false
          }
        }))
      };

      const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(geoJson as any);
      }
    }
  }, [filter, lastLocations]);

  const centerOnUserLocation = async () => {
    if (!map.current) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to use this feature"
        });
        return;
      }

      const { data: userLocation, error } = await supabase
        .from('locations')
        .select('latitude, longitude')
        .eq('user_id', user.id)
        .single();

      if (error || !userLocation) {
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
