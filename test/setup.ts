import { vi } from 'vitest';

class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

const createCanvasContextMock = (): CanvasRenderingContext2D =>
  ({
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    clip: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    lineTo: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    moveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    rect: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    scale: vi.fn(),
    stroke: vi.fn(),
    strokeRect: vi.fn(),
  }) as unknown as CanvasRenderingContext2D;

globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

if (!globalThis.PointerEvent) {
  globalThis.PointerEvent = MouseEvent as unknown as typeof PointerEvent;
}

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: vi.fn(() => createCanvasContextMock()),
});

Object.defineProperty(Element.prototype, 'setPointerCapture', {
  configurable: true,
  value: vi.fn(),
});

Object.defineProperty(Element.prototype, 'releasePointerCapture', {
  configurable: true,
  value: vi.fn(),
});

Object.defineProperty(Element.prototype, 'hasPointerCapture', {
  configurable: true,
  value: vi.fn(() => false),
});

Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  get() {
    const testWidth = this.dataset?.testWidth;
    if (testWidth) return Number(testWidth);
    if (this.classList?.contains('tm-minimap') || this instanceof HTMLCanvasElement) return 1000;
    if (this.tagName === 'TABLE') return 1000;
    if (this.tagName === 'TH' || this.tagName === 'TD') return 50;
    return 500;
  },
});

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  get() {
    const testHeight = this.dataset?.testHeight;
    if (testHeight) return Number(testHeight);
    if (this.classList?.contains('tm-minimap') || this instanceof HTMLCanvasElement) return 100;
    return 100;
  },
});

Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  get() {
    const testClientWidth = this.dataset?.testClientWidth;
    if (testClientWidth) return Number(testClientWidth);
    if (this.classList?.contains('tm-minimap') || this instanceof HTMLCanvasElement) return 1000;
    return 500;
  },
});

Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
  configurable: true,
  get() {
    const testScrollWidth = this.dataset?.testScrollWidth;
    if (testScrollWidth) return Number(testScrollWidth);
    if (this.tagName === 'TABLE') return 1000;
    return 1000;
  },
});

Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
  configurable: true,
  value(this: HTMLElement, options?: ScrollToOptions | number, y?: number) {
    if (typeof options === 'number') {
      this.scrollLeft = options;
      this.scrollTop = y ?? this.scrollTop;
      return;
    }

    if (typeof options?.left === 'number') {
      this.scrollLeft = options.left;
    }
    if (typeof options?.top === 'number') {
      this.scrollTop = options.top;
    }
  },
});

if (!document.execCommand) {
  document.execCommand = vi.fn(() => true);
}

