
import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { Location, LATVIA_CENTER } from '../types';

export const useMap = () => {
  const map = useRef<mapboxgl.Map | null>(null);

  const updateLocationSource = async () => {
    if (!map.current) return [];

    try {
      // Get all locations
      const { data: locations, error } = await supabase
        .from('locations')
        .select('latitude, longitude, user_id') as { data: Location[] | null, error: any };

      if (error) {
        console.error('Error fetching locations:', error);
        return [];
      }

      if (!locations || locations.length === 0) {
        return [];
      }

      // Get user metadata to identify business accounts
      const userIds = locations.map(loc => loc.user_id).filter(Boolean) as string[];
      
      const { data: users, error: userError } = await supabase.auth.admin.listUsers({
        perPage: 1000
      });
      
      // Fallback: If admin access is not available, only fetch the current user
      let currentUserOnly = null;
      if (userError) {
        console.warn('Could not get admin user list, falling back to current user only');
        const { data } = await supabase.auth.getUser();
        currentUserOnly = data.user;
      }

      // Convert locations to GeoJSON features with business info
      const features = await Promise.all(locations.map(async (location) => {
        // Default values
        let isBusinessAccount = false;
        let businessName = '';
        
        if (location.user_id) {
          // Try to find if this is a business account
          
          // If we have admin access to all users
          if (users && users.users) {
            const userInfo = users.users.find(u => u.id === location.user_id);
            if (userInfo && userInfo.user_metadata) {
              isBusinessAccount = !!userInfo.user_metadata.is_company;
              businessName = userInfo.user_metadata.company_name || '';
            }
          } 
          // If we only have access to current user
          else if (currentUserOnly && currentUserOnly.id === location.user_id) {
            isBusinessAccount = !!currentUserOnly.user_metadata?.is_company;
            businessName = currentUserOnly.user_metadata?.company_name || '';
          }
          // Fallback: Query profiles table for the specific user
          else {
            try {
              // Try to get a specific profile
              const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', location.user_id)
                .single();
              
              if (profile) {
                // If we found a profile, try to get metadata
                const { data: { user } } = await supabase.auth.admin.getUserById(
                  location.user_id
                );
                
                if (user && user.user_metadata) {
                  isBusinessAccount = !!user.user_metadata.is_company;
                  businessName = user.user_metadata.company_name || '';
                }
              }
            } catch (err) {
              console.warn('Could not fetch user metadata for ID:', location.user_id);
            }
          }
        }

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          properties: {
            user_id: location.user_id,
            is_business: isBusinessAccount,
            business_name: businessName
          }
        };
      }));

      const geoJson = {
        type: 'FeatureCollection',
        features: features
      };

      // Update the source data
      const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(geoJson as any);
      }
      
      return locations.map(loc => ({ user_id: loc.user_id! }));
    } catch (error) {
      console.error('Error updating location source:', error);
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
