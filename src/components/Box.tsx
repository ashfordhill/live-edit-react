import React from 'react';
import { useEditableProps } from '../hooks/useEditableProps';
import { useLiveEdit } from '../hooks/useLiveEdit';
import { useEditableOverlay } from '../hooks/useEditableOverlay';
import { EditOverlay } from './EditOverlay';

interface BoxProps {
  leId: string;
}

export function Box({ leId }: BoxProps) {
  const props = useEditableProps(leId);
  const { onChange: onSizeChange } = useLiveEdit(leId, 'size');
  const { onChange: onBgColorChange } = useLiveEdit(leId, 'bgColor');
  const { onChange: onBorderRadiusChange } = useLiveEdit(leId, 'borderRadius');
  const { onChange: onHasBorderChange } = useLiveEdit(leId, 'hasBorder');
  const { onChange: onBorderColorChange } = useLiveEdit(leId, 'borderColor');
  const { onChange: onBorderWidthChange } = useLiveEdit(leId, 'borderWidth');
  const { onChange: onOpacityChange } = useLiveEdit(leId, 'opacity');

  const { isOpen, overlayProps, handleContextMenu, closeOverlay } = useEditableOverlay();

  if (!props) {
    return <div>Loading...</div>;
  }

  const boxStyle: React.CSSProperties = {
    width: `${props.size}px`,
    height: `${props.size}px`,
    backgroundColor: props.bgColor,
    borderRadius: `${props.borderRadius}px`,
    border: props.hasBorder ? `${props.borderWidth}px solid ${props.borderColor}` : 'none',
    opacity: props.opacity / 100,
    cursor: 'context-menu',
    transition: 'all 0.2s ease-out',
  };

  return (
    <>
      <div
        style={boxStyle}
        data-le-id={leId}
        onContextMenu={handleContextMenu}
      />
      {isOpen && overlayProps && (
        <EditOverlay
          {...overlayProps}
          onPropertyChange={(prop, value) => {
            switch (prop) {
              case 'size':
                onSizeChange(value);
                break;
              case 'bgColor':
                onBgColorChange(value);
                break;
              case 'borderRadius':
                onBorderRadiusChange(value);
                break;
              case 'hasBorder':
                onHasBorderChange(value);
                break;
              case 'borderColor':
                onBorderColorChange(value);
                break;
              case 'borderWidth':
                onBorderWidthChange(value);
                break;
              case 'opacity':
                onOpacityChange(value);
                break;
            }
          }}
          onClose={closeOverlay}
        />
      )}
    </>
  );
}