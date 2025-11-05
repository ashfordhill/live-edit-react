import React from 'react';

interface GridCellProps {
  children?: React.ReactNode;
  cellIndex?: number;
  editMode?: boolean;
}

export function GridCell({ 
  children, 
  cellIndex = 0,
  editMode = true,
}: GridCellProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        padding: 0,
        backgroundColor: editMode ? '#2d3748' : 'transparent',
        border: editMode ? '1px solid #4a5568' : 'none',
        borderRadius: editMode ? '4px' : '0px',
        minHeight: '100px',
        position: 'relative',
      }}
    >
      {children || (
        editMode && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              fontSize: '12px',
              color: '#ccc',
            }}
          >
            <span style={{ opacity: 0.5 }}>Cell {cellIndex + 1}</span>
          </div>
        )
      )}
    </div>
  );
}
