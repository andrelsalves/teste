import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';

export type UIDensity = 'compact' | 'comfortable';

interface UIDensityContextType {
  density: UIDensity;
  setDensity: (d: UIDensity) => void;
  toggleDensity: () => void;
  isCompact: boolean;
}

const UIDensityContext = createContext<UIDensityContextType | null>(null);

const STORAGE_KEY = 'ui-density';

/**
 * Regra:
 * - Se o usuário já escolheu antes → respeita
 * - Caso contrário:
 *   - Desktop (>= 1024px) → compact
 *   - Mobile / tablet → comfortable
 */
const getInitialDensity = (): UIDensity => {
  if (typeof window === 'undefined') return 'comfortable';

  const saved = localStorage.getItem(STORAGE_KEY) as UIDensity | null;
  if (saved === 'compact' || saved === 'comfortable') {
    return saved;
  }

  const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
  return isDesktop ? 'compact' : 'comfortable';
};

export const UIDensityProvider = ({ children }: { children: ReactNode }) => {
  const [density, setDensityState] = useState<UIDensity>(getInitialDensity);

  // Persistência
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, density);
    document.documentElement.dataset.density = density;
  }, [density]);

  const setDensity = (d: UIDensity) => {
    setDensityState(d);
  };

  const toggleDensity = () => {
    setDensityState(prev => (prev === 'compact' ? 'comfortable' : 'compact'));
  };

  return (
    <UIDensityContext.Provider
      value={{
        density,
        setDensity,
        toggleDensity,
        isCompact: density === 'compact'
      }}
    >
      {children}
    </UIDensityContext.Provider>
  );
};

export const useUIDensity = () => {
  const ctx = useContext(UIDensityContext);
  if (!ctx) {
    throw new Error('useUIDensity deve ser usado dentro de UIDensityProvider');
  }
  return ctx;
};
