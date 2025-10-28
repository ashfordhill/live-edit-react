import { useEffect, useRef, useState } from 'react';

/**
 * Extract live-edit metadata from a DOM element
 */
function extractLiveEditData(element: HTMLElement | null) {
  if (!element) return null;
  
  const file = element.getAttribute('data-le-file');
  const id = element.getAttribute('data-le-id');
  
  if (!file || !id) return null;
  
  return { file, id };
}

/**
 * Send a patch request to update the source code
 */
async function sendPatch(file: string, id: string, prop: string, newValue: any) {
  try {
    const response = await fetch('/_liveedit/patch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, id, prop, newValue })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Live-edit patch failed:', errorText);
    }
  } catch (error) {
    console.error('Live-edit error:', error);
  }
}

export type LiveEditControl = {
  value: number;
  onChange: (newValue: number) => void;
};

/**
 * Hook to create a live-editable numeric control (slider, etc.)
 * 
 * @param elementRef - Ref to the DOM element being controlled
 * @param propName - Name of the prop to update in source code
 * @param initialValue - Initial/fallback value
 * @returns Control object with value and onChange
 */
export function useLiveEdit(
  elementRef: React.RefObject<HTMLElement>,
  propName: string,
  initialValue: number
): LiveEditControl {
  const [value, setValue] = useState(initialValue);
  const metadataRef = useRef<{ file: string; id: string } | null>(null);

  // Extract metadata once when the element mounts
  useEffect(() => {
    if (elementRef.current) {
      metadataRef.current = extractLiveEditData(elementRef.current);
    }
  }, [elementRef]);

  const onChange = (newValue: number) => {
    setValue(newValue);
    
    // Send patch request to update source code
    if (metadataRef.current) {
      sendPatch(
        metadataRef.current.file,
        metadataRef.current.id,
        propName,
        newValue
      );
    }
  };

  return { value, onChange };
}