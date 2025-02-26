
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useState, useEffect } from "react";

export type ActivityType = 'hot_deal' | 'new_user' | 'new_business';

export interface RecentActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  entity_id?: string;
}

// Convert database hot deals to activity items
const convertHotDealsToActivity = (deals: any[]): RecentActivity[] => {
  return deals.map(deal => ({
    id: deal.id,
    type: 'hot_deal',
    title: `New hot deal: ${deal.title}`,
    description: `${deal.company_name} posted a new deal`,
    timestamp: deal.created_at,
    icon: 'hot_deal',
    entity_id: deal.id
  }));
};

// This hook fetches recent activity based on user location
export const useRecentActivity = (maxItems: number = 5) => {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { userId } = useUserProfile();

  const fetchRecentActivity = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Fetch user's location
      const { data: locationData } = await supabase
        .from('locations')
        .select('latitude, longitude')
        .eq('user_id', userId)
        .single();

      if (!locationData) {
        // Add some sample data if no location is found
        const sampleActivities: RecentActivity[] = [
          {
            id: '1',
            type: 'hot_deal',
            title: 'New hot deal available',
            description: 'Coffee shop discount nearby',
            timestamp: new Date(Date.now() - 20 * 60000).toISOString(), // 20 minutes ago
            icon: 'hot_deal'
          },
          {
            id: '2',
            type: 'new_business',
            title: 'New business joined',
            description: 'Restaurant opened in your area',
            timestamp: new Date(Date.now() - 55 * 60000).toISOString(), // 55 minutes ago
            icon: 'new_business'
          },
          {
            id: '3',
            type: 'new_user',
            title: 'New users nearby',
            description: '3 people joined in your area',
            timestamp: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
            icon: 'new_user'
          }
        ];
        setActivities(sampleActivities);
        return;
      }
      
      const { latitude, longitude } = locationData;
      
      // Calculate a bounding box (approximately 5km radius)
      const latDelta = 0.045; // roughly 5km in latitude 
      const lngDelta = 0.045 / Math.cos(latitude * (Math.PI / 180)); // adjust for longitude
      
      // Fetch recent hot deals within the bounding box (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: hotDealsData, error: hotDealsError } = await supabase
        .from('hot_deals')
        .select('id, title, company_name, created_at')
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false });
        
      if (hotDealsError) throw hotDealsError;
      
      // Convert hot deals to activity items
      const hotDealsActivities = convertHotDealsToActivity(hotDealsData || []);
      
      // Here you would fetch other types of activity (new users, new businesses)
      // For now we'll just use some placeholder data for those
      const otherActivities: RecentActivity[] = [
        {
          id: 'new-users-1',
          type: 'new_user',
          title: 'New users nearby',
          description: '5 people joined in your area',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
          icon: 'new_user'
        },
        {
          id: 'new-business-1',
          type: 'new_business',
          title: 'New business opened',
          description: 'Cafe "Morning Brew" joined the platform',
          timestamp: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
          icon: 'new_business'
        }
      ];
      
      // Combine all activities, sort by timestamp, and limit to maxItems
      const allActivities = [...hotDealsActivities, ...otherActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, maxItems);
      
      setActivities(allActivities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load recent activity."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel('public:hot_deals')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'hot_deals' 
        }, 
        () => {
          fetchRecentActivity();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { activities, isLoading, refresh: fetchRecentActivity };
};
