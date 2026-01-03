import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

export type UIDensity = 'compact' | 'comfortable';

interface UIDensityContextType {
  density: UIDensity;
  setDensity: (density: UIDensity) => void;
  toggleDensity: () => void;
}

/** 🔐 chave única no localStorage */
const STORAGE_KEY = 'ui-density';

/** 🎯 função inicial segura (SSR friendly) */
const getInitialDensity = (): UIDensity => {
  if (typeof window === 'undefined') return 'comfortable';

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'compact' || stored === 'comfortable') {
    return stored;
  }

  return window.innerWidth < 768 ? 'comfortable' : 'compact';
};

const UIDensityContext = createContext<UIDensityContextType | null>(null);

/* =========================
   PROVIDER
========================= */
export const UIDensityProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [density, setDensityState] =
    useState<UIDensity>(getInitialDensity);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, density);
  }, [density]);

  const setDensity = (value: UIDensity) => {
    setDensityState(value);
  };

  const toggleDensity = () => {
    setDensityState((prev) =>
      prev === 'compact' ? 'comfortable' : 'compact'
    );
  };

  return (
    <UIDensityContext.Provider
      value={{ density, setDensity, toggleDensity }}
    >
      {children}
    </UIDensityContext.Provider>
  );
};

/* =========================
   HOOK
========================= */
export const useUIDensity = () => {
  const ctx = useContext(UIDensityContext);
  if (!ctx) {
    throw new Error(
      'useUIDensity must be used inside UIDensityProvider'
    );
  }
  return ctx;
};
