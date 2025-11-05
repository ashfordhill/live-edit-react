import React from 'react';

interface GridIconProps {
  title?: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

export function GridIcon({ title = 'Grid', size = 20, color = '#4a90e2', style }: GridIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      title={title}
      style={style}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
    </svg>
  );
}

export function NestedGridIcon({ title = 'Add nested grid', size = 16, color = '#888' }: GridIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      title={title}
    >
      <rect x="2" y="2" width="20" height="20" rx="1" />
      <line x1="8" y1="2" x2="8" y2="22" />
      <line x1="16" y1="2" x2="16" y2="22" />
      <line x1="2" y1="8" x2="22" y2="8" />
      <line x1="2" y1="16" x2="22" y2="16" />
      <circle cx="6" cy="6" r="1.5" fill={color} />
    </svg>
  );
}

export function FlexIcon({ title = 'Flex layout', size = 18, color = '#666' }: GridIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      title={title}
    >
      <rect x="3" y="4" width="6" height="14" rx="1" />
      <rect x="12" y="4" width="6" height="14" rx="1" />
      <line x1="9" y1="11" x2="12" y2="11" />
    </svg>
  );
}
