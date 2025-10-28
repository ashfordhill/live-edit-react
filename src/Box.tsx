import React, { useRef } from 'react';
import { useLiveEdit } from './useLiveEdit';
import { LiveEditSlider, LiveEditPanel } from './LiveEditControls';

/**
 * Demo Component 1: Box with Scale Control
 * 
 * Demonstrates live-editing of transform scale property.
 * As you drag the slider, the scale prop updates in the source code.
 */
export function Box() {
  const boxRef = useRef<HTMLDivElement>(null);

  // Create a live-editable control for the 'scale' property
  const scaleControl = useLiveEdit(boxRef, 'scale', 100);
  return <div>
      <LiveEditPanel title="📦 Box Component - Scale">
        <LiveEditSlider label="Scale" control={scaleControl} min={10} max={200} step={1} />
      </LiveEditPanel>

      <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '40px'
    }}>
        <div ref={boxRef} scale={98} style={{
        width: '100px',
        height: '100px',
        backgroundColor: '#4CAF50',
        borderRadius: '8px',
        transform: `scale(${scaleControl.value / 100})`,
        transition: 'transform 0.1s ease-out',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }} />
      </div>
    </div>;
}