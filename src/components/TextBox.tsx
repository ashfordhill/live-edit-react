import React from 'react';
import { useEditableProps } from '../hooks/useEditableProps';
import { useLiveEdit } from '../hooks/useLiveEdit';
import { useEditableOverlay } from '../hooks/useEditableOverlay';
import { EditOverlay } from './EditOverlay';

interface TextBoxProps {
  leId: string;
}

export function TextBox({ leId }: TextBoxProps) {
  const props = useEditableProps(leId);
  const { onChange: onSizeChange } = useLiveEdit(leId, 'size');
  const { onChange: onBgColorChange } = useLiveEdit(leId, 'bgColor');
  const { onChange: onBorderRadiusChange } = useLiveEdit(leId, 'borderRadius');
  const { onChange: onHasBorderChange } = useLiveEdit(leId, 'hasBorder');
  const { onChange: onBorderColorChange } = useLiveEdit(leId, 'borderColor');
  const { onChange: onBorderWidthChange } = useLiveEdit(leId, 'borderWidth');
  const { onChange: onOpacityChange } = useLiveEdit(leId, 'opacity');
  const { onChange: onFontSizeChange } = useLiveEdit(leId, 'fontSize');
  const { onChange: onFontFamilyChange } = useLiveEdit(leId, 'fontFamily');
  const { onChange: onTextColorChange } = useLiveEdit(leId, 'textColor');
  const { onChange: onFontWeightChange } = useLiveEdit(leId, 'fontWeight');
  const { onChange: onTextAlignChange } = useLiveEdit(leId, 'textAlign');

  const { isOpen, overlayProps, handleContextMenu, closeOverlay } = useEditableOverlay();

  if (!props) {
    return <div>Loading...</div>;
  }

  const textBoxStyle: React.CSSProperties = {
    width: `${props.size}px`,
    minHeight: `${props.size}px`,
    backgroundColor: props.bgColor,
    borderRadius: `${props.borderRadius}px`,
    border: props.hasBorder ? `${props.borderWidth}px solid ${props.borderColor}` : 'none',
    opacity: props.opacity / 100,
    padding: '12px',
    fontSize: `${props.fontSize}px`,
    fontFamily: props.fontFamily,
    color: props.textColor,
    fontWeight: props.fontWeight,
    textAlign: props.textAlign as any,
    cursor: 'context-menu',
    transition: 'all 0.2s ease-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <>
      <div
        style={textBoxStyle}
        data-le-id={leId}
        onContextMenu={handleContextMenu}
      >
        Sample Text
      </div>
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
              case 'fontSize':
                onFontSizeChange(value);
                break;
              case 'fontFamily':
                onFontFamilyChange(value);
                break;
              case 'textColor':
                onTextColorChange(value);
                break;
              case 'fontWeight':
                onFontWeightChange(value);
                break;
              case 'textAlign':
                onTextAlignChange(value);
                break;
            }
          }}
          onClose={closeOverlay}
        />
      )}
    </>
  );
}