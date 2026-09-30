import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

globalThis.alert = vi.fn();
globalThis.confirm = vi.fn(() => true);


if (!globalThis.crypto?.randomUUID) {
  globalThis.crypto = {
    ...globalThis.crypto,
    randomUUID: () => 'uuid-de-teste-' + Math.random().toString(36).slice(2),
  };
}


if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}


if (!globalThis.matchMedia) {
  globalThis.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
