import { useCallback } from 'react';
import { useEditableConfig } from '../context/EditableConfigContext';

async function sendConfigPatch(leId: string, prop: string, newValue: any) {
  try {
    const response = await fetch('/_liveedit/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leId, prop, newValue }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Live-edit patch failed:', errorText);
    }
  } catch (error) {
    console.error('Live-edit error:', error);
  }
}

export function useLiveEdit(leId: string, propName: string) {
  const { updateComponentProps } = useEditableConfig();

  const onChange = useCallback(
    (newValue: any) => {
      updateComponentProps(leId, { [propName]: newValue });
      sendConfigPatch(leId, propName, newValue);
    },
    [leId, propName, updateComponentProps]
  );

  return { onChange };
}