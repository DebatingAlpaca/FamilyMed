import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { Colors, Mode, palettes } from './theme';

type Ctx = { mode: Mode; toggle: () => void; colors: Colors };
const ThemeCtx = createContext<Ctx>({ mode: 'light', toggle: () => {}, colors: palettes.light });

export const useTheme = () => useContext(ThemeCtx);
export const useColors = () => useContext(ThemeCtx).colors;

// Estilos montados com a paleta atual; recalculados quando o modo muda.
// Como TODO componente chama este hook, todos se atualizam na hora.
export function useStyles<T>(factory: (c: Colors) => T): T {
  const colors = useColors();
  return useMemo(() => factory(colors), [colors, factory]);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('theme').then((v) => {
      const m: Mode = v ? (v === 'dark' ? 'dark' : 'light') : Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
      setMode(m);
      setReady(true);
    });
  }, []);

  const toggle = () => {
    setMode((prev) => {
      const next: Mode = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem('theme', next);
      return next;
    });
  };

  const value = useMemo(() => ({ mode, toggle, colors: palettes[mode] }), [mode]);
  if (!ready) return null;
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
