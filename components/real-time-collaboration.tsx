/**
 * Real-time Collaboration Component
 * Provides real-time collaboration features for the report designer
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Users, Eye, Edit3, MessageCircle, Bell } from 'lucide-react';

// Types
export interface User {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  activeField?: string;
}

export interface CollaborationData {
  users: User[];
  activities: Activity[];
  comments: Comment[];
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  target: string;
  timestamp: number;
  data?: any;
}

export interface Comment {
  id: string;
  userId: string;
  fieldId: string;
  content: string;
  timestamp: number;
  resolved: boolean;
}

// Context
const CollaborationContext = createContext<{
  collaborationData: CollaborationData;
  currentUser: User | null;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  addComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  updateUserCursor: (position: { x: number; y: number }) => void;
  setActiveField: (fieldId: string | null) => void;
} | null>(null);

// Provider Component
export const CollaborationProvider: React.FC<{
  children: React.ReactNode;
  onCollaborationUpdate?: (data: CollaborationData) => void;
  currentUserId?: string;
}> = ({ children, onCollaborationUpdate, currentUserId = 'user-1' }) => {
  const [collaborationData, setCollaborationData] = useState<CollaborationData>({
    users: [
      {
        id: 'user-1',
        name: 'You',
        color: '#3b82f6',
        cursor: { x: 0, y: 0 }
      },
      {
        id: 'user-2',
        name: 'Sarah Chen',
        color: '#10b981',
        cursor: { x: 100, y: 150 }
      },
      {
        id: 'user-3',
        name: 'Mike Johnson',
        color: '#f59e0b',
        cursor: { x: 200, y: 300 }
      }
    ],
    activities: [],
    comments: []
  });

  const [currentUser, setCurrentUser] = useState<User | null>(
    collaborationData.users.find(u => u.id === currentUserId) || null
  );

  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random()}`,
      timestamp: Date.now()
    };

    setCollaborationData(prev => ({
      ...prev,
      activities: [newActivity, ...prev.activities].slice(0, 50) // Keep last 50 activities
    }));
  }, []);

  const addComment = useCallback((comment: Omit<Comment, 'id' | 'timestamp'>) => {
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      resolved: false
    };

    setCollaborationData(prev => ({
      ...prev,
      comments: [...prev.comments, newComment]
    }));
  }, []);

  const updateUserCursor = useCallback((position: { x: number; y: number }) => {
    if (!currentUser) return;

    setCollaborationData(prev => ({
      ...prev,
      users: prev.users.map(user =>
        user.id === currentUser.id
          ? { ...user, cursor: position }
          : user
      )
    }));
  }, [currentUser]);

  const setActiveField = useCallback((fieldId: string | null) => {
    if (!currentUser) return;

    setCollaborationData(prev => ({
      ...prev,
      users: prev.users.map(user =>
        user.id === currentUser.id
          ? { ...user, activeField: fieldId || undefined }
          : user
      )
    }));

    if (fieldId) {
      addActivity({
        userId: currentUser.id,
        action: 'field_selected',
        target: fieldId
      });
    }
  }, [currentUser, addActivity]);

  useEffect(() => {
    if (onCollaborationUpdate) {
      onCollaborationUpdate(collaborationData);
    }
  }, [collaborationData, onCollaborationUpdate]);

  return (
    <CollaborationContext.Provider value={{
      collaborationData,
      currentUser,
      addActivity,
      addComment,
      updateUserCursor,
      setActiveField
    }}>
      {children}
    </CollaborationContext.Provider>
  );
};

// Hook
export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

// Collaboration Panel Component
export const CollaborationPanel: React.FC<{
  isVisible: boolean;
  onToggle: () => void;
}> = ({ isVisible, onToggle }) => {
  const { collaborationData, addComment } = useCollaboration();
  const [commentText, setCommentText] = useState('');
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');

  const handleAddComment = () => {
    if (commentText.trim() && selectedFieldId) {      addComment({
        userId: 'user-1',
        fieldId: selectedFieldId,
        content: commentText.trim(),
        resolved: false
      });
      setCommentText('');
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
        title="Show Collaboration Panel"
      >
        <Users size={20} />
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Users size={16} />
          Collaboration
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {/* Active Users */}
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Users</h4>
          <div className="space-y-2">
            {collaborationData.users.map(user => (
              <div key={user.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="text-sm text-gray-600">{user.name}</span>
                {user.activeField && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Edit3 size={10} />
                    editing
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {collaborationData.activities.slice(0, 5).map(activity => {
              const user = collaborationData.users.find(u => u.id === activity.userId);
              return (
                <div key={activity.id} className="text-xs text-gray-500">
                  <span style={{ color: user?.color }}>{user?.name}</span> {activity.action.replace('_', ' ')} {activity.target}
                  <div className="text-gray-400">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comments */}
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
          
          {/* Add Comment */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Field ID"
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
              className="w-full p-2 text-xs border border-gray-200 rounded mb-2"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 p-2 text-xs border border-gray-200 rounded"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim() || !selectedFieldId}
                className="px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
              >
                <MessageCircle size={12} />
              </button>
            </div>
          </div>

          {/* Comment List */}
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {collaborationData.comments.map(comment => {
              const user = collaborationData.users.find(u => u.id === comment.userId);
              return (
                <div key={comment.id} className="bg-gray-50 p-2 rounded text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: user?.color }} className="font-medium">
                      {user?.name}
                    </span>
                    <span className="text-gray-400">
                      {comment.fieldId}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                  <div className="text-gray-400 mt-1">
                    {new Date(comment.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// User Cursors Component
export const UserCursors: React.FC = () => {
  const { collaborationData, currentUser } = useCollaboration();

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {collaborationData.users
        .filter(user => user.id !== currentUser?.id && user.cursor)
        .map(user => (
          <div
            key={user.id}
            className="absolute transition-all duration-200 ease-out"
            style={{
              left: user.cursor!.x,
              top: user.cursor!.y,
              transform: 'translate(-2px, -2px)'
            }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: user.color }}
            />
            <div
              className="mt-1 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </div>
          </div>
        ))}
    </div>
  );
};

// Activity Indicator Component
export const ActivityIndicator: React.FC<{
  fieldId: string;
  className?: string;
}> = ({ fieldId, className = '' }) => {
  const { collaborationData } = useCollaboration();
  
  const activeUsers = collaborationData.users.filter(
    user => user.activeField === fieldId
  );

  if (activeUsers.length === 0) return null;

  return (
    <div className={`absolute -top-2 -right-2 flex -space-x-1 ${className}`}>
      {activeUsers.map(user => (
        <div
          key={user.id}
          className="w-4 h-4 rounded-full border-2 border-white shadow-sm animate-pulse"
          style={{ backgroundColor: user.color }}
          title={`${user.name} is editing this field`}
        />
      ))}
    </div>
  );
};

export default CollaborationProvider;
