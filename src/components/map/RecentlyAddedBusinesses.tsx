
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BusinessProfile } from "./types";

export const RecentlyAddedBusinesses = () => {
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentBusinesses = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('business_profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) {
          throw error;
        }
        
        setBusinesses(data || []);
      } catch (error) {
        console.error("Error fetching recent businesses:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentBusinesses();
  }, []);

  // Helper function to get public URL for images
  const getPublicUrl = (path: string | null) => {
    if (!path) return null;
    
    // Handle full URLs (e.g. URLs that start with http:// or https://)
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // For relative paths, get the public URL from Supabase
    const { data } = supabase.storage.from('business_profiles').getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No businesses added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {businesses.map((business) => (
        <Link key={business.id} to={`/business/${business.user_id}`}>
          <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  {business.logo_url ? (
                    <img 
                      src={getPublicUrl(business.logo_url)}
                      alt={business.business_name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-gray-400"><path d="M6 9v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3"/><circle cx="9" cy="6" r="2"/><path d="M14.5 3.5C16.5 5.5 17 7 17 8.5c0 1.5-.5 3-2.5 5C12.5 11.5 12 10 12 8.5c0-1.5.5-3 2.5-5Z"/></svg>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Building className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {business.business_name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {business.description || "No description available"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};
