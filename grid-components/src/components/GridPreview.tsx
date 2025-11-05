import React from 'react';

interface GridPreviewProps {
  rows: number;
  cols: number;
  gap: number;
  borderColor: string;
  isVisible: boolean;
  rowsChange?: number;
  colsChange?: number;
}

export function GridPreview({
  rows,
  cols,
  gap,
  borderColor,
  isVisible,
  rowsChange = 0,
  colsChange = 0,
}: GridPreviewProps) {
  if (!isVisible) return null;

  const displayRows = rows + rowsChange;
  const displayCols = cols + colsChange;

  const previewStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    display: 'grid',
    gridTemplateRows: `repeat(${displayRows}, 1fr)`,
    gridTemplateColumns: `repeat(${displayCols}, 1fr)`,
    gap: `${gap}px`,
    padding: '16px',
    boxSizing: 'border-box',
    zIndex: 5,
  };

  const newCellsStart = rows * cols;
  const totalCells = displayRows * displayCols;

  return (
    <div style={previewStyle}>
      {Array.from({ length: totalCells }).map((_, i) => {
        const isNew = i >= newCellsStart;
        return (
          <div
            key={i}
            style={{
              backgroundColor: isNew ? 'rgba(66, 133, 244, 0.2)' : 'transparent',
              border: isNew ? `2px dashed ${borderColor}` : 'none',
              borderRadius: '4px',
              transition: 'all 0.15s ease-out',
            }}
          />
        );
      })}
    </div>
  );
}
