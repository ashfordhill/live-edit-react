import { useEditableConfig } from '../context/EditableConfigContext';

export function useEditableProps(leId: string) {
  const { config } = useEditableConfig();

  if (!config || !config.components[leId]) {
    return null;
  }

  return config.components[leId].props;
}
