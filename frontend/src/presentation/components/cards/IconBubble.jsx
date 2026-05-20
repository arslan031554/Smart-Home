import { memo } from 'react';

function IconBubble({
  className = 'mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald/10',
  icon: Icon,
  iconClassName = '',
  size = 24,
  strokeWidth = 1.8,
}) {
  if (!Icon) return null;

  return (
    <span className={className}>
      <Icon className={iconClassName} size={size} strokeWidth={strokeWidth} />
    </span>
  );
}

export default memo(IconBubble);
