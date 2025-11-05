import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LiveEditConfig } from '../definitions/types';

interface EditableConfigContextType {
  config: LiveEditConfig | null;
  isLoading: boolean;
  error: Error | null;
  updateComponentProps: (leId: string, props: Record<string, any>) => void;
  resetToDefault: () => Promise<void>;
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

    // Proper Vite HMR hook for custom events
    const hot: any = (import.meta as any)?.hot;
    let removeHMR: (() => void) | undefined;
    if (hot && typeof hot.on === 'function') {
      console.log('🔌 HMR available, setting up listener for liveedit:config-update');
      const handler = (payload: any) => {
        console.log('✅ Received HMR config update (RAW):', payload);
        console.log('✅ Payload.config exists?', !!payload?.config);
        console.log('✅ Payload.data exists?', !!payload?.data);
        console.log('✅ Full payload structure:', JSON.stringify(Object.keys(payload || {})));
        
        // Try both payload.config and payload.data.config
        const newConfig = payload?.config || payload?.data?.config || payload;
        console.log('✅ Setting new config:', newConfig);
        setConfig(newConfig);
      };
      // Listen for the event name sent by the server (without 'custom:' prefix)
      hot.on('liveedit:config-update', handler);
      console.log('✅ HMR listener registered for liveedit:config-update');
      removeHMR = () => {
        if (typeof hot.off === 'function') {
          hot.off('liveedit:config-update', handler);
        }
      };
    } else {
      console.warn('⚠️ HMR not available or hot.on is not a function');
    }

    const handleRefresh = () => {
      loadConfig();
    };

    window.addEventListener('focus', handleRefresh);

    return () => {
      window.removeEventListener('focus', handleRefresh);
      if (removeHMR) removeHMR();
    };
  }, []);

  const updateComponentProps = (leId: string, props: Record<string, any>) => {
    console.log('🔧 updateComponentProps called:', { leId, props });
    setConfig((prev) => {
      if (!prev || !prev.components[leId]) {
        console.warn(`⚠️ Cannot update props for component ${leId}: not found in config`);
        return prev;
      }

      const newConfig = {
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
      
      console.log('🔧 Context config updated locally:', newConfig.components[leId].props);
      return newConfig;
    });
  };

  const resetToDefault = async () => {
    try {
      // Load default config
      const defaultResponse = await fetch('/.liveedit.config.default.json');
      if (!defaultResponse.ok) {
        throw new Error('Failed to load default config');
      }
      const defaultConfig: LiveEditConfig = await defaultResponse.json();

      // Send to server to overwrite current config
      const response = await fetch('/_liveedit/patch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset-config',
          config: defaultConfig,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset config on server');
      }

      // Update local state
      setConfig(defaultConfig);
      console.log('Configuration reset to default');
    } catch (err) {
      console.error('Failed to reset configuration:', err);
      throw err;
    }
  };

  const value: EditableConfigContextType = {
    config,
    isLoading,
    error,
    updateComponentProps,
    resetToDefault,
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
