import React from 'react';

interface GridEdgeZonesProps {
  hoverZone: 'bottom' | 'right' | 'bottom-right' | null;
  rows: number;
  cols: number;
}

export function GridEdgeZones({ hoverZone, rows: _rows, cols: _cols }: GridEdgeZonesProps) {
  const zoneSize = 40;

  const bottomZoneStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: zoneSize,
    height: `${zoneSize}px`,
    backgroundColor: hoverZone === 'bottom' ? 'rgba(66, 150, 255, 0.15)' : 'transparent',
    borderTop: hoverZone === 'bottom' ? '2px solid #4296ff' : 'none',
    transition: 'all 0.15s ease-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  };

  const rightZoneStyle: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: zoneSize,
    width: `${zoneSize}px`,
    backgroundColor: hoverZone === 'right' ? 'rgba(76, 175, 80, 0.15)' : 'transparent',
    borderLeft: hoverZone === 'right' ? '2px solid #4caf50' : 'none',
    transition: 'all 0.15s ease-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  };

  const cornerZoneStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: `${zoneSize}px`,
    height: `${zoneSize}px`,
    backgroundColor: hoverZone === 'bottom-right' ? 'rgba(236, 64, 122, 0.15)' : 'transparent',
    borderLeft: hoverZone === 'bottom-right' ? '2px solid #ec407a' : 'none',
    borderTop: hoverZone === 'bottom-right' ? '2px solid #ec407a' : 'none',
    transition: 'all 0.15s ease-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  };

  return (
    <>
      <div style={bottomZoneStyle}>
        {hoverZone === 'bottom' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#4296ff',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            <span>↓</span>
            <span>+Row</span>
          </div>
        )}
      </div>

      <div style={rightZoneStyle}>
        {hoverZone === 'right' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#4caf50',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            <span>→</span>
            <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>+Col</span>
          </div>
        )}
      </div>

      <div style={cornerZoneStyle}>
        {hoverZone === 'bottom-right' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ec407a',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            ↘
          </div>
        )}
      </div>
    </>
  );
}
