
import React from 'react';
import { Check, Users, Building2, Wrench } from 'lucide-react';
import { MapFilters } from './types';

interface MapFilterProps {
  filters: MapFilters;
  onFilterChange: (filters: Partial<MapFilters>) => void;
}

export const MapFilter: React.FC<MapFilterProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="absolute top-3 left-3 bg-white rounded-md shadow-md p-2 z-10">
      <div className="text-sm font-semibold mb-1 px-1">Show on map:</div>
      
      <div className="space-y-1">
        <button 
          className={`flex items-center gap-2 px-2 py-1 rounded-md w-full text-left text-sm ${
            filters.showUsers ? 'bg-gray-100' : ''
          }`}
          onClick={() => onFilterChange({ showUsers: !filters.showUsers })}
        >
          <div className={`w-4 h-4 flex items-center justify-center rounded-sm border ${
            filters.showUsers ? 'bg-primary border-primary' : 'border-gray-300'
          }`}>
            {filters.showUsers && <Check className="h-3 w-3 text-white" />}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>Users</span>
          </div>
        </button>
        
        <button 
          className={`flex items-center gap-2 px-2 py-1 rounded-md w-full text-left text-sm ${
            filters.showBusinesses ? 'bg-gray-100' : ''
          }`}
          onClick={() => onFilterChange({ showBusinesses: !filters.showBusinesses })}
        >
          <div className={`w-4 h-4 flex items-center justify-center rounded-sm border ${
            filters.showBusinesses ? 'bg-primary border-primary' : 'border-gray-300'
          }`}>
            {filters.showBusinesses && <Check className="h-3 w-3 text-white" />}
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            <span>Businesses</span>
          </div>
        </button>
        
        <button 
          className={`flex items-center gap-2 px-2 py-1 rounded-md w-full text-left text-sm ${
            filters.showServices ? 'bg-gray-100' : ''
          }`}
          onClick={() => onFilterChange({ showServices: !filters.showServices })}
        >
          <div className={`w-4 h-4 flex items-center justify-center rounded-sm border ${
            filters.showServices ? 'bg-primary border-primary' : 'border-gray-300'
          }`}>
            {filters.showServices && <Check className="h-3 w-3 text-white" />}
          </div>
          <div className="flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5" />
            <span>Services</span>
          </div>
        </button>
      </div>
    </div>
  );
};
