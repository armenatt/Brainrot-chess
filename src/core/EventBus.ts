import type { IGameEvents } from "../types/events";

export class EventBus {
  private listeners = new Map<string, Set<Function>>();

  on<K extends keyof IGameEvents>(
    event: K,
    fn: (data: IGameEvents[K]) => void
  ) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)?.add(fn);

    return () => this.listeners.get(event)?.delete(fn);
  }

  emit<K extends keyof IGameEvents>(event: K, data: IGameEvents[K]) {
    this.listeners.get(event)?.forEach((fn) => fn(data));
  }
}
