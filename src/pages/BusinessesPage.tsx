
import { Header } from "@/components/Header";
import { RecentlyAddedBusinesses } from "@/components/map/RecentlyAddedBusinesses";
import { Building } from "lucide-react";

const BusinessesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      
      <main className="pt-20 px-4 pb-20 mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Building className="h-5 w-5 text-gray-700" />
            <h1 className="text-xl font-semibold text-gray-900">
              Recently Added Businesses
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            Discover the latest businesses that have joined our platform
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <RecentlyAddedBusinesses showMore={true} />
        </div>
      </main>
    </div>
  );
};

export default BusinessesPage;
