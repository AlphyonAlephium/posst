
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { Location, LATVIA_CENTER, AccountType, MapFilters, DEFAULT_FILTERS } from '../types';

export const useMap = () => {
  const map = useRef<mapboxgl.Map | null>(null);
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);

  const updateFilters = (newFilters: Partial<MapFilters>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      
      // Update layer visibility based on filters
      if (map.current) {
        // Handle business layers visibility
        ['business-point', 'business-point-label', 'business-name'].forEach(layerId => {
          map.current?.setLayoutProperty(
            layerId, 
            'visibility', 
            updated.showBusinesses ? 'visible' : 'none'
          );
        });
        
        // Handle service layers visibility
        ['service-point', 'service-point-label', 'service-name'].forEach(layerId => {
          map.current?.setLayoutProperty(
            layerId, 
            'visibility', 
            updated.showServices ? 'visible' : 'none'
          );
        });
        
        // Handle regular user layers visibility
        ['unclustered-point', 'unclustered-point-count'].forEach(layerId => {
          map.current?.setLayoutProperty(
            layerId, 
            'visibility', 
            updated.showUsers ? 'visible' : 'none'
          );
        });
      }
      
      return updated;
    });
  };

  const updateLocationSource = async () => {
    if (!map.current) return [];

    try {
      // Get all locations
      const { data: locations, error } = await supabase
        .from('locations')
        .select('id, latitude, longitude, user_id') as { data: Location[] | null, error: any };

      if (error) {
        console.error('Error fetching locations:', error);
        return [];
      }

      if (!locations || locations.length === 0) {
        return [];
      }

      // Get user metadata to identify account types
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

      // Convert locations to GeoJSON features with account type info
      const features = await Promise.all(locations.map(async (location) => {
        // Default values
        let accountType = AccountType.USER;
        let businessName = '';
        let serviceName = '';
        
        if (location.user_id) {
          // Try to find the account type
          
          // If we have admin access to all users
          if (users && users.users) {
            const userInfo = users.users.find(u => u.id === location.user_id);
            if (userInfo && userInfo.user_metadata) {
              if (userInfo.user_metadata.is_company) {
                accountType = AccountType.BUSINESS;
                businessName = userInfo.user_metadata.company_name || '';
              } else if (userInfo.user_metadata.is_service) {
                accountType = AccountType.SERVICE;
                serviceName = userInfo.user_metadata.service_name || '';
              }
            }
          } 
          // If we only have access to current user
          else if (currentUserOnly && currentUserOnly.id === location.user_id) {
            if (currentUserOnly.user_metadata?.is_company) {
              accountType = AccountType.BUSINESS;
              businessName = currentUserOnly.user_metadata?.company_name || '';
            } else if (currentUserOnly.user_metadata?.is_service) {
              accountType = AccountType.SERVICE;
              serviceName = currentUserOnly.user_metadata?.service_name || '';
            }
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
                  if (user.user_metadata.is_company) {
                    accountType = AccountType.BUSINESS;
                    businessName = user.user_metadata.company_name || '';
                  } else if (user.user_metadata.is_service) {
                    accountType = AccountType.SERVICE;
                    serviceName = user.user_metadata.service_name || '';
                  }
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
            account_type: accountType,
            business_name: businessName,
            service_name: serviceName,
            display_name: accountType === AccountType.BUSINESS 
              ? businessName 
              : (accountType === AccountType.SERVICE ? serviceName : '')
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
    filters,
    updateFilters,
    initializeMap,
    updateLocationSource
  };
};
