/**
 * Grid Component - Advanced Drag & Drop Layout System
 * 
 * A fully-featured grid layout system with support for:
 * - Drag and drop repositioning
 * - Resizable grid items
 * - Nested parent grids (combine items into containers)
 * - Configurable padding for parent grids
 * - Horizontal/Vertical layout modes
 * - Real-time persistence via live-edit config
 * 
 * Architecture:
 * - Uses react-grid-layout for core grid functionality
 * - Layout state persisted to .liveedit.config.json
 * - Supports unlimited nesting depth
 * - Edit mode vs View mode for development/production
 * 
 * Key Features:
 * 1. Combine items: Drag one item onto another (50%+ overlap) to create parent grid
 * 2. Add to parent: Drag items into existing parent grids
 * 3. Uncombine: Extract all children from a parent grid back to main grid
 * 4. Adjust padding: Use 🔼/🔽 Pad buttons to control parent grid padding
 * 5. Toggle layout: Double right-click to switch horizontal ↔️ vertical
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useEditableProps } from '../hooks/useEditableProps';
import { useLiveEditBatch } from '../hooks/useLiveEdit';

/**
 * Represents a single grid item in the layout
 * Can be either a regular component or a nested grid container
 */
export interface LayoutItem {
  i: string;              // Unique identifier for the grid item
  x: number;              // X position in grid columns (0-based)
  y: number;              // Y position in grid rows (0-based)
  w: number;              // Width in grid columns
  h: number;              // Height in grid rows
  childIndex?: number;    // Index of the child component to render
  static?: boolean;       // Whether the item is locked in place
  nested?: {              // If present, this item contains a nested grid
    items: LayoutItem[];  // Child items in the nested grid
    cols?: number;        // Number of columns in nested grid
    compactType?: 'vertical' | 'horizontal';  // Layout direction
    padding?: number;     // Padding for parent grid in pixels (adjustable)
  };
}

interface GridProps {
  id: string;
  editMode?: boolean;
  children?: React.ReactNode;
  // Full set of root children so nested grids can reference by childIndex reliably
  allChildren?: React.ReactNode[];
  layout?: LayoutItem[];
  onLayoutChange?: (layout: LayoutItem[]) => void;
  cols?: number;
  rowHeight?: number;
  isNested?: boolean;
  darkMode?: boolean;
  initialCompactType?: 'vertical' | 'horizontal';
  padding?: number;  // Root grid padding (adjustable)
}

const ResponsiveGridLayout = WidthProvider(Responsive);

export function Grid({
  id,
  editMode = true,
  children,
  allChildren,
  layout: initialLayout = [],
  onLayoutChange,
  cols = 4,
  rowHeight = 100,
  isNested = false,
  darkMode = false,
  initialCompactType = 'vertical',
  padding: initialPadding = 16,
}: GridProps) {
  const editableProps = useEditableProps(id);
  const { onBatchChange } = useLiveEditBatch(id);
  
  const configLayout = editableProps?.layout || initialLayout;
  const configCols = editableProps?.cols || cols;
  const configRowHeight = editableProps?.rowHeight || rowHeight;
  const configPadding = editableProps?.padding ?? initialPadding;
  const configCompactType = editableProps?.compactType || initialCompactType;
  
  const [layout, setLayout] = useState<LayoutItem[]>(configLayout);
  const [isDragging, setIsDragging] = useState(false);
  // Removed unused dragOverId state; overlapTargetId is the single source of truth
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [compactType, setCompactType] = useState<'vertical' | 'horizontal'>(configCompactType);
  const [activeNestedId, setActiveNestedId] = useState<string | null>(null);
  const [overlapTargetId, setOverlapTargetId] = useState<string | null>(null);
  const rightClickCountRef = React.useRef(0);
  const rightClickTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const dragOverIdRef = React.useRef<string | null>(null);
  const lastOverlapTargetRef = React.useRef<string | null>(null);
  const isUpdatingFromConfigRef = React.useRef(false);

  const childrenArray = React.useMemo(
    () => React.Children.toArray(allChildren ?? children),
    [allChildren, children]
  );
  
  // Sync layout from config when it changes (use JSON.stringify for deep comparison)
  const configLayoutString = JSON.stringify(editableProps?.layout || []);
  useEffect(() => {
    console.log('🔄 useEffect triggered for layout sync');
    console.log('🔄 editableProps?.layout exists?', !!editableProps?.layout);
    console.log('🔄 configLayoutString changed:', configLayoutString);
    if (editableProps?.layout) {
      console.log('📥 Grid received config layout update, setting layout state:', editableProps.layout);
      // Set flag to prevent saving back to server
      isUpdatingFromConfigRef.current = true;
      setLayout(editableProps.layout);
      // Clear flag after a small delay to allow react-grid-layout to process
      setTimeout(() => {
        isUpdatingFromConfigRef.current = false;
        console.log('🔓 Unlocked config update flag');
      }, 100);
    }
  }, [configLayoutString, editableProps?.layout]);

  // Sync layout from props for nested grids (they don't use editableProps)
  const propsLayoutString = JSON.stringify(initialLayout);
  useEffect(() => {
    if (isNested) {
      console.log('📥 Nested Grid received layout prop update:', initialLayout);
      isUpdatingFromConfigRef.current = true;
      setLayout(initialLayout);
      setTimeout(() => {
        isUpdatingFromConfigRef.current = false;
        console.log('🔓 Nested Grid unlocked config update flag');
      }, 100);
    }
  }, [propsLayoutString, isNested]);

  // Sync compactType from config (for root grid)
  useEffect(() => {
    if (!isNested && editableProps?.compactType) {
      console.log('📥 Root Grid received compactType config update:', editableProps.compactType);
      setCompactType(editableProps.compactType);
    }
  }, [editableProps?.compactType, isNested]);

  // Sync compactType from parent (for nested grids)
  useEffect(() => {
    if (isNested && initialCompactType) {
      console.log('📥 Nested Grid received compactType update:', initialCompactType);
      setCompactType(initialCompactType);
    }
  }, [initialCompactType, isNested]);

  /**
   * Calculate overlap percentage between dragged item and target item
   * Used to determine when items should be combined into a parent grid
   * @returns Percentage of overlap (0-100)
   */
  const calculateOverlap = useCallback((draggedItem: LayoutItem, targetItem: LayoutItem): number => {
    const draggedLeft = draggedItem.x;
    const draggedRight = draggedItem.x + draggedItem.w;
    const draggedTop = draggedItem.y;
    const draggedBottom = draggedItem.y + draggedItem.h;

    const targetLeft = targetItem.x;
    const targetRight = targetItem.x + targetItem.w;
    const targetTop = targetItem.y;
    const targetBottom = targetItem.y + targetItem.h;

    // Calculate intersection rectangle
    const intersectLeft = Math.max(draggedLeft, targetLeft);
    const intersectRight = Math.min(draggedRight, targetRight);
    const intersectTop = Math.max(draggedTop, targetTop);
    const intersectBottom = Math.min(draggedBottom, targetBottom);

    // Check if there is an intersection
    if (intersectLeft < intersectRight && intersectTop < intersectBottom) {
      const intersectionArea = (intersectRight - intersectLeft) * (intersectBottom - intersectTop);
      const draggedArea = draggedItem.w * draggedItem.h;
      return (intersectionArea / draggedArea) * 100;
    }

    return 0;
  }, []);

  /**
   * Check for overlaps during drag operation
   * Determines which item (if any) should be highlighted as a combination target
   * Optimized to prevent flickering by only updating when target changes
   */
  const checkOverlaps = useCallback((currentLayout: Layout[]) => {
    if (!draggedItemId) return;

    const draggedItem = currentLayout.find(l => l.i === draggedItemId);
    if (!draggedItem) return;

    let maxOverlap = 0;
    let maxOverlapTargetId: string | null = null;

    // Find the item with the highest overlap percentage
    for (const item of currentLayout) {
      if (item.i === draggedItemId) continue;

      const overlap = calculateOverlap(draggedItem as LayoutItem, item as LayoutItem);
      // 50% overlap threshold - prevents accidental combinations
      if (overlap > maxOverlap && overlap >= 50) {
        maxOverlap = overlap;
        maxOverlapTargetId = item.i;
      }
    }

    // Only update state if the target actually changed (prevents flickering)
    if (maxOverlapTargetId !== lastOverlapTargetRef.current) {
      lastOverlapTargetRef.current = maxOverlapTargetId;
      setOverlapTargetId(maxOverlapTargetId);
      dragOverIdRef.current = maxOverlapTargetId;
    }
  }, [draggedItemId, calculateOverlap]);

  const handleLayoutChange = useCallback((newLayout: LayoutItem[]) => {
    // Skip saving if this change came from HMR config update
    if (isUpdatingFromConfigRef.current) {
      console.log('⏭️ Skipping save - layout change from HMR config update');
      setLayout(newLayout);
      onLayoutChange?.(newLayout);
      return;
    }
    
    console.log('💾 Saving layout change:', newLayout);
    setLayout(newLayout);
    onLayoutChange?.(newLayout);
    
    if (!isNested && editableProps) {
      console.log('📤 Sending batch update to server');
      onBatchChange({ layout: newLayout });
    }
  }, [onLayoutChange, isNested, editableProps, onBatchChange]);

  /**
   * Handles dropping a dragged item onto another item
   * Creates a new parent grid or adds to an existing parent grid
   * 
   * Two scenarios:
   * 1. Target is already a parent grid -> Add source item to it
   * 2. Target is a regular item -> Create new parent grid with both items
   */
  const handleDropOnItem = (targetItemId: string) => {
    if (!draggedItemId || draggedItemId === targetItemId) return;

    const sourceItem = layout.find(l => l.i === draggedItemId);
    const targetItem = layout.find(l => l.i === targetItemId);

    if (!sourceItem || !targetItem) return;

    console.log('🔗 Combining items:', draggedItemId, '+', targetItemId);

    // SCENARIO 1: Target is already a parent grid - add source item to it
    if (targetItem.nested) {
      // Remove source item from main layout
      const newLayout = layout.filter(l => l.i !== draggedItemId);
      
      // Get parent grid configuration
      const nestedCols = targetItem.nested.cols || 2;
      const nestedCompactType = targetItem.nested.compactType || 'vertical';
      
      // Create a new nested item with proper positioning based on layout direction
      const newNestedItem: LayoutItem = {
        ...sourceItem,
        i: `${sourceItem.i}-n-${Date.now()}`, // Unique ID for nested item
        // Position calculation depends on layout direction:
        // - Horizontal: items flow left-to-right, wrap to new rows (like flex-direction: row)
        // - Vertical: items flow top-to-bottom in single column (like flex-direction: column)
        x: nestedCompactType === 'horizontal' ? (targetItem.nested.items.length % nestedCols) : 0,
        y: nestedCompactType === 'horizontal' ? Math.floor(targetItem.nested.items.length / nestedCols) : targetItem.nested.items.length,
        w: 1,
        h: 1,
        // Preserve important properties from source item
        ...(sourceItem.childIndex !== undefined && { childIndex: sourceItem.childIndex }),
        ...(sourceItem.nested && { nested: sourceItem.nested }),
      };

      // Add new item to parent grid's children
      const newNestedItems = [
        ...targetItem.nested.items,
        newNestedItem,
      ];

      // Calculate proper height to fit all items (with buffer for better UX)
      let calculatedHeight;
      if (nestedCompactType === 'horizontal') {
        // Horizontal layout: calculate rows needed based on column count
        const rowsNeeded = Math.ceil(newNestedItems.length / nestedCols);
        calculatedHeight = Math.max(targetItem.h, rowsNeeded + 1);
      } else {
        // Vertical layout: each item stacks vertically
        calculatedHeight = Math.max(targetItem.h, newNestedItems.length + 1);
      }

      // Update the parent grid with new child and adjusted height
      const updatedTargetItem = {
        ...targetItem,
        nested: {
          ...targetItem.nested,
          items: newNestedItems,
        },
        h: calculatedHeight,
      };

      // Apply changes to layout
      const updatedLayout = newLayout.map(item => 
        item.i === targetItemId ? updatedTargetItem : item
      );

      handleLayoutChange(updatedLayout);
      setDraggedItemId(null);
      setOverlapTargetId(null);
      lastOverlapTargetRef.current = null;
      return;
    }

    // SCENARIO 2: Combine two regular items into a new parent grid
    // IMPORTANT: New parent grid should stay at target item's position (Component A),
    // not jump to where source item was dragged from (Component B)
    // This prevents the unexpected "jumping" behavior when combining items
    const newLayout = layout.filter(l => l.i !== draggedItemId && l.i !== targetItemId);
    const nestedId = `nested-${Date.now()}`;

    const newNestedItem: LayoutItem = {
      i: nestedId,
      // FIX: Use target item position so grid doesn't jump unexpectedly
      x: targetItem.x,
      y: targetItem.y,
      w: Math.max(sourceItem.w, targetItem.w, 2),  // Ensure minimum width
      h: Math.max(sourceItem.h, targetItem.h, 3),  // Ensure minimum height for 2 items
      nested: {
        items: [
          // Target item becomes first child (left position in horizontal layout)
          { 
            ...targetItem, 
            i: `${targetItem.i}-n`, 
            x: 0,  // First position
            y: 0,
            w: 1,
            h: 1,
          },
          // Source item becomes second child (right position in horizontal layout)
          { 
            ...sourceItem, 
            i: `${sourceItem.i}-n`, 
            x: 1,  // Second position
            y: 0,
            w: 1,
            h: 1,
          },
        ],
        cols: 2,                      // 2 columns for side-by-side layout
        compactType: 'horizontal',    // Horizontal (row) layout is more natural default
        padding: 8,                   // Default padding for parent grids (adjustable via UI)
      },
    };

    const updatedLayout = [...newLayout, newNestedItem];
    handleLayoutChange(updatedLayout);
    setDraggedItemId(null);
    setOverlapTargetId(null);
    lastOverlapTargetRef.current = null;
  };

  /**
   * Uncombines a parent grid, extracting all child items back to the main grid
   */
  const handleUncombineGrid = (nestedItemId: string) => {
    const nestedItem = layout.find(l => l.i === nestedItemId);
    if (!nestedItem || !nestedItem.nested) return;

    const newLayout = layout.filter(l => l.i !== nestedItemId);
    const extractedItems = nestedItem.nested.items.map((item, idx) => ({
      ...item,
      i: `item-${Date.now()}-${idx}`,
      x: nestedItem.x + (idx % configCols),
      y: nestedItem.y + Math.floor(idx / configCols),
      w: 1,
      h: item.nested ? Math.max(2, Math.ceil(item.nested.items.length / (item.nested.cols || 2)) + 1) : 1,
      // Preserve childIndex and nested property if they exist
      ...(item.childIndex !== undefined && { childIndex: item.childIndex }),
      ...(item.nested && { nested: item.nested }),
    }));

    const updatedLayout = [...newLayout, ...extractedItems];
    handleLayoutChange(updatedLayout);
  };

  /**
   * Adjusts padding for a parent grid component
   * @param nestedItemId - ID of the nested grid item
   * @param delta - Amount to change padding (positive or negative)
   */
  const handleAdjustPadding = (nestedItemId: string, delta: number) => {
    const updatedLayout = layout.map(item => {
      if (item.i === nestedItemId && item.nested) {
        const currentPadding = item.nested.padding ?? 8;
        const newPadding = Math.max(0, Math.min(32, currentPadding + delta)); // Clamp between 0-32px
        return {
          ...item,
          nested: {
            ...item.nested,
            padding: newPadding,
          },
        };
      }
      return item;
    });
    handleLayoutChange(updatedLayout);
  };

  /**
   * Adjusts padding for the root grid container
   * @param delta - Amount to change padding (positive or negative)
   */
  const handleAdjustRootPadding = (delta: number) => {
    if (!isNested && editableProps) {
      const currentPadding = configPadding;
      const newPadding = Math.max(0, Math.min(32, currentPadding + delta)); // Clamp between 0-32px
      onBatchChange({ padding: newPadding });
    }
  };

  // TODO: Future feature - Drag to remove from parent grid
  // When an item is dragged outside parent bounds, extract it to main grid
  // If parent becomes empty after removal, optionally delete the parent container

  // TODO: Future feature - Force empty cell
  // Add ability to create placeholder/empty cells in the grid
  // Useful for precise layouts with intentional gaps

  /**
   * Handles right-click context menu events
   * Double right-click toggles layout direction (horizontal ↔️ vertical)
   * Works for both main grid and nested parent grids
   * 
   * @param e - React mouse event
   * @param nestedItemId - Optional ID of nested grid to toggle (if undefined, toggles main grid)
   */
  const handleContextMenu = (e: React.MouseEvent, nestedItemId?: string) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling to parent grids
    
    rightClickCountRef.current += 1;
    
    // Clear existing timer to reset double-click window
    if (rightClickTimerRef.current) {
      clearTimeout(rightClickTimerRef.current);
    }
    
    // Double right-click detected
    if (rightClickCountRef.current === 2) {
      if (nestedItemId) {
        // Toggle layout for specific nested parent grid
        const updatedLayout = layout.map(item => {
          if (item.i === nestedItemId && item.nested) {
            const newCompactType: 'vertical' | 'horizontal' = item.nested.compactType === 'vertical' ? 'horizontal' : 'vertical';
            const nestedCols = item.nested.cols || 2;
            
            // Reposition items based on new layout mode
            const repositionedItems = item.nested.items.map((nestedItem, index) => {
              if (newCompactType === 'horizontal') {
                // Horizontal: flow left-to-right in rows
                return {
                  ...nestedItem,
                  x: index % nestedCols,
                  y: Math.floor(index / nestedCols),
                };
              } else {
                // Vertical: flow top-to-bottom in single column
                return {
                  ...nestedItem,
                  x: 0,
                  y: index,
                };
              }
            });
            
            // Recalculate height for new layout
            let newHeight;
            if (newCompactType === 'horizontal') {
              const rowsNeeded = Math.ceil(repositionedItems.length / nestedCols);
              newHeight = Math.max(item.h, rowsNeeded + 1);
            } else {
              newHeight = Math.max(item.h, repositionedItems.length + 1);
            }
            
            return {
              ...item,
              h: newHeight,
              nested: {
                ...item.nested,
                items: repositionedItems,
                compactType: newCompactType,
              },
            };
          }
          return item;
        });
        handleLayoutChange(updatedLayout);
        console.log('🔄 Layout direction changed: nested grid', nestedItemId);
      } else {
        // Toggle layout for root grid and reposition items
  const newCompactType: 'vertical' | 'horizontal' = compactType === 'vertical' ? 'horizontal' : 'vertical';
        const repositionedLayout = layout.map((item, index) => {
          if (newCompactType === 'horizontal') {
            // Horizontal: flow left-to-right in rows
            return {
              ...item,
              x: index % configCols,
              y: Math.floor(index / configCols),
            };
          } else {
            // Vertical: stack top-to-bottom
            return {
              ...item,
              x: 0,
              y: index,
            };
          }
        });
        setCompactType(newCompactType);
        handleLayoutChange(repositionedLayout);
        console.log('🔄 Layout direction changed: root grid ->', newCompactType);
      }
      rightClickCountRef.current = 0;
      if (rightClickTimerRef.current) {
        clearTimeout(rightClickTimerRef.current);
        rightClickTimerRef.current = null;
      }
    } else {
      rightClickTimerRef.current = setTimeout(() => {
        rightClickCountRef.current = 0;
      }, 500); // Increased timeout to 500ms for more reliable double-click
    }
  };

  // REMOVED: View mode now uses ResponsiveGridLayout for consistency with edit mode
  // No more separate rendering paths that cause width/layout differences

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes combineGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(59, 130, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.6), inset 0 0 30px rgba(59, 130, 246, 0.3);
          }
        }

        @keyframes pulseBorder {
          0%, 100% {
            border-color: rgba(59, 130, 246, 1);
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
          }
          50% {
            border-color: rgba(96, 165, 250, 1);
            box-shadow: 0 0 25px rgba(59, 130, 246, 0.8);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        /* Dark mode: smoother, thicker pink resize handle */
        [data-theme="dark"] .react-resizable-handle {
          background: none !important;
          width: 20px;
          height: 20px;
          right: 0;
          bottom: 0;
          z-index: 1000 !important;  /* ALWAYS on top of child content */
        }
        [data-theme="dark"] .react-resizable-handle::after {
          content: '';
          position: absolute;
          right: 3px;
          bottom: 3px;
          width: 14px;
          height: 14px;
          border-right: 3px solid #f472b6;
          border-bottom: 3px solid #f472b6;
          border-radius: 2px;
          opacity: 0.85;
          transition: opacity 0.2s;
          z-index: 1000 !important;  /* Ensure the handle is always visible */
        }
        [data-theme="dark"] .react-resizable-handle:hover::after {
          opacity: 1;
          border-right: 3px solid #ec4899;
          border-bottom: 3px solid #ec4899;
        }
        
        /* Light mode: make sure resize handle is also always on top */
        .react-resizable-handle {
          z-index: 1000 !important;
        }

        /* Improved drag handle cursor feedback */
        .drag-handle:hover {
          cursor: grab !important;
        }
        .drag-handle:active {
          cursor: grabbing !important;
        }
      `}</style>
      <div
        data-le-id={id}
        data-theme={darkMode ? 'dark' : 'light'}
        onContextMenu={handleContextMenu}
        style={{
          position: 'relative',
          width: '100%',
          backgroundColor: darkMode ? '#0f172a' : '#f5f5f5',
          border: darkMode ? '2px dashed #475569' : '2px dashed #ccc',
          borderRadius: '4px',
          padding: `${configPadding}px`,
          userSelect: isDragging ? 'none' : 'auto',
          WebkitUserSelect: isDragging ? 'none' : 'auto',
          transition: 'background-color 0.3s, border-color 0.3s, padding 0.2s',
        }}
      >
        {/* Root Grid Padding Controls */}
        {editMode && !isNested && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 20,
            display: 'flex',
            gap: '4px',
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAdjustRootPadding(-2);
              }}
              style={{
                backgroundColor: darkMode ? '#8b5cf6' : '#a78bfa',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 10px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                fontWeight: 600,
              }}
              title="Decrease root grid padding"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#7c3aed' : '#8b5cf6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#8b5cf6' : '#a78bfa';
              }}
            >
              🔽 Root Pad
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAdjustRootPadding(2);
              }}
              style={{
                backgroundColor: darkMode ? '#8b5cf6' : '#a78bfa',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 10px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                fontWeight: 600,
              }}
              title="Increase root grid padding"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#7c3aed' : '#8b5cf6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#8b5cf6' : '#a78bfa';
              }}
            >
              🔼 Root Pad
            </button>
            <div
              style={{
                backgroundColor: darkMode ? '#3b82f6' : '#60a5fa',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            >
              {configPadding}px
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newCompactType = compactType === 'vertical' ? 'horizontal' : 'vertical';
                setCompactType(newCompactType);
                if (!isNested && editableProps) {
                  onBatchChange({ compactType: newCompactType });
                }
              }}
              style={{
                backgroundColor: darkMode ? '#10b981' : '#34d399',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 10px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                fontWeight: 600,
              }}
              title={`Switch to ${compactType === 'vertical' ? 'horizontal' : 'vertical'} layout`}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#059669' : '#10b981';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#10b981' : '#34d399';
              }}
            >
              {compactType === 'horizontal' ? '↔️ Horizontal' : '↕️ Vertical'}
            </button>
          </div>
        )}
        
        {isDragging && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
              border: '2px solid #3b82f6',
              borderRadius: '4px',
              pointerEvents: 'none',
            }}
          />
        )}

      <ResponsiveGridLayout
        className='layout'
        layouts={{ lg: layout }}
        onLayoutChange={(newLayout) => {
          // Don't update layout during drag to prevent items from moving around
          if (isDragging) return;
          
          const updatedLayout = (newLayout as any[]).map((item: any) => {
            const existingItem = layout.find(l => l.i === item.i);
            return {
              i: item.i,
              x: Math.round(item.x),
              y: Math.round(item.y),
              w: Math.round(item.w),
              h: Math.round(item.h),
              ...(existingItem?.childIndex !== undefined && { childIndex: existingItem.childIndex }),
              ...(existingItem?.nested && { nested: existingItem.nested }),
            };
          });
          handleLayoutChange(updatedLayout);
        }}
        onDragStart={(_currentLayout, oldItem) => {
          setIsDragging(true);
          setDraggedItemId(oldItem.i);
          lastOverlapTargetRef.current = null;
        }}
        onDrag={(currentLayout) => {
          // Throttle overlap checking for better performance
          // Only check every few pixels of movement
          checkOverlaps(currentLayout);
        }}
        onDragStop={() => {
          const targetId = overlapTargetId || dragOverIdRef.current;
          
          if (targetId && draggedItemId && targetId !== draggedItemId) {
            handleDropOnItem(targetId);
          }
          setIsDragging(false);
          setDraggedItemId(null);
          setOverlapTargetId(null);
          dragOverIdRef.current = null;
          lastOverlapTargetRef.current = null;
        }}
        width={1200}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: configCols, md: 3, sm: 2, xs: 1, xxs: 1 }}
        rowHeight={configRowHeight}
        isDraggable={editMode}
        isResizable={editMode}
        compactType={isDragging ? null : compactType}
        // Allow overlap while dragging so targets don't get pushed away (prevents "chasing")
        allowOverlap={isDragging}
        // Keep collision prevention default after drop so items settle normally
        preventCollision={false}
        useCSSTransforms={true}
        containerPadding={[0, 0]}
        // FIX: Use same margins in both modes to prevent jumping when toggling view/edit
        margin={[12, 12]}
        draggableHandle='.drag-handle'
      >
        {layout.map((item) => {
          if (item.nested) {
            const isActiveNested = activeNestedId === item.i;
            const isOverlapTarget = overlapTargetId === item.i;
            return (
              <div
                key={item.i}
                data-grid={{ x: item.x, y: item.y, w: item.w, h: item.h, i: item.i }}
                style={{
                  position: 'relative',
                  backgroundColor: darkMode ? '#1e293b' : '#fff',
                  // FIX: Use same border width in both modes, only change style for consistency
                  border: editMode ? (isActiveNested || isOverlapTarget ? `3px solid ${darkMode ? '#60a5fa' : '#3b82f6'}` : `2px dashed ${darkMode ? '#475569' : '#ccc'}`) : `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '6px',
                  overflow: 'auto',
                  transition: 'border 0.2s, background-color 0.3s, padding 0.2s',
                  boxShadow: (isActiveNested || isOverlapTarget) ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : (darkMode ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'),
                  animation: isOverlapTarget ? 'pulseBorder 1s ease-in-out infinite' : 'none',
                  // FIX: Use same padding in both edit and view mode to prevent jumping
                  padding: `${item.nested.padding ?? 8}px`,
                  boxSizing: 'border-box',  /* Ensure consistent sizing calculations */
                }}
                onMouseEnter={() => {
                  setActiveNestedId(item.i);
                }}
                onMouseLeave={() => {
                  setActiveNestedId(null);
                }}
                // Capture ensures this fires even if inner grid stops propagation
                onContextMenuCapture={(e) => handleContextMenu(e, item.i)}
                onContextMenu={(e) => handleContextMenu(e, item.i)}
              >
                {/* Parent Grid Label */}
                {editMode && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      zIndex: 10,
                      backgroundColor: darkMode ? '#3b82f6' : '#60a5fa',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      pointerEvents: 'none',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    📦 Parent Grid ({item.nested.items.length} items) - {item.nested.compactType === 'horizontal' ? '↔️ Horizontal' : '↕️ Vertical'} - Padding: {item.nested.padding ?? 8}px
                  </div>
                )}
                
                {/* Control buttons: Uncombine and Padding adjustments */}
                {editMode && !isNested && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: 10,
                    display: 'flex',
                    gap: '4px',
                  }}>
                    {/* Padding controls */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdjustPadding(item.i, -2);
                      }}
                      style={{
                        backgroundColor: darkMode ? '#6366f1' : '#818cf8',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                      title="Decrease padding"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = darkMode ? '#4f46e5' : '#6366f1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = darkMode ? '#6366f1' : '#818cf8';
                      }}
                    >
                      🔽 Pad
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdjustPadding(item.i, 2);
                      }}
                      style={{
                        backgroundColor: darkMode ? '#6366f1' : '#818cf8',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                      title="Increase padding"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = darkMode ? '#4f46e5' : '#6366f1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = darkMode ? '#6366f1' : '#818cf8';
                      }}
                    >
                      🔼 Pad
                    </button>
                    
                    {/* Uncombine button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUncombineGrid(item.i);
                      }}
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef4444';
                      }}
                    >
                      ✕ Uncombine
                    </button>
                  </div>
                )}
                
                {/* Visual feedback when this nested grid is the overlap target */}
                {isOverlapTarget && isDragging && draggedItemId !== item.i && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                      border: '4px solid #3b82f6',
                      borderRadius: '16px',
                      pointerEvents: 'none',
                      animation: 'pulseBorder 1s ease-in-out infinite',
                      zIndex: 5,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '64px',
                        animation: 'bounce 0.6s ease-in-out infinite',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                      }}
                    >
                      ➕
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.95)' : 'rgba(59, 130, 246, 0.9)',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      }}
                    >
                      Drop to add to grid
                    </div>
                  </div>
                )}
                <Grid
                  id={`${id}-${item.i}`}
                  editMode={editMode}
                  layout={item.nested.items}
                  onLayoutChange={(newNestedLayout) => {
                    const updatedLayout = layout.map(l =>
                      l.i === item.i ? { ...l, nested: { ...l.nested!, items: newNestedLayout } } : l
                    );
                    handleLayoutChange(updatedLayout);
                  }}
                  cols={item.nested.cols || 2}
                  rowHeight={configRowHeight}
                  isNested={true}
                  darkMode={darkMode}
                  initialCompactType={item.nested.compactType || 'vertical'}
                  allChildren={childrenArray}
                >
                  {/* Children provided via allChildren to keep indices consistent */}
                </Grid>
              </div>
            );
          }

          const childIndex = item.childIndex;
          const child = childIndex !== undefined ? childrenArray[childIndex] : null;

          const isBeingDragged = draggedItemId === item.i;
          const isDimmed = isDragging && !isBeingDragged;
          const isOverlapTarget = overlapTargetId === item.i;
          
          return (
            <div
              key={item.i}
              data-grid={{ x: item.x, y: item.y, w: item.w, h: item.h, i: item.i }}
              style={{
                position: 'relative',
                backgroundColor: darkMode ? '#1e293b' : '#fff',
                // FIX: Use same border in both modes to prevent size differences
                border: editMode ? (isOverlapTarget ? `3px solid ${darkMode ? '#60a5fa' : '#3b82f6'}` : (darkMode ? '1px solid #475569' : '1px solid #e5e7eb')) : (darkMode ? '1px solid #475569' : '1px solid #e5e7eb'),
                borderRadius: '6px',
                padding: '8px',
                cursor: editMode ? (isBeingDragged ? 'grabbing' : 'grab') : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // FIX: Use 'hidden' on outer container, 'auto' on inner child wrapper for consistent scrolling
                overflow: 'hidden',
                opacity: isDimmed ? 0.4 : 1,
                transform: isBeingDragged ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isBeingDragged ? '0 10px 30px rgba(0,0,0,0.3)' : (isOverlapTarget ? '0 0 0 3px rgba(59, 130, 246, 0.3)' : (darkMode ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)')),
                zIndex: isBeingDragged ? 1000 : 'auto',
                transition: 'opacity 0.2s ease-out, transform 0.2s ease-out, box-shadow 0.2s ease-out, background-color 0.3s, border-color 0.3s',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                animation: isOverlapTarget ? 'pulseBorder 1s ease-in-out infinite' : 'none',
                boxSizing: 'border-box',  /* Ensure consistent sizing calculations */
              }}
            >
              {/* Drag handle - covers most of the item except resize corner */}
              {editMode && (
                <div
                  className='drag-handle'
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    right: '24px',  // Leave space for resize handle
                    bottom: '24px', // Leave space for resize handle
                    cursor: 'grab',
                    zIndex: 1,
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                    setDraggedItemId(item.i);
                  }}
                />
              )}
              
              {editMode && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: darkMode ? '#60a5fa' : '#3b82f6',
                    opacity: isDragging ? 1 : 0.5,
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                />
              )}

              {isOverlapTarget && isDragging && draggedItemId !== item.i && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                    border: '4px solid #3b82f6',
                    borderRadius: '16px',
                    pointerEvents: 'none',
                    animation: 'pulseBorder 1s ease-in-out infinite',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '64px',
                      animation: 'bounce 0.6s ease-in-out infinite',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                    }}
                  >
                    📂
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.95)' : 'rgba(59, 130, 246, 0.9)',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    Drop to combine
                  </div>
                </div>
              )}

              <div style={{ 
                position: 'relative', 
                zIndex: 1,  /* Lower than resize handle (1000), so handle is always visible */
                pointerEvents: 'none', 
                width: '100%', 
                height: '100%',
                overflow: 'auto',  /* Ensure scrollbars appear when content overflows */
              }}>
                {child}
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>

        {!isNested && (
          <div style={{ marginTop: '12px', fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280', display: 'flex', gap: '16px', flexWrap: 'wrap', transition: 'color 0.3s' }}>
            <div>📌 Drag center to move • Bottom-right to resize</div>
            <div>⚡ Drag over another item to combine (pulsing border shows when ready)</div>
            <div>➕ Drag into Parent Grid to add items</div>
            <div>🔄 Double right-click on a grid to toggle its layout (vertical ↔️ horizontal)</div>
          </div>
        )}
      </div>
    </>
  );
}
