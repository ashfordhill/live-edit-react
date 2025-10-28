import React from 'react';
import type { LiveEditControl } from './useLiveEdit';

type SliderProps = {
  label: string;
  control: LiveEditControl;
  min?: number;
  max?: number;
  step?: number;
};

/**
 * A reusable slider control for live-editing numeric properties
 */
export function LiveEditSlider({ label, control, min = 0, max = 100, step = 1 }: SliderProps) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        <span style={{ minWidth: '100px', color: '#666' }}>{label}:</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={control.value}
          onChange={(e) => control.onChange(Number(e.target.value))}
          style={{ flex: 1, cursor: 'pointer' }}
        />
        <span style={{ 
          minWidth: '50px', 
          textAlign: 'right',
          fontWeight: 'bold',
          color: '#000'
        }}>
          {control.value}
        </span>
      </label>
    </div>
  );
}

/**
 * Container for grouping live-edit controls
 */
export function LiveEditPanel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div style={{
      padding: '16px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      marginBottom: '20px'
    }}>
      <h3 style={{ 
        margin: '0 0 12px 0', 
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#333'
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}