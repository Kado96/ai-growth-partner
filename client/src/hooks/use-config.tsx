import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchConfig } from '@/lib/api';

interface ConfigContextType {
  config: any;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadConfig = async () => {
    try {
      const data = await fetchConfig();
      setConfig(data);
    } catch (err) {
      console.error('Failed to load config from server:', err);
      // Fallback or handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, refresh: loadConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  // Au lieu de planter, on renvoie un état de chargement par défaut si le contexte est absent
  if (context === undefined) {
    return { config: null, loading: true, refresh: async () => {} };
  }
  return context;
};
