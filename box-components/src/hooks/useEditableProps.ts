import { useMemo } from 'react';
import { useEditableConfig } from '../context/EditableConfigContext';
import { registry } from '../definitions/registry';

export function useEditableProps(leId: string) {
  const { config } = useEditableConfig();

  return useMemo(() => {
    if (!config) {
      console.warn(`EditableConfig not loaded yet for component ${leId}`);
      return null;
    }

    if (!config.components[leId]) {
      console.warn(`Component not found in config: ${leId}`);
      return null;
    }

    try {
      const componentConfig = config.components[leId];
      
      if (!componentConfig.type) {
        console.error(`Component ${leId} missing type property`);
        return null;
      }

      const effectiveProps = registry.getEffectiveProperties(componentConfig.type);
      const props: Record<string, any> = {};

      Object.entries(effectiveProps).forEach(([key, definition]) => {
        const value = componentConfig.props[key];
        props[key] = value !== undefined ? value : definition.defaultValue;
      });

      return props;
    } catch (error) {
      console.error(`Error loading props for component ${leId}:`, error);
      return null;
    }
  }, [leId, config]);
}
