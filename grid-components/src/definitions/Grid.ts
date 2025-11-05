import { EditableComponentDef } from './types';

export const GridDef: EditableComponentDef = {
  name: 'Grid',
  label: 'Interactive Grid',
  properties: {
    rows: {
      type: 'number',
      label: 'Rows',
      defaultValue: 2,
      min: 1,
      max: 20,
      step: 1,
      category: 'layout',
    },
    cols: {
      type: 'number',
      label: 'Columns',
      defaultValue: 2,
      min: 1,
      max: 20,
      step: 1,
      category: 'layout',
    },
    gap: {
      type: 'number',
      label: 'Gap',
      defaultValue: 8,
      min: 0,
      max: 50,
      step: 1,
      unit: 'px',
      category: 'layout',
    },
    bgColor: {
      type: 'color',
      label: 'Background Color',
      defaultValue: 'transparent',
      category: 'appearance',
    },
    borderColor: {
      type: 'color',
      label: 'Grid Line Color',
      defaultValue: '#d0d0d0',
      category: 'appearance',
    },
    showGridLines: {
      type: 'boolean',
      label: 'Show Grid Lines',
      defaultValue: true,
      category: 'appearance',
    },
    cellWidth: {
      type: 'string',
      label: 'Cell Width',
      defaultValue: 'auto',
      category: 'cell',
    },
    cellHeight: {
      type: 'string',
      label: 'Cell Height',
      defaultValue: 'auto',
      category: 'cell',
    },
  },
};
