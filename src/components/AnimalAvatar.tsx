import { memo } from 'react';
import { Animal } from '../data/animals';
import { AnimalAvatarState } from '../hooks/useAnimalState';

type AnimalAvatarSize = 'small' | 'medium' | 'large';

const stateStatus: Record<Exclude<AnimalAvatarState, 'celebrating'>, string> = {
  sleeping: 'Sleeping',
  stirring: 'Waking up',
  waking: 'Almost awake',
  awake: 'Ready!',
};

const stateBadge: Record<AnimalAvatarState, string> = {
  sleeping: 'Zzz',
  stirring: '...',
  waking: '💫',
  awake: '✨',
  celebrating: '🎉',
};

const stateEmojiOverride: Partial<Record<AnimalAvatarState, string>> = {
  sleeping: '😴',
  celebrating: '🎉',
};

const sizeClassMap: Record<AnimalAvatarSize, string> = {
  small: 'animal-avatar--small',
  medium: 'animal-avatar--medium',
  large: 'animal-avatar--large',
};

interface AnimalAvatarProps {
  animal: Animal;
  state: AnimalAvatarState;
  size?: AnimalAvatarSize;
  label?: string;
}

export const AnimalAvatar = memo(
  ({ animal, state, size = 'medium', label }: AnimalAvatarProps) => {
    const displayEmoji = stateEmojiOverride[state] ?? animal.emoji;
    const statusLabel =
      state === 'celebrating' ? 'Celebrating!' : stateStatus[state] ?? 'Happy!';

    return (
      <div
        className={`animal-avatar ${sizeClassMap[size]} animal-avatar--${state}`}
        aria-label={label ?? `${animal.name} is ${statusLabel.toLowerCase()}`}
      >
        <span className="animal-avatar__badge" aria-hidden="true">
          {stateBadge[state]}
        </span>
        <div className="animal-avatar__emoji" aria-hidden="true">
          {state === 'celebrating' ? `${displayEmoji}${animal.emoji}${displayEmoji}` : displayEmoji}
        </div>
        <div className="animal-avatar__name">{animal.name}</div>
        <div className="animal-avatar__status">{statusLabel}</div>
      </div>
    );
  },
);

AnimalAvatar.displayName = 'AnimalAvatar';
