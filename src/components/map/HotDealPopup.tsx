
import React from 'react';
import { HotDeal } from './types';
import { X } from 'lucide-react';

interface HotDealPopupProps {
  deal: HotDeal;
  onClose: () => void;
}

export const HotDealPopup = ({ deal, onClose }: HotDealPopupProps) => {
  // Calculate if the deal is still active
  const startTime = new Date(deal.start_time);
  const endTime = new Date(startTime.getTime() + deal.duration_hours * 60 * 60 * 1000);
  const isActive = new Date() >= startTime && new Date() <= endTime;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden w-64">
      <div className="relative">
        <img 
          src={deal.image_url} 
          alt={deal.title} 
          className="w-full h-32 object-cover"
        />
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-opacity"
        >
          <X size={16} />
        </button>
        {isActive && (
          <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded-br-md">
            Active Now!
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-lg truncate">{deal.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{deal.company_name}</p>
        <p className="text-sm line-clamp-3">{deal.description}</p>
        <div className="mt-2 text-xs text-gray-500">
          {isActive ? (
            <p>Ends at {endTime.toLocaleTimeString()}</p>
          ) : (
            <p>Starts at {startTime.toLocaleTimeString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};
