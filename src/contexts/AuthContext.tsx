import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';
import { db } from '@/lib/storage';
import { hashPassword, verifyPassword } from '@/lib/utils';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  college: string;
  university: string;
  course: string;
  branch: string;
  year: number;
  semester: number;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Omit<User, 'id' | 'passwordHash' | 'createdAt'>>) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = db.session.get();
    if (userId) {
      const u = db.users.findById(userId);
      if (u) setUser(u);
      else db.session.clear();
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const u = db.users.findByEmail(email);
    if (!u || !verifyPassword(password, u.passwordHash)) {
      throw new Error('Invalid email or password');
    }
    db.session.set(u.id);
    setUser(u);
  };

  const register = async (data: RegisterData) => {
    if (db.users.findByEmail(data.email)) {
      throw new Error('An account with this email already exists');
    }
    const { password, ...rest } = data;
    const u = db.users.create({ ...rest, passwordHash: hashPassword(password) });
    db.session.set(u.id);
    setUser(u);
  };

  const logout = () => {
    db.session.clear();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<Omit<User, 'id' | 'passwordHash' | 'createdAt'>>) => {
    if (!user) return;
    const updated = db.users.update(user.id, updates);
    setUser(updated);
  };

  const changePassword = async (current: string, next: string) => {
    if (!user) return;
    if (!verifyPassword(current, user.passwordHash)) {
      throw new Error('Current password is incorrect');
    }
    const updated = db.users.update(user.id, { passwordHash: hashPassword(next) });
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}
