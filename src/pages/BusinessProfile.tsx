
import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "@/components/map/FileUpload";
import { Loader2 } from "lucide-react";

const BusinessProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [openHours, setOpenHours] = useState("");
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to update your business profile"
        });
        setLoading(false);
        return;
      }

      let logoUrl = "";
      let coverImageUrl = "";

      // Upload logo if selected
      if (logoFile) {
        const logoFileName = `${user.id}_logo_${Date.now()}`;
        const { data: logoData, error: logoError } = await supabase.storage
          .from('business_profiles')
          .upload(logoFileName, logoFile);

        if (logoError) {
          throw logoError;
        }

        const { data: logoUrlData } = await supabase.storage
          .from('business_profiles')
          .getPublicUrl(logoFileName);
        
        logoUrl = logoUrlData.publicUrl;
      }

      // Upload cover image if selected
      if (coverImageFile) {
        const coverFileName = `${user.id}_cover_${Date.now()}`;
        const { data: coverData, error: coverError } = await supabase.storage
          .from('business_profiles')
          .upload(coverFileName, coverImageFile);

        if (coverError) {
          throw coverError;
        }

        const { data: coverUrlData } = await supabase.storage
          .from('business_profiles')
          .getPublicUrl(coverFileName);
        
        coverImageUrl = coverUrlData.publicUrl;
      }

      // Check if business profile already exists
      const { data: existingProfile } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Update or insert business profile
      if (existingProfile) {
        const { error: updateError } = await supabase
          .from('business_profiles')
          .update({
            business_name: businessName,
            description,
            address,
            phone_number: phoneNumber,
            website,
            open_hours: openHours,
            delivery_available: deliveryAvailable,
            logo_url: logoUrl || existingProfile.logo_url,
            cover_image_url: coverImageUrl || existingProfile.cover_image_url,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('business_profiles')
          .insert({
            user_id: user.id,
            business_name: businessName,
            description,
            address,
            phone_number: phoneNumber,
            website,
            open_hours: openHours,
            delivery_available: deliveryAvailable,
            logo_url: logoUrl,
            cover_image_url: coverImageUrl
          });

        if (insertError) throw insertError;
      }

      // Update profiles table to ensure is_company is set
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_company: true,
          company_name: businessName
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Your business profile has been updated"
      });

      navigate('/');
    } catch (error) {
      console.error('Error updating business profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update your business profile. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing profile data on component mount
  useState(() => {
    const fetchBusinessProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        const { data: profile } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setBusinessName(profile.business_name || "");
          setDescription(profile.description || "");
          setAddress(profile.address || "");
          setPhoneNumber(profile.phone_number || "");
          setWebsite(profile.website || "");
          setOpenHours(profile.open_hours || "");
          setDeliveryAvailable(profile.delivery_available || false);
        }
      } catch (error) {
        console.error('Error fetching business profile:', error);
      }
    };

    fetchBusinessProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      
      <main className="pt-20 px-4 pb-4 max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-semibold mb-6">Business Profile</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  placeholder="Your business name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell customers about your business"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your business address"
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourbusiness.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="openHours">Opening Hours</Label>
                <Input
                  id="openHours"
                  value={openHours}
                  onChange={(e) => setOpenHours(e.target.value)}
                  placeholder="Mon-Fri: 9am-5pm"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="deliveryAvailable"
                checked={deliveryAvailable}
                onCheckedChange={(checked) => 
                  setDeliveryAvailable(checked as boolean)
                }
              />
              <Label htmlFor="deliveryAvailable" className="cursor-pointer">
                Delivery Available
              </Label>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Business Logo</Label>
                <FileUpload
                  onFileSelect={setLogoFile}
                  fileInputRef={logoInputRef}
                />
                <p className="text-sm text-muted-foreground">
                  Square image recommended (1:1 ratio)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <FileUpload
                  onFileSelect={setCoverImageFile}
                  fileInputRef={coverImageInputRef}
                />
                <p className="text-sm text-muted-foreground">
                  Wide image recommended (16:9 ratio)
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BusinessProfile;
