import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LiveEditConfig } from '../definitions/types';

interface EditableConfigContextType {
  config: LiveEditConfig | null;
  isLoading: boolean;
  error: Error | null;
  updateComponentProps: (leId: string, props: Record<string, any>) => void;
}

const EditableConfigContext = createContext<EditableConfigContextType | undefined>(undefined);

export function EditableConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<LiveEditConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/.liveedit.config.json');
        if (!response.ok) {
          throw new Error(`Failed to load config: ${response.statusText}`);
        }
        const data: LiveEditConfig = await response.json();
        setConfig(data);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error loading config');
        console.error('Failed to load .liveedit.config.json:', error);
        setError(error);
        setIsLoading(false);
      }
    };

    loadConfig();

    const handleHMRUpdate = (event: any) => {
      if (event.type === 'custom' && event.event === 'liveedit:config-update') {
        console.log('Config updated via HMR');
        setConfig(event.data.config);
      }
    };

    if (typeof window !== 'undefined' && (window as any).__VITE_HMR__) {
      (window as any).__VITE_HMR__.on('custom:liveedit:config-update', (payload: any) => {
        console.log('Received HMR update:', payload);
        setConfig(payload.config);
      });
    }

    const handleRefresh = () => {
      loadConfig();
    };

    window.addEventListener('focus', handleRefresh);

    return () => {
      window.removeEventListener('focus', handleRefresh);
    };
  }, []);

  const updateComponentProps = (leId: string, props: Record<string, any>) => {
    setConfig((prev) => {
      if (!prev || !prev.components[leId]) {
        console.warn(`Cannot update props for component ${leId}: not found in config`);
        return prev;
      }

      return {
        ...prev,
        components: {
          ...prev.components,
          [leId]: {
            ...prev.components[leId],
            props: {
              ...prev.components[leId].props,
              ...props,
            },
          },
        },
      };
    });
  };

  const value: EditableConfigContextType = {
    config,
    isLoading,
    error,
    updateComponentProps,
  };

  return (
    <EditableConfigContext.Provider value={value}>
      {children}
    </EditableConfigContext.Provider>
  );
}

export function useEditableConfig() {
  const context = useContext(EditableConfigContext);
  if (context === undefined) {
    throw new Error('useEditableConfig must be used within EditableConfigProvider');
  }
  return context;
}
