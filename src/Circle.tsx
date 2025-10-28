import React, { useRef } from 'react';
import { useLiveEdit } from './useLiveEdit';
import { LiveEditSlider, LiveEditPanel } from './LiveEditControls';

/**
 * Demo Component 2: Circle with Rotation Control
 * 
 * Demonstrates live-editing of rotation property.
 * The rotation value in the source code updates as you interact with the slider.
 */
export function Circle() {
  const circleRef = useRef<HTMLDivElement>(null);

  // Create a live-editable control for the 'rotation' property
  const rotationControl = useLiveEdit(circleRef, 'rotation', 0);
  return <div>
      <LiveEditPanel title="🔵 Circle Component - Rotation">
        <LiveEditSlider label="Rotation" control={rotationControl} min={0} max={360} step={1} />
      </LiveEditPanel>

      <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '40px'
    }}>
        <div ref={circleRef} rotation={274} style={{
        width: '120px',
        height: '120px',
        backgroundColor: '#2196F3',
        borderRadius: '50%',
        transform: `rotate(${rotationControl.value}deg)`,
        transition: 'transform 0.1s ease-out',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
          {/* Visual indicator to see rotation */}
          <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          width: '4px',
          height: '40px',
          backgroundColor: 'white',
          transform: 'translateX(-50%)'
        }} />
        </div>
      </div>
    </div>;
}