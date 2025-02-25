
import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { Location, LATVIA_CENTER } from '../types';

export const useMap = () => {
  const map = useRef<mapboxgl.Map | null>(null);

  const updateLocationSource = async () => {
    if (!map.current) return [];

    // Get locations
    const { data: locations, error } = await supabase
      .from('locations')
      .select('latitude, longitude, user_id') as { data: Location[] | null, error: any };

    if (error) {
      console.error('Error fetching locations:', error);
      return [];
    }

    if (!locations) return [];

    // Get user profiles to identify companies
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, is_company, company_name');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }

    // Get active hot deals
    const now = new Date().toISOString();
    const { data: activeDeals, error: dealsError } = await supabase
      .from('hot_deals')
      .select('*')
      .lte('start_time', now) // Deal has started
      .gte(`start_time`, new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()); // Deal is not older than 5 hours

    if (dealsError) {
      console.error('Error fetching hot deals:', dealsError);
      return [];
    }

    // Filter deals that are still active based on their duration
    const currentTime = Date.now();
    const activeFilteredDeals = activeDeals?.filter(deal => {
      const startTime = new Date(deal.start_time).getTime();
      const endTime = startTime + (deal.duration_hours * 60 * 60 * 1000);
      return currentTime <= endTime;
    });

    // Map to track users with active deals
    const activeDealsMap = new Map();
    activeFilteredDeals?.forEach(deal => {
      activeDealsMap.set(deal.user_id, deal);
    });

    // Convert to profile lookup map
    const profilesMap = new Map();
    profiles?.forEach(profile => {
      profilesMap.set(profile.id, profile);
    });

    // Create GeoJSON features with company and active deal information
    const features = locations.map(location => {
      const profile = profilesMap.get(location.user_id);
      const hasActiveDeal = activeDealsMap.has(location.user_id);
      const activeDeal = activeDealsMap.get(location.user_id);

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        },
        properties: {
          user_id: location.user_id,
          is_company: profile?.is_company || false,
          company_name: profile?.company_name || '',
          has_active_deal: hasActiveDeal,
          deal_id: activeDeal?.id || null,
          deal_title: activeDeal?.title || null,
          deal_description: activeDeal?.description || null,
          deal_image_url: activeDeal?.image_url || null,
          deal_start_time: activeDeal?.start_time || null,
          deal_duration_hours: activeDeal?.duration_hours || null
        }
      };
    });

    const geoJson = {
      type: 'FeatureCollection',
      features
    };

    // Update source data if exists
    const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(geoJson as any);
    }
    
    return locations.map(loc => ({ user_id: loc.user_id! }));
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
