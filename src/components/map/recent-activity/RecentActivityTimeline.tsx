
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useRecentActivity } from './recentActivityService';
import { Heart, User, Store, TagIcon, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RecentActivityTimelineProps {
  className?: string;
}

export const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({ 
  className = "" 
}) => {
  const { activities, isLoading, refresh } = useRecentActivity();

  const getIcon = (type: string) => {
    switch (type) {
      case 'hot_deal':
        return <TagIcon className="h-5 w-5 text-pink-500" />;
      case 'new_user':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'new_business':
        return <Store className="h-5 w-5 text-orange-500" />;
      default:
        return <Heart className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'hot_deal':
        return 'bg-pink-100';
      case 'new_user':
        return 'bg-blue-100';
      case 'new_business':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className={`${className} p-4 space-y-3`}>
        <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={`${className} p-4 text-center text-gray-500`}>
        <p className="mb-2">No recent activity found.</p>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg">Recent Activity</h2>
        <Button variant="ghost" size="sm" onClick={refresh} className="h-7 px-2">
          <RefreshCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex group hover:bg-gray-50 rounded-lg p-2 transition-colors">
            <div className={`w-10 h-10 rounded-full ${getBackgroundColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
              {getIcon(activity.type)}
            </div>
            
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">{activity.title}</p>
              <p className="text-xs text-gray-500 line-clamp-1">{activity.description}</p>
              <div className="flex items-center mt-1">
                <time className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </time>
                {activity.type === 'hot_deal' && (
                  <Badge variant="outline" className="ml-2 text-[10px] py-0 h-4 bg-pink-50 text-pink-700 border-pink-200">
                    Hot Deal
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
