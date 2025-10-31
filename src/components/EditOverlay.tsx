import React, { useEffect, useRef, useState } from 'react';
import { EditableProperty } from '../definitions/types';
import { PropertyControl } from './PropertyControl';

interface EditOverlayProps {
  leId: string;
  componentType: string;
  properties: Record<string, EditableProperty>;
  values: Record<string, any>;
  onPropertyChange: (prop: string, value: any) => void;
  position: { x: number; y: number };
  elementBounds?: DOMRect;
  onClose: () => void;
}

type PropertyCategory = 'layout' | 'typography' | 'appearance' | 'interaction';

const CATEGORY_LABELS: Record<PropertyCategory, string> = {
  layout: '📐 Layout',
  typography: '✍️ Typography',
  appearance: '🎨 Appearance',
  interaction: '🖱️ Interaction',
};

export function EditOverlay({
  leId,
  componentType,
  properties,
  values,
  onPropertyChange,
  position,
  elementBounds,
  onClose,
}: EditOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [expandedCategories, setExpandedCategories] = useState<Set<PropertyCategory>>(
    new Set(['appearance'])
  );

  useEffect(() => {
    if (!overlayRef.current) return;

    const rect = overlayRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const menuWidth = 320;
    const menuHeight = rect.height;
    const gap = 12;

    let newX = position.x;
    let newY = position.y;

    if (elementBounds) {
      const elementRight = elementBounds.right;
      const elementBottom = elementBounds.bottom;
      const elementTop = elementBounds.top;

      const spaceRight = windowWidth - elementRight;
      const spaceLeft = elementBounds.left;
      const spaceBelow = windowHeight - elementBottom;

      if (spaceRight >= menuWidth + gap) {
        newX = elementRight + gap;
        newY = Math.max(0, elementTop - (menuHeight - elementBounds.height) / 2);
      } else if (spaceLeft >= menuWidth + gap) {
        newX = elementBounds.left - menuWidth - gap;
        newY = Math.max(0, elementTop - (menuHeight - elementBounds.height) / 2);
      } else {
        newX = Math.max(0, Math.min(position.x + gap, windowWidth - menuWidth - 10));
        newY = spaceBelow >= menuHeight ? elementBottom + gap : Math.max(0, windowHeight - menuHeight - 10);
      }
    } else {
      newX = position.x + gap;
      newY = position.y;
    }

    newX = Math.max(0, Math.min(newX, windowWidth - menuWidth - 10));
    newY = Math.max(0, newY);

    setAdjustedPos({ x: newX, y: newY });
  }, [position, elementBounds]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - adjustedPos.x,
      y: e.clientY - adjustedPos.y,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setAdjustedPos({
        x: Math.max(0, Math.min(newX, window.innerWidth - 320)),
        y: Math.max(0, newY),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const groupedProperties = Object.entries(properties).reduce(
    (acc, [propName, property]) => {
      const category = (property.category || 'appearance') as PropertyCategory;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push([propName, property]);
      return acc;
    },
    {} as Record<PropertyCategory, [string, EditableProperty][]>
  );

  const toggleCategory = (category: PropertyCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${adjustedPos.y}px`,
    left: `${adjustedPos.x}px`,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    padding: '0',
    zIndex: 10000,
    width: '320px',
    maxHeight: '80vh',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    userSelect: 'none',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    padding: '12px 16px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
    color: '#333',
    cursor: 'grab',
    background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.02), transparent)',
    flex: '0 0 auto',
  };

  const contentStyle: React.CSSProperties = {
    overflow: 'auto',
    padding: '8px 0',
    flex: 1,
  };

  const categoryHeaderStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    padding: '10px 16px',
    color: '#666',
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    transition: 'background-color 0.2s',
  };

  const categoryContentStyle: React.CSSProperties = {
    padding: '8px 16px',
  };

  return (
    <div ref={overlayRef} style={overlayStyle}>
      <div ref={headerRef} style={headerStyle} onMouseDown={handleMouseDown}>
        <div style={{ fontSize: '12px', opacity: 0.5 }}>✋ drag to move</div>
        <div style={{ fontSize: '12px', fontWeight: 500, marginTop: '4px' }}>
          {componentType} • {leId}
        </div>
      </div>

      <div style={contentStyle}>
        {Object.entries(groupedProperties).map(([category, categoryProps]) => {
          const cat = category as PropertyCategory;
          const isExpanded = expandedCategories.has(cat);

          return (
            <div key={category}>
              <div
                style={{
                  ...categoryHeaderStyle,
                  backgroundColor: isExpanded ? 'rgba(0, 0, 0, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                }}
                onClick={() => toggleCategory(cat)}
              >
                <span>{isExpanded ? '▼' : '▶'}</span>
                <span>{CATEGORY_LABELS[cat]}</span>
              </div>

              {isExpanded && (
                <div style={categoryContentStyle}>
                  {categoryProps.map(([propName, property]) => {
                    const isVisible = !property.condition || property.condition(values);
                    return (
                      <PropertyControl
                        key={propName}
                        property={property}
                        value={values[propName]}
                        onChange={(newValue) => onPropertyChange(propName, newValue)}
                        isVisible={isVisible}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
