
import { useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { LATVIA_CENTER, NearbyUser } from '../types';
import { useUserProfile } from '@/hooks/useUserProfile';

const MAX_DISTANCE = 10000;

export const useMap = () => {
  const map = useRef<mapboxgl.Map | null>(null);
  const userLocation = useRef<[number, number] | null>(null);
  const { toast } = useToast();
  const { userId } = useUserProfile();

  const initializeMap = useCallback(async (container: HTMLDivElement): Promise<mapboxgl.Map> => {
    try {
      const { data: secretData, error: secretError } = await supabase.functions.invoke('get-secret', {
        body: { name: 'MAPBOX_PUBLIC_TOKEN' },
      });

      if (secretError) {
        throw new Error(`Failed to get Mapbox API key: ${secretError.message}`);
      }

      mapboxgl.accessToken = secretData.value;
      
      const mapInstance = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [LATVIA_CENTER.lng, LATVIA_CENTER.lat],
        zoom: LATVIA_CENTER.zoom,
      });

      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
      mapInstance.addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }), 'top-right');

      map.current = mapInstance;
      return mapInstance;

    } catch (error) {
      console.error('Error initializing map:', error);
      throw error;
    }
  }, []);

  const updateLocationSource = useCallback(async (): Promise<NearbyUser[]> => {
    if (!map.current || !userLocation.current) {
      return [];
    }

    try {
      // Get locations data - using separate queries instead of joins to avoid relation errors
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('id, latitude, longitude, user_id');

      if (locationsError) throw locationsError;
      
      // For each location, fetch the related profile and business_profile data
      const nearbyUsers: NearbyUser[] = [];
      const features: GeoJSON.Feature[] = [];
      
      // Process each location
      for (const location of locationsData) {
        // Get profile data for this user
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_company, company_name')
          .eq('id', location.user_id)
          .maybeSingle();
          
        // Get business profile data for this user
        const { data: businessProfileData } = await supabase
          .from('business_profiles')
          .select('business_name')
          .eq('user_id', location.user_id)
          .maybeSingle();

        // Determine if this is a company
        const isCompany = profileData?.is_company === true;
        const hasHotDeal = false; // This could be determined from hot_deals table if needed
        
        // Get company name from either profile or business_profile
        const companyName = isCompany 
          ? (profileData?.company_name || businessProfileData?.business_name || '')
          : '';

        // Add to nearby users array
        nearbyUsers.push({
          user_id: location.user_id || '',
          is_company: isCompany
        });
        
        // Add to GeoJSON features - use proper GeoJSON.Feature type
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          properties: {
            user_id: location.user_id,
            is_company: isCompany,
            has_hot_deal: hasHotDeal,
            company_name: companyName
          }
        });
      }
      
      // Update the map source if it exists
      if (map.current.getSource('locations')) {
        (map.current.getSource('locations') as mapboxgl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features
        });
      }

      return nearbyUsers;

    } catch (error) {
      console.error('Error updating location source:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load nearby locations. Please try again later."
      });
      return [];
    }
  }, [toast]);

  const centerOnUserLocation = useCallback(() => {
    if (!map.current || !userLocation.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          userLocation.current = [longitude, latitude];
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 14
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Couldn't access your location. Please check your browser settings."
          });
        }
      );
      return;
    }

    map.current.flyTo({
      center: userLocation.current,
      zoom: 14
    });
  }, [toast]);

  const applyVisibilityFilter = useCallback((showUsers: boolean, showBusinesses: boolean) => {
    if (!map.current) return;
    
    if (!map.current.isStyleLoaded() || !map.current.getLayer('unclustered-point')) {
      setTimeout(() => applyVisibilityFilter(showUsers, showBusinesses), 100);
      return;
    }

    const unclusteredFilter = ['all', ['!', ['has', 'point_count']]];
    
    if (!showUsers && !showBusinesses) {
      map.current.setFilter('unclustered-point', ['==', 'user_id', 'none']);
      map.current.setFilter('unclustered-point-count', ['==', 'user_id', 'none']);
      map.current.setFilter('hot-deal-pulse', ['==', 'user_id', 'none']);
    } else if (!showUsers) {
      map.current.setFilter('unclustered-point', ['all', 
        unclusteredFilter,
        ['==', ['get', 'is_company'], true]
      ]);
      map.current.setFilter('unclustered-point-count', ['all', 
        unclusteredFilter,
        ['==', ['get', 'is_company'], true]
      ]);
      map.current.setFilter('hot-deal-pulse', ['all', 
        unclusteredFilter,
        ['==', ['get', 'is_company'], true],
        ['to-boolean', ['get', 'has_hot_deal']]
      ]);
    } else if (!showBusinesses) {
      map.current.setFilter('unclustered-point', ['all', 
        unclusteredFilter,
        ['!=', ['get', 'is_company'], true]
      ]);
      map.current.setFilter('unclustered-point-count', ['all', 
        unclusteredFilter,
        ['!=', ['get', 'is_company'], true]
      ]);
      map.current.setFilter('hot-deal-pulse', ['all', 
        unclusteredFilter,
        ['!=', ['get', 'is_company'], true],
        ['to-boolean', ['get', 'has_hot_deal']]
      ]);
    } else {
      map.current.setFilter('unclustered-point', unclusteredFilter);
      map.current.setFilter('unclustered-point-count', unclusteredFilter);
      map.current.setFilter('hot-deal-pulse', ['all',
        unclusteredFilter,
        ['to-boolean', ['get', 'has_hot_deal']]
      ]);
    }
  }, []);

  return { 
    map, 
    initializeMap, 
    updateLocationSource, 
    centerOnUserLocation,
    applyVisibilityFilter
  };
};
