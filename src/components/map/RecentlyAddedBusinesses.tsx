
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BusinessProfile } from "./types";

interface RecentlyAddedBusinessesProps {
  showMore?: boolean;
}

export const RecentlyAddedBusinesses = ({ showMore = false }: RecentlyAddedBusinessesProps) => {
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
          .limit(showMore ? 20 : 5);
          
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
  }, [showMore]);

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
                      src={business.logo_url} 
                      alt={business.business_name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
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
