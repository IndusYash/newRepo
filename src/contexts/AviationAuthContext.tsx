import React from 'react';

// Demo user object (customize as desired)
const fakeUser = { name: 'Demo Spotter', email: 'demo@aviationbay.app' };

// Optional: explicit context type for better TS safety
type AviationAuthContextType = {
  user: { name: string; email: string; id?: string }
  isAuthenticated: boolean
  login: () => void
  signup: () => void
  logout: () => void
  updateProfile: (data?: any) => void
}

export const AviationAuthContext = React.createContext<AviationAuthContextType>({
  user: fakeUser,
  isAuthenticated: true,
  login: () => {},
  signup: () => {},
  logout: () => {},
  updateProfile: () => {}
});

// Fix: explicitly type children to avoid implicit any
export const AuthProvider = ({ children }: { children: React.ReactNode }) => (
  <AviationAuthContext.Provider
    value={{
      user: fakeUser,
      isAuthenticated: true,
      login: () => {},
      signup: () => {},
      logout: () => {},
      updateProfile: () => {}
    }}
  >
    {children}
  </AviationAuthContext.Provider>
);
