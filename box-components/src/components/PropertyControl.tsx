import React from 'react';
import { EditableProperty } from '../definitions/types';

interface PropertyControlProps {
  property: EditableProperty;
  value: any;
  onChange: (value: any) => void;
  isVisible?: boolean;
}

export function PropertyControl({
  property,
  value,
  onChange,
  isVisible = true,
}: PropertyControlProps) {
  if (!isVisible) return null;

  const baseStyle: React.CSSProperties = {
    marginBottom: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 500,
    color: '#333',
  };

  return (
    <div style={baseStyle}>
      <label style={labelStyle}>{property.label}</label>

      {property.type === 'number' && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="range"
            min={property.min ?? 0}
            max={property.max ?? 100}
            step={property.step ?? 1}
            value={value ?? property.defaultValue}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{ flex: 1, minWidth: 0 }}
          />
          <span
            style={{
              fontSize: '12px',
              color: '#666',
              minWidth: '40px',
              textAlign: 'right',
            }}
          >
            {value ?? property.defaultValue}
            {property.unit ? ` ${property.unit}` : ''}
          </span>
        </div>
      )}

      {property.type === 'color' && (
        <input
          type="color"
          value={value ?? property.defaultValue}
          onChange={(e) => onChange(e.target.value)}
          style={{ height: '32px', cursor: 'pointer' }}
        />
      )}

      {property.type === 'boolean' && (
        <input
          type="checkbox"
          checked={value ?? property.defaultValue}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
      )}

      {property.type === 'text' && (
        <input
          type="text"
          value={value ?? property.defaultValue}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: '6px 8px',
            fontSize: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
      )}

      {property.type === 'select' && property.options && (
        <select
          value={value ?? property.defaultValue}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: '6px 8px',
            fontSize: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        >
          {property.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
