type EventName = 'confirmInsert' | 'nextStep' | 'prevStep' | 'run' | 'stop' | 'setSpeed';

type Listener = (payload?: any) => void;

const listeners: Record<string, Listener[]> = {};

const subscribe = (event: EventName, cb: Listener) => {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(cb);
  return () => {
    listeners[event] = listeners[event].filter(l => l !== cb);
  };
};

const emit = (event: EventName, payload?: any) => {
  (listeners[event] || []).slice().forEach(cb => cb(payload));
};

export default {
  subscribe,
  emit,
};
