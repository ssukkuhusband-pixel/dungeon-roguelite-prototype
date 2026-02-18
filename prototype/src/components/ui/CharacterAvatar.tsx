'use client';

import React, { useState } from 'react';
import { CHARACTER_IMAGES } from '@/lib/constants';

interface CharacterAvatarProps {
  definitionId: string;
  emoji: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-3xl',
  xl: 'w-20 h-20 text-4xl',
};

export default function CharacterAvatar({
  definitionId,
  emoji,
  size = 'md',
  className = '',
}: CharacterAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const imagePath = CHARACTER_IMAGES[definitionId];

  if (!imagePath || imgError) {
    return (
      <span className={`${sizeMap[size]} flex items-center justify-center ${className}`}>
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={imagePath}
      alt={definitionId}
      onError={() => setImgError(true)}
      className={`${sizeMap[size]} object-contain ${className}`}
      draggable={false}
    />
  );
}
