
import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { Location, LATVIA_CENTER } from '../types';

export const useMap = () => {
  const map = useRef<mapboxgl.Map | null>(null);

  const updateLocationSource = async () => {
    if (!map.current) {
      console.warn('Map not initialized when trying to update location source');
      return [];
    }

    try {
      const { data: locations, error } = await supabase
        .from('locations')
        .select('latitude, longitude, user_id') as { data: Location[] | null, error: any };

      if (error) {
        console.error('Error fetching locations:', error);
        return [];
      }

      if (locations && locations.length > 0) {
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

        // Check if the source exists before updating it
        const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData(geoJson as any);
        } else {
          console.warn('Locations source not found in map');
        }
        
        return locations.map(loc => ({ user_id: loc.user_id! }));
      }
      return [];
    } catch (err) {
      console.error('Error in updateLocationSource:', err);
      return [];
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
    updateLocationSource
  };
};
