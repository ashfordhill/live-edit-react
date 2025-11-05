import { useState, useCallback } from 'react';

export interface GridRuntimeState {
  isEditMode: boolean;
  isResizing: 'rows' | 'cols' | null;
  resizeStartPos: { x: number; y: number } | null;
  resizePreview: { rows: number; cols: number } | null;
  hoverEdge: 'top' | 'bottom' | 'left' | 'right' | null;
  animationPhase: 'idle' | 'resizing' | 'settling';
}

const initialState: GridRuntimeState = {
  isEditMode: false,
  isResizing: null,
  resizeStartPos: null,
  resizePreview: null,
  hoverEdge: null,
  animationPhase: 'idle',
};

export function useGridResize(currentRows: number, currentCols: number, gridWidth: number, gridHeight: number) {
  const [state, setState] = useState<GridRuntimeState>(initialState);

  const startResize = useCallback(
    (edge: 'rows' | 'cols', position: { x: number; y: number }) => {
      setState((prev) => ({
        ...prev,
        isResizing: edge,
        resizeStartPos: position,
        animationPhase: 'resizing',
      }));
    },
    []
  );

  const updateResizePreview = useCallback(
    (currentPos: { x: number; y: number }) => {
      if (!state.resizeStartPos || !state.isResizing) return;

      const delta = state.isResizing === 'rows'
        ? currentPos.y - state.resizeStartPos.y
        : currentPos.x - state.resizeStartPos.x;

      const cellSize = state.isResizing === 'rows'
        ? gridHeight / currentRows
        : gridWidth / currentCols;

      const cellsToChange = Math.round(delta / cellSize);
      const baseValue = state.isResizing === 'rows' ? currentRows : currentCols;
      const newValue = Math.max(1, Math.min(20, baseValue + cellsToChange));

      setState((prev) => ({
        ...prev,
        resizePreview: state.isResizing === 'rows'
          ? { rows: newValue, cols: currentCols }
          : { rows: currentRows, cols: newValue },
      }));
    },
    [state, currentRows, currentCols, gridWidth, gridHeight]
  );

  const endResize = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isResizing: null,
      resizeStartPos: null,
      animationPhase: 'settling',
    }));
  }, []);

  const resetResize = useCallback(() => {
    setState(initialState);
  }, []);

  const setHoverEdge = useCallback((edge: 'top' | 'bottom' | 'left' | 'right' | null) => {
    setState((prev) => ({
      ...prev,
      hoverEdge: edge,
    }));
  }, []);

  const setEditMode = useCallback((isEdit: boolean) => {
    setState((prev) => ({
      ...prev,
      isEditMode: isEdit,
    }));
  }, []);

  const finishAnimation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      animationPhase: 'idle',
      resizePreview: null,
    }));
  }, []);

  return {
    state,
    startResize,
    updateResizePreview,
    endResize,
    resetResize,
    setHoverEdge,
    setEditMode,
    finishAnimation,
  };
}
