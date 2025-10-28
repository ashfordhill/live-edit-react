import React, { useRef } from 'react';
import { useLiveEdit } from './useLiveEdit';
import { LiveEditSlider, LiveEditPanel } from './LiveEditControls';

/**
 * Demo Component 3: TextBox with Opacity and Size Controls
 * 
 * Demonstrates live-editing multiple properties simultaneously.
 * Shows how the same pattern works for different CSS properties.
 */
export function TextBox() {
  const textRef = useRef<HTMLDivElement>(null);

  // Create live-editable controls for multiple properties
  const opacityControl = useLiveEdit(textRef, 'opacity', 100);
  const sizeControl = useLiveEdit(textRef, 'size', 24);
  return <div>
      <LiveEditPanel title="📝 TextBox Component - Opacity & Size">
        <LiveEditSlider label="Opacity" control={opacityControl} min={0} max={100} step={1} />
        <LiveEditSlider label="Size" control={sizeControl} min={12} max={72} step={1} />
      </LiveEditPanel>

      <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '40px'
    }}>
        <div ref={textRef} opacity={8} size={51} style={{
        fontSize: `${sizeControl.value}px`,
        opacity: opacityControl.value / 100,
        fontWeight: 'bold',
        color: '#FF5722',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#FFF3E0',
        transition: 'all 0.1s ease-out',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
          Live Editing!
        </div>
      </div>
    </div>;
}