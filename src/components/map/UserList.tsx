
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { NearbyUser } from './types';

interface UserListProps {
  users: NearbyUser[];
  selectedUserIds: string[];
  onUserSelect: (userIds: string[]) => void;
}

export const UserList = ({ users, selectedUserIds, onUserSelect }: UserListProps) => {
  return (
    <div className="space-y-2">
      <Label>Select Recipients</Label>
      <div className="grid gap-2 p-4 border rounded-lg max-h-[150px] overflow-y-auto">
        {users.map((user) => {
          const userId = user.user_id;
          return (
            <div key={userId} className="flex items-center space-x-2">
              <Checkbox
                id={userId}
                checked={selectedUserIds.includes(userId)}
                onCheckedChange={(checked) => {
                  onUserSelect(
                    checked 
                      ? [...selectedUserIds, userId]
                      : selectedUserIds.filter(id => id !== userId)
                  );
                }}
              />
              <Label htmlFor={userId}>User {userId.slice(0, 8)}...</Label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
