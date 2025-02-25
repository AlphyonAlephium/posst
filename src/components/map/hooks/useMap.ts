
import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { Location, LATVIA_CENTER, MAP_COLORS } from '../types';

export const useMap = () => {
  const map = useRef<mapboxgl.Map | null>(null);

  const updateLocationSource = async () => {
    if (!map.current) return;

    // Get all locations
    const { data: locations, error } = await supabase
      .from('locations')
      .select('latitude, longitude, user_id') as { data: Location[] | null, error: any };

    if (error) {
      console.error('Error fetching locations:', error);
      return;
    }

    if (locations) {
      // Get all user metadata to determine which users are companies
      const { data: users } = await supabase.auth.admin.listUsers();
      
      // Create a map of user IDs to company status
      const companyUsers = new Map();
      if (users) {
        users.users.forEach(user => {
          const isCompany = user.user_metadata?.is_company || false;
          companyUsers.set(user.id, isCompany);
        });
      }

      // Enhance locations with company status
      const enhancedLocations = locations.map(location => ({
        ...location,
        is_company: companyUsers.get(location.user_id) || false
      }));

      // Create GeoJSON feature collection
      const geoJson = {
        type: 'FeatureCollection',
        features: enhancedLocations.map(location => ({
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

      // Update the map source
      const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(geoJson as any);
      }
      
      // Return enhanced nearby users data
      return enhancedLocations.map(loc => ({
        user_id: loc.user_id!,
        is_company: loc.is_company
      }));
    }
    return [];
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
    updateLocationSource
  };
};
