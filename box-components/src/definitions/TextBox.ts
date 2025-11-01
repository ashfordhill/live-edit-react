import { EditableComponentDef } from './types';

export const TextBoxDef: EditableComponentDef = {
  name: 'TextBox',
  label: 'Text Box',
  extends: 'Box',
  properties: {
    fontSize: {
      type: 'number',
      label: 'Font Size',
      defaultValue: 24,
      min: 12,
      max: 96,
      step: 2,
      unit: 'px',
      category: 'typography',
    },
    fontFamily: {
      type: 'select',
      label: 'Font Family',
      defaultValue: 'sans-serif',
      category: 'typography',
      options: [
        { label: 'Sans Serif', value: 'sans-serif' },
        { label: 'Serif', value: 'serif' },
        { label: 'Monospace', value: 'monospace' },
      ],
    },
    textColor: {
      type: 'color',
      label: 'Text Color',
      defaultValue: '#000000',
      category: 'appearance',
    },
    fontWeight: {
      type: 'select',
      label: 'Font Weight',
      defaultValue: 'normal',
      category: 'typography',
      options: [
        { label: 'Light', value: 300 },
        { label: 'Normal', value: 400 },
        { label: 'Bold', value: 700 },
      ],
    },
    textAlign: {
      type: 'select',
      label: 'Text Align',
      defaultValue: 'center',
      category: 'typography',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  },
};
