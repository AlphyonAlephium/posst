
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MapFilterProps {
  showUsers: boolean;
  showBusinesses: boolean;
  onFilterChange: (filterType: 'users' | 'businesses', value: boolean) => void;
}

export const MapFilter: React.FC<MapFilterProps> = ({ 
  showUsers, 
  showBusinesses, 
  onFilterChange 
}) => {
  return (
    <div className="flex items-center justify-center gap-8 p-3 bg-background/80 backdrop-blur-sm rounded-md shadow-sm border border-border mb-4">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="show-users" 
          checked={showUsers} 
          onCheckedChange={(checked) => onFilterChange('users', checked as boolean)} 
        />
        <Label htmlFor="show-users" className="cursor-pointer">
          Show Users
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="show-businesses" 
          checked={showBusinesses} 
          onCheckedChange={(checked) => onFilterChange('businesses', checked as boolean)} 
        />
        <Label htmlFor="show-businesses" className="cursor-pointer">
          Show Businesses
        </Label>
      </div>
    </div>
  );
};
