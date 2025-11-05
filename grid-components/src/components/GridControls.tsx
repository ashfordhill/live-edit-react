import React from 'react';

interface GridControlsProps {
  isHovered: boolean;
  rows: number;
  cols: number;
  onAddRow: () => void;
  onAddCol: () => void;
  onRemoveRow: () => void;
  onRemoveCol: () => void;
}

export function GridControls({
  isHovered,
  rows,
  cols,
  onAddRow,
  onAddCol,
  onRemoveRow,
  onRemoveCol,
}: GridControlsProps) {
  if (!isHovered) return null;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '-32px',
          height: '28px',
          right: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          pointerEvents: 'auto',
          padding: '0 4px',
        }}
      >
        <button
          onClick={onAddCol}
          style={{
            padding: '4px 12px',
            backgroundColor: '#fff',
            border: '1px solid #d0d0d0',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            color: '#333',
          }}
          title="Add column"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
            e.currentTarget.style.borderColor = '#999';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.borderColor = '#d0d0d0';
          }}
        >
          + Col
        </button>
        {cols > 1 && (
          <button
            onClick={onRemoveCol}
            style={{
              padding: '4px 12px',
              backgroundColor: '#fff',
              border: '1px solid #d0d0d0',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#999',
            }}
            title="Remove column"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffebee';
              e.currentTarget.style.borderColor = '#ef5350';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.borderColor = '#d0d0d0';
            }}
          >
            − Col
          </button>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          left: '-32px',
          top: 0,
          width: '28px',
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          pointerEvents: 'auto',
          padding: '4px 0',
        }}
      >
        <button
          onClick={onAddRow}
          style={{
            padding: '8px 4px',
            backgroundColor: '#fff',
            border: '1px solid #d0d0d0',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            color: '#333',
          }}
          title="Add row"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
            e.currentTarget.style.borderColor = '#999';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.borderColor = '#d0d0d0';
          }}
        >
          +
        </button>
        {rows > 1 && (
          <button
            onClick={onRemoveRow}
            style={{
              padding: '8px 4px',
              backgroundColor: '#fff',
              border: '1px solid #d0d0d0',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#999',
            }}
            title="Remove row"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffebee';
              e.currentTarget.style.borderColor = '#ef5350';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.borderColor = '#d0d0d0';
            }}
          >
            −
          </button>
        )}
      </div>
    </>
  );
}
