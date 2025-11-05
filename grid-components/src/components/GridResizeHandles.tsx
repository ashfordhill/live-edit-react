import React from 'react';

interface GridResizeHandlesProps {
  hoverEdge: string | null;
  gridWidth: number;
  gridHeight: number;
}

export function GridResizeHandles({ hoverEdge, gridWidth, gridHeight }: GridResizeHandlesProps) {
  const edgeStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'transparent',
  };

  const topEdgeStyle: React.CSSProperties = {
    ...edgeStyle,
    top: 0,
    left: 0,
    width: '100%',
    height: '12px',
    cursor: 'row-resize',
    transition: 'background-color 0.2s',
    backgroundColor: hoverEdge === 'top' ? 'rgba(66, 133, 244, 0.3)' : 'transparent',
  };

  const bottomEdgeStyle: React.CSSProperties = {
    ...edgeStyle,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '12px',
    cursor: 'row-resize',
    transition: 'background-color 0.2s',
    backgroundColor: hoverEdge === 'bottom' ? 'rgba(66, 133, 244, 0.3)' : 'transparent',
  };

  const leftEdgeStyle: React.CSSProperties = {
    ...edgeStyle,
    left: 0,
    top: 0,
    width: '12px',
    height: '100%',
    cursor: 'col-resize',
    transition: 'background-color 0.2s',
    backgroundColor: hoverEdge === 'left' ? 'rgba(66, 133, 244, 0.3)' : 'transparent',
  };

  const rightEdgeStyle: React.CSSProperties = {
    ...edgeStyle,
    right: 0,
    top: 0,
    width: '12px',
    height: '100%',
    cursor: 'col-resize',
    transition: 'background-color 0.2s',
    backgroundColor: hoverEdge === 'right' ? 'rgba(66, 133, 244, 0.3)' : 'transparent',
  };

  return (
    <>
      <div style={topEdgeStyle} />
      <div style={bottomEdgeStyle} />
      <div style={leftEdgeStyle} />
      <div style={rightEdgeStyle} />
    </>
  );
}
