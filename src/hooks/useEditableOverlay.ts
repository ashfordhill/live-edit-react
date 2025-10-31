import { useCallback, useState } from 'react';
import { useEditableConfig } from '../context/EditableConfigContext';
import { registry } from '../definitions/registry';

interface OverlayState {
  leId: string | null;
  position: { x: number; y: number };
  elementBounds?: DOMRect;
}

export function useEditableOverlay() {
  const { config } = useEditableConfig();
  const [overlayState, setOverlayState] = useState<OverlayState>({ leId: null, position: { x: 0, y: 0 } });

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const element = e.currentTarget;
      const leId = element.getAttribute('data-le-id');

      if (!leId || !config?.components[leId]) {
        return;
      }

      e.preventDefault();
      setOverlayState({
        leId,
        position: { x: e.clientX, y: e.clientY },
        elementBounds: element.getBoundingClientRect(),
      });
    },
    [config]
  );

  const closeOverlay = useCallback(() => {
    setOverlayState({ leId: null, position: { x: 0, y: 0 } });
  }, []);

  const getOverlayProps = useCallback(() => {
    if (!overlayState.leId || !config?.components[overlayState.leId]) {
      return null;
    }

    const componentConfig = config.components[overlayState.leId];
    const effectiveProps = registry.getEffectiveProperties(componentConfig.type);

    return {
      leId: overlayState.leId,
      componentType: componentConfig.type,
      properties: effectiveProps,
      values: componentConfig.props,
      position: overlayState.position,
      elementBounds: overlayState.elementBounds,
    };
  }, [overlayState.leId, overlayState.position, overlayState.elementBounds, config]);

  return {
    isOpen: overlayState.leId !== null,
    overlayProps: getOverlayProps(),
    handleContextMenu,
    closeOverlay,
  };
}
