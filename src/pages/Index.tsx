
import { useState } from "react";
import { Header } from "@/components/Header";
import { LocationCard } from "@/components/LocationCard";
import { RideOptions } from "@/components/RideOptions";
import { LocationActions } from "@/components/LocationActions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { TagIcon, Home, Search, Heart, User, Plus, Activity, UserCog } from "lucide-react";
import { HotDealDialog } from "@/components/map/HotDealDialog";
import { RecentActivityTimeline } from "@/components/map/recent-activity/RecentActivityTimeline";
import { RecentlyAddedBusinesses } from "@/components/map/RecentlyAddedBusinesses";
import { Link } from "react-router-dom";

const Index = () => {
  const { userName, isCompany } = useUserProfile();
  const [hotDealDialogOpen, setHotDealDialogOpen] = useState(false);
  const [showMobileActivity, setShowMobileActivity] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      
      <main className="pt-16 px-4 pb-4 mx-auto max-w-full lg:max-w-none lg:px-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left sidebar - only visible on large screens */}
          <div className="hidden lg:block lg:col-span-3 2xl:col-span-2">
            <div className="sticky top-20 space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                {userName && (
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Hi, {userName} 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Welcome back to your dashboard</p>
                  </div>
                )}
                
                {isCompany && (
                  <div className="space-y-3">
                    <Button
                      size="lg"
                      className="w-full instagram-gradient text-white font-medium py-3 transition-all hover:shadow-md"
                      onClick={() => setHotDealDialogOpen(true)}
                    >
                      <TagIcon className="mr-2 h-5 w-5" />
                      Manage hot deals
                    </Button>
                    
                    <Link to="/business/edit" className="block w-full">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full py-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                      >
                        <UserCog className="mr-2 h-5 w-5" />
                        Manage business profile
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Recently Added Businesses - Left Sidebar */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Recently Added Businesses</h2>
                <RecentlyAddedBusinesses />
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-6 2xl:col-span-8">
            {/* Mobile-only welcome message */}
            <div className="lg:hidden">
              {userName && (
                <div className="mb-4">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Hi, {userName} 👋
                  </h1>
                  <p className="text-gray-500 mt-1">Welcome back</p>
                </div>
              )}
              
              {isCompany && (
                <div className="space-y-3 mb-5">
                  <Button
                    size="lg"
                    className="w-full instagram-gradient text-white font-medium py-3 transition-all hover:shadow-md"
                    onClick={() => setHotDealDialogOpen(true)}
                  >
                    <TagIcon className="mr-2 h-5 w-5" />
                    Manage hot deals
                  </Button>
                  
                  <Link to="/business/edit" className="block w-full">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full py-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                      <UserCog className="mr-2 h-5 w-5" />
                      Manage business profile
                    </Button>
                  </Link>
                </div>
              )}
              
              {/* Recently Added Businesses - Mobile */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-5">
                <h2 className="text-base font-semibold mb-3">Recently Added Businesses</h2>
                <RecentlyAddedBusinesses />
              </div>
            </div>
            
            <div>
              <LocationCard />
              <div className="slide-up">
                <RideOptions />
              </div>
              
              {/* Mobile Recent Activity - Only visible on mobile when toggled */}
              <div className={`lg:hidden mt-4 ${showMobileActivity ? 'block' : 'hidden'}`}>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <RecentActivityTimeline />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right sidebar - only visible on large screens */}
          <div className="hidden lg:block lg:col-span-3 2xl:col-span-2">
            <div className="sticky top-20 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <RecentActivityTimeline />
            </div>
          </div>
        </div>
      </main>

      <LocationActions />
      
      {/* Instagram-style bottom navigation - only visible on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bottom-nav h-14 flex items-center justify-around px-4 z-40 lg:hidden">
        <Button variant="ghost" size="icon" className="text-gray-800">
          <Home className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-800">
          <Search className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="instagram-gradient text-white rounded-full h-8 w-8 flex items-center justify-center">
          <Plus className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-800"
          onClick={() => setShowMobileActivity(!showMobileActivity)}
        >
          <Activity className="h-6 w-6" />
        </Button>
        <Link to="/business/edit">
          <Button variant="ghost" size="icon" className="text-gray-800">
            <User className="h-6 w-6" />
          </Button>
        </Link>
      </div>
      
      <HotDealDialog 
        open={hotDealDialogOpen} 
        onOpenChange={setHotDealDialogOpen} 
      />
    </div>
  );
};

export default Index;
