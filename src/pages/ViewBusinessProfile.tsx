
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin, Phone, Globe, Clock, Truck, PenSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface BusinessProfileData {
  id: number;
  user_id: string;
  business_name: string;
  description: string | null;
  address: string | null;
  phone_number: string | null;
  website: string | null;
  open_hours: string | null;
  delivery_available: boolean;
  logo_url: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string | null;
}

const ViewBusinessProfile = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<BusinessProfileData | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      try {
        setLoading(true);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Fetch business profile
        const { data, error } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', businessId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setProfile(data as BusinessProfileData);
          setIsOwner(user?.id === data.user_id);
        }
      } catch (error) {
        console.error('Error fetching business profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load business profile"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [businessId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 px-4 max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-semibold mb-4">Business Not Found</h1>
          <p className="mb-6">The business profile you're looking for doesn't exist or may have been removed.</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      
      <main className="pt-16 pb-4">
        {/* Cover Image */}
        <div 
          className="w-full h-48 md:h-64 bg-gray-200 bg-center bg-cover"
          style={{
            backgroundImage: profile.cover_image_url 
              ? `url(${profile.cover_image_url})` 
              : 'url(https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80)'
          }}
        />

        <div className="max-w-4xl mx-auto px-4">
          {/* Business Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 -mt-16 relative z-10">
            <div className="flex flex-col md:flex-row p-6">
              {/* Logo */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-md mx-auto md:mx-0 -mt-16 md:mt-0 mb-4 md:mb-0 bg-white">
                <img 
                  src={profile.logo_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80'} 
                  alt={profile.business_name} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Business Name and Edit Button */}
              <div className="md:ml-6 flex-grow text-center md:text-left">
                <div className="flex flex-col md:flex-row justify-between items-center mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{profile.business_name}</h1>
                  
                  {isOwner && (
                    <Link to="/business/edit">
                      <Button className="mt-2 md:mt-0" variant="outline">
                        <PenSquare className="mr-1 h-4 w-4" />
                        Edit Profile
                      </Button>
                    </Link>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4">{profile.description || 'No description provided'}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                  {profile.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{profile.address}</span>
                    </div>
                  )}
                  
                  {profile.phone_number && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{profile.phone_number}</span>
                    </div>
                  )}
                  
                  {profile.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
                      <a 
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                  
                  {profile.open_hours && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{profile.open_hours}</span>
                    </div>
                  )}

                  {profile.delivery_available && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Truck className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Delivery Available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Future sections could be added here */}
          {/* For example: products/services, reviews, gallery, etc. */}
        </div>
      </main>
    </div>
  );
};

export default ViewBusinessProfile;
