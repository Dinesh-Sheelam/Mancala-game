import { useState, useEffect, useId } from 'react';
import { useUserStore } from '../../store/userStore';

export default function ProfileSection() {
  const name = useUserStore((state) => state.name);
  const setName = useUserStore((state) => state.setName);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const gradientId = useId();

  // Update editName when name changes externally
  useEffect(() => {
    setEditName(name);
  }, [name]);

  const handleSave = () => {
    if (editName.trim() && editName.trim().length >= 2) {
      setName(editName.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditName(name);
    setIsEditing(false);
  };

  return (
    <div className="absolute top-6 left-6 flex flex-col items-center gap-3 z-50">
      {/* Profile Icon with Edit Symbol */}
      <div className="relative">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('Profile icon clicked');
            setIsEditing(true);
          }}
          style={{ pointerEvents: 'auto' }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
          </defs>
          {/* User Profile Silhouette */}
          <circle cx="32" cy="20" r="10" fill={`url(#${gradientId})`} />
          <path
            d="M16 48 C16 40, 20 36, 32 36 C44 36, 48 40, 48 48"
            fill={`url(#${gradientId})`}
            stroke={`url(#${gradientId})`}
            strokeWidth="2"
          />
          {/* Edit Pencil Icon */}
          <path
            d="M42 22 L46 18 L48 20 L44 24 L42 22 Z"
            fill={`url(#${gradientId})`}
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="44"
            y1="24"
            x2="48"
            y2="20"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Player Name */}
      {isEditing ? (
        <div className="flex flex-col gap-2 bg-white/10 backdrop-blur-lg rounded-xl p-3 min-w-[200px]">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            maxLength={20}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <p className="text-white font-semibold text-lg text-center">{name}</p>
        </div>
      )}
    </div>
  );
}
