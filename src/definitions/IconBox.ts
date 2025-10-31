import { EditableComponentDef } from './types';

export const IconBoxDef: EditableComponentDef = {
  name: 'IconBox',
  label: 'Icon Box',
  extends: 'Box',
  properties: {
    iconEmoji: {
      type: 'text',
      label: 'Icon Emoji',
      defaultValue: '⭐',
      category: 'appearance',
    },
    iconSize: {
      type: 'number',
      label: 'Icon Size',
      defaultValue: 32,
      min: 12,
      max: 128,
      step: 4,
      unit: 'px',
      category: 'appearance',
    },
    iconColor: {
      type: 'color',
      label: 'Icon Color',
      defaultValue: '#FFFFFF',
      category: 'appearance',
    },
    iconOpacity: {
      type: 'number',
      label: 'Icon Opacity',
      defaultValue: 100,
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      category: 'appearance',
    },
  },
};
