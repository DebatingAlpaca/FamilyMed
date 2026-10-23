import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { setApiPatient, setApiUser } from './api';

type Session = { userId: string; nome: string } | null;
type Ctx = {
  session: Session;
  loading: boolean;
  patientId: string | null;
  patientsVersion: number;
  signIn: (s: { userId: string; nome: string }) => Promise<void>;
  signOut: () => Promise<void>;
  setPatient: (id: string) => Promise<void>;
  bumpPatients: () => void;
};

const SessionContext = createContext<Ctx>(null as any);
export const useSession = () => useContext(SessionContext);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientsVersion, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['session', 'patientId']).then(([[, raw], [, pid]]) => {
      if (raw) {
        const s = JSON.parse(raw);
        setApiUser(s.userId);
        setSession(s);
        if (pid) { setApiPatient(pid); setPatientId(pid); }
      }
      setLoading(false);
    });
  }, []);

  const signIn = async (s: { userId: string; nome: string }) => {
    setApiUser(s.userId);
    await AsyncStorage.setItem('session', JSON.stringify(s));
    setSession(s);
  };

  const signOut = async () => {
    setApiUser(null);
    setApiPatient(null);
    await AsyncStorage.multiRemove(['session', 'patientId']);
    setPatientId(null);
    setSession(null);
  };

  const setPatient = async (id: string) => {
    setApiPatient(id);
    setPatientId(id);
    await AsyncStorage.setItem('patientId', id);
  };

  const bumpPatients = () => setVersion((v) => v + 1);

  return (
    <SessionContext.Provider value={{ session, loading, patientId, patientsVersion, signIn, signOut, setPatient, bumpPatients }}>
      {children}
    </SessionContext.Provider>
  );
}
