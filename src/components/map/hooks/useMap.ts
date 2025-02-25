
import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { Location, LATVIA_CENTER } from '../types';

export const useMap = () => {
  const map = useRef<mapboxgl.Map | null>(null);

  const updateLocationSource = async () => {
    if (!map.current) return;

    try {
      // First get all locations
      const { data: locations, error } = await supabase
        .from('locations')
        .select('id, latitude, longitude, user_id');

      if (error) {
        console.error('Error fetching locations:', error);
        return;
      }

      if (!locations || locations.length === 0) {
        console.log('No locations found');
        return [];
      }

      // Get user details to determine which are companies
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, company_name, is_company');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Create a map of user profiles
      const userProfiles = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          userProfiles.set(profile.id, {
            is_company: profile.is_company || false,
            company_name: profile.company_name || ''
          });
        });
      }

      console.log('User profiles map:', Array.from(userProfiles.entries()));

      // Merge location data with company information
      const locationsWithCompanyInfo = locations.map(location => {
        const userProfile = userProfiles.get(location.user_id);
        const isCompany = userProfile?.is_company || false;
        const companyName = userProfile?.company_name || '';
        
        console.log(`Location ${location.id} for user ${location.user_id}:`, { 
          isCompany, 
          companyName,
          profile: userProfile 
        });
        
        return {
          ...location,
          is_company: isCompany,
          company_name: companyName
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
            id: location.id,
            user_id: location.user_id,
            is_company: location.is_company,
            company_name: location.company_name
          }
        }))
      };

      console.log('GeoJSON features:', geoJson.features);

      // Check if the source already exists before setting data
      const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(geoJson as any);
      }
      
      return locationsWithCompanyInfo.map(loc => ({ 
        id: loc.id,
        user_id: loc.user_id,
        is_company: loc.is_company,
        company_name: loc.company_name
      }));
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
