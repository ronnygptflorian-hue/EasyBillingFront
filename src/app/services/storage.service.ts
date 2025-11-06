import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';

type Stored<T> = { v: T; e?: number };

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private subjects = new Map<string, BehaviorSubject<any>>();
  private memory = new Map<string, string>();
  private readonly available = this.isAvailable();

  set<T>(key: string, value: T, opts?: { ttlMs?: number }): void {
    const payload: Stored<T> = {
      v: value,
      e: opts?.ttlMs ? Date.now() + opts.ttlMs : undefined,
    };
    this.setRaw(key, JSON.stringify(payload));
    this.emit(key);
  }

  get<T>(key: string, defaultValue: T | null = null): T | null {
    const raw = this.getRaw(key);
    if (!raw) return defaultValue;

    try {
      const parsed = JSON.parse(raw) as Stored<T> | T;
      if (parsed && typeof parsed === 'object' && 'v' in (parsed as any)) {
        const box = parsed as Stored<T>;
        if (box.e && Date.now() > box.e) {
          this.remove(key); // expirado
          return defaultValue;
        }
        return (box.v ?? defaultValue) as T | null;
      }
      return (parsed as T) ?? defaultValue;
    } catch {
      return (raw as unknown as T) ?? defaultValue;
    }
  }

  remove(key: string): void {
    this.available ? localStorage.removeItem(key) : this.memory.delete(key);
    this.emit(key);
  }

  clear(): void {
    this.available ? localStorage.clear() : this.memory.clear();
    for (const key of this.subjects.keys()) this.emit(key);
  }

  has(key: string): boolean {
    return this.getRaw(key) !== null;
  }

  keys(): string[] {
    if (this.available) {
      const out: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) out.push(k);
      }
      return out;
    }
    return Array.from(this.memory.keys());
  }

  watch<T>(key: string) {
    if (!this.subjects.has(key)) {
      this.subjects.set(key, new BehaviorSubject<T | null>(this.get<T>(key)));
      if (this.available && typeof window !== 'undefined') {
        fromEvent<StorageEvent>(window, 'storage').subscribe((e) => {
          if (e.storageArea === localStorage && e.key === key) this.emit(key);
        });
      }
    }
    return this.subjects.get(key)!.asObservable();
  }

  merge<T extends object>(key: string, patch: Partial<T>) {
    const current = (this.get<T>(key) ?? {}) as T;
    this.set<T>(key, { ...current, ...patch } as T);
  }

  getField<T = unknown>(key: string, path: string): T | null {
    const obj = this.get<any>(key);
    if (obj == null) return null;
    return path.split('.').reduce<any>((acc, p) => (acc ? acc[p] : undefined), obj) ?? null;
  }

  private isAvailable(): boolean {
    try {
      const t = '__ls_test__';
      localStorage.setItem(t, '1');
      localStorage.removeItem(t);
      return true;
    } catch {
      return false;
    }
  }

  private getRaw(key: string): string | null {
    return this.available ? localStorage.getItem(key) : this.memory.get(key) ?? null;
    }

  private setRaw(key: string, value: string): void {
    if (this.available) localStorage.setItem(key, value);
    else this.memory.set(key, value);
  }

  private emit(key: string): void {
    const s = this.subjects.get(key);
    if (s) s.next(this.get(key));
  }
}
