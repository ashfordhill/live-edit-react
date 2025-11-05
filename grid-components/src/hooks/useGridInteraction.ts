import { useCallback, useRef } from 'react';

type EdgeZone = 'bottom' | 'right' | 'bottom-right' | null;

interface GridInteractionConfig {
  onAddRow: () => void;
  onRemoveRow: () => void;
  onAddCol: () => void;
  onRemoveCol: () => void;
  onAddRowCol: () => void;
  onRemoveRowCol: () => void;
  onHoverZone: (zone: EdgeZone) => void;
  gridRef: React.RefObject<HTMLDivElement>;
  edgeSize?: number;
}

const EDGE_SIZE = 40;
const DOUBLE_CLICK_DELAY = 300;

export function useGridInteraction({
  onAddRow,
  onRemoveRow,
  onAddCol,
  onRemoveCol,
  onAddRowCol,
  onRemoveRowCol,
  onHoverZone,
  gridRef,
  edgeSize = EDGE_SIZE,
}: GridInteractionConfig) {
  const clickCountRef = useRef<{ zone: EdgeZone; count: number }>({ zone: null, count: 0 });
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const detectZoneAt = useCallback(
    (x: number, y: number): EdgeZone => {
      if (!gridRef.current) return null;

      const rect = gridRef.current.getBoundingClientRect();
      const relX = x - rect.left;
      const relY = y - rect.top;

      const isNearBottom = relY > rect.height - edgeSize;
      const isNearRight = relX > rect.width - edgeSize;

      if (isNearBottom && isNearRight) return 'bottom-right';
      if (isNearBottom) return 'bottom';
      if (isNearRight) return 'right';

      return null;
    },
    [gridRef, edgeSize]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const zone = detectZoneAt(e.clientX, e.clientY);
      onHoverZone(zone);

      if (zone === 'bottom-right') {
        document.body.style.cursor = 'nwse-resize';
      } else if (zone === 'bottom') {
        document.body.style.cursor = 'ns-resize';
      } else if (zone === 'right') {
        document.body.style.cursor = 'ew-resize';
      } else {
        document.body.style.cursor = 'default';
      }
    },
    [detectZoneAt, onHoverZone]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      const zone = detectZoneAt(e.clientX, e.clientY);
      if (!zone) return;

      clickCountRef.current.zone = zone;
      clickCountRef.current.count += 1;

      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

      if (clickCountRef.current.count === 2) {
        if (zone === 'bottom') onRemoveRow();
        if (zone === 'right') onRemoveCol();
        if (zone === 'bottom-right') onRemoveRowCol();

        clickCountRef.current.count = 0;
        clickCountRef.current.zone = null;
      } else {
        clickTimerRef.current = setTimeout(() => {
          clickCountRef.current.count = 0;
          clickCountRef.current.zone = null;
        }, DOUBLE_CLICK_DELAY);
      }
    },
    [detectZoneAt, onRemoveRow, onRemoveCol, onRemoveRowCol]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;

      const zone = detectZoneAt(e.clientX, e.clientY);
      if (!zone) return;

      e.preventDefault();

      clickCountRef.current.zone = zone;
      clickCountRef.current.count += 1;

      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

      if (clickCountRef.current.count === 2) {
        if (zone === 'bottom') onAddRow();
        if (zone === 'right') onAddCol();
        if (zone === 'bottom-right') onAddRowCol();

        clickCountRef.current.count = 0;
        clickCountRef.current.zone = null;
      } else {
        clickTimerRef.current = setTimeout(() => {
          clickCountRef.current.count = 0;
          clickCountRef.current.zone = null;
        }, DOUBLE_CLICK_DELAY);
      }
    },
    [detectZoneAt, onAddRow, onAddCol, onAddRowCol]
  );

  const handleMouseEnter = useCallback(() => {
    if (!gridRef.current) return;
    gridRef.current.addEventListener('mousemove', handleMouseMove as any);
  }, [gridRef, handleMouseMove]);

  const handleMouseLeave = useCallback(() => {
    if (!gridRef.current) return;
    gridRef.current.removeEventListener('mousemove', handleMouseMove as any);
    onHoverZone(null);
    document.body.style.cursor = 'default';
  }, [gridRef, handleMouseMove, onHoverZone]);

  return {
    handleMouseDown,
    handleContextMenu,
    handleMouseEnter,
    handleMouseLeave,
  };
}
