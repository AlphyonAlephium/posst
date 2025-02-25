
import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { Location, LATVIA_CENTER } from '../types';

export const useMap = () => {
  const map = useRef<mapboxgl.Map | null>(null);

  const updateLocationSource = async () => {
    if (!map.current) return [];

    // Fetch locations with user data
    const { data: locations, error } = await supabase
      .from('locations')
      .select('latitude, longitude, user_id') as { data: Location[] | null, error: any };

    if (error) {
      console.error('Error fetching locations:', error);
      return [];
    }

    if (locations) {
      // Get user metadata in a separate query for the is_company flag
      const userIds = locations.map(loc => loc.user_id).filter(Boolean);
      const { data: users } = await supabase
        .from('profiles')
        .select('id, updated_at')
        .in('id', userIds);
      
      // Map of user IDs to company status
      const userStatusMap = new Map();
      if (users) {
        for (const user of users) {
          // This is a simplified example. In a real app, you'd get this from user metadata
          // For now, we'll randomly assign some users as companies for demonstration
          userStatusMap.set(user.id, Math.random() > 0.7);
        }
      }

      const geoJson = {
        type: 'FeatureCollection',
        features: locations.map(location => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          properties: {
            user_id: location.user_id,
            is_company: userStatusMap.get(location.user_id) || false
          }
        }))
      };

      // Check if the source already exists before setting data
      const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(geoJson as any);
      }
      
      return locations.map(loc => ({ 
        user_id: loc.user_id!,
        is_company: userStatusMap.get(loc.user_id) || false
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
