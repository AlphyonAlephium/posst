
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
      .select('latitude, longitude, user_id, is_company');

    if (error) {
      console.error('Error fetching locations:', error);
      return;
    }

    if (locations) {
      // Cast to ensure TypeScript recognizes the returned data format
      const typedLocations = locations as Location[];
      setLastLocations(typedLocations);

      // Apply filters if they exist
      let filteredLocations = [...typedLocations];
      
      if (filter) {
        console.log('Applying filter, before:', filteredLocations.length);
        
        filteredLocations = typedLocations.filter(location => {
          // Handle null is_company as regular user
          const isCompany = location.is_company === true;
          
          if (isCompany) {
            const shouldShow = filter.showBusinesses;
            console.log(`Business ${location.user_id}: ${shouldShow ? 'show' : 'hide'}`);
            return shouldShow;
          } else {
            const shouldShow = filter.showUsers;
            console.log(`Regular user ${location.user_id}: ${shouldShow ? 'show' : 'hide'}`);
            return shouldShow;
          }
        });
        
        console.log('After filtering:', filteredLocations.length);
      }

      console.log('Filtered locations:', filteredLocations.length, 'Total locations:', typedLocations.length);
      console.log('Filter settings:', filter);

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
            is_company: location.is_company === true
          }
        }))
      };

      const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(geoJson as any);
      }
      
      return typedLocations.map(loc => ({ 
        user_id: loc.user_id,
        is_company: loc.is_company === true
      }));
    }
    return [];
  };

  useEffect(() => {
    if (filter && map.current && lastLocations.length > 0) {
      // Apply filters when filter changes
      const filteredLocations = lastLocations.filter(location => {
        const isCompany = location.is_company === true;
        
        if (isCompany) {
          return filter.showBusinesses;
        } else {
          return filter.showUsers;
        }
      });

      console.log('Filter changed. Filtered locations:', filteredLocations.length, 'Total locations:', lastLocations.length);
      console.log('Filter settings:', filter);

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
            is_company: location.is_company === true
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
