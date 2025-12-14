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

const getAvatarImageForState = (animal: Animal, state: AnimalAvatarState): string | undefined => {
  const images = animal.avatarImages;
  if (!images) return undefined;
  if (images[state]) return images[state];

  // Fallbacks allow near-by poses to reuse artwork without gaps.
  if (state === 'stirring') {
    return images.sleeping ?? images.waking ?? images.awake;
  }
  if (state === 'waking') {
    return images.waking ?? images.awake;
  }
  if (state === 'celebrating') {
    return images.celebrating ?? images.awake;
  }
  return images.awake ?? Object.values(images)[0];
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
    const portraitSrc = getAvatarImageForState(animal, state);

    return (
      <div
        className={`animal-avatar ${sizeClassMap[size]} animal-avatar--${state}`}
        aria-label={label ?? `${animal.name} is ${statusLabel.toLowerCase()}`}
      >
        <span className="animal-avatar__badge" aria-hidden="true">
          {stateBadge[state]}
        </span>
        <div className="animal-avatar__figure" aria-hidden="true">
          {portraitSrc ? (
            <img
              className="animal-avatar__image"
              src={portraitSrc}
              alt=""
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="animal-avatar__emoji">
              {state === 'celebrating'
                ? `${displayEmoji}${animal.emoji}${displayEmoji}`
                : displayEmoji}
            </div>
          )}
        </div>
        <div className="animal-avatar__name">{animal.name}</div>
      </div>
    );
  },
);

AnimalAvatar.displayName = 'AnimalAvatar';
