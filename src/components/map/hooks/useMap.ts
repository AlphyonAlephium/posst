
import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { Location, LATVIA_CENTER } from '../types';

export const useMap = () => {
  const map = useRef<mapboxgl.Map | null>(null);

  const updateLocationSource = async () => {
    if (!map.current) return;

    // First get all locations
    const { data: locations, error } = await supabase
      .from('locations')
      .select('latitude, longitude, user_id') as { data: Location[] | null, error: any };

    if (error) {
      console.error('Error fetching locations:', error);
      return;
    }

    if (locations) {
      // Get user details to determine which are companies
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, company_name, is_company');

      // Create a map of user profiles
      const userProfiles = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          userProfiles.set(profile.id, {
            is_company: profile.is_company,
            company_name: profile.company_name
          });
        });
      }

      // Merge location data with company information
      const locationsWithCompanyInfo = locations.map(location => {
        const userProfile = userProfiles.get(location.user_id);
        return {
          ...location,
          is_company: userProfile?.is_company || false,
          company_name: userProfile?.company_name || ''
        };
      });

      const geoJson = {
        type: 'FeatureCollection',
        features: locationsWithCompanyInfo.map(location => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          properties: {
            user_id: location.user_id,
            is_company: location.is_company,
            company_name: location.company_name
          }
        }))
      };

      // Check if the source already exists before setting data
      const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(geoJson as any);
      }
      
      return locationsWithCompanyInfo.map(loc => ({ 
        user_id: loc.user_id!,
        is_company: loc.is_company,
        company_name: loc.company_name
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
