import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { originPrefersPopup } from '../originPrefersPopup';

// Mock the inIframe function
vi.mock('@/utils', () => ({
  inIframe: vi.fn(),
}));

// Import the mocked function
import { inIframe } from '@/utils';
const mockInIframe = vi.mocked(inIframe);

describe('originPrefersPopup', () => {
  // Store original location to restore after tests
  const originalLocation = window.location;

  // Helper function to mock window.location.hostname
  const mockLocationOrigin = (origin: string) => {
    let hostname: string;
    try {
      hostname = new URL(origin).hostname;
    } catch {
      hostname = origin;
    }
    Object.defineProperty(window, 'location', {
      value: {
        origin,
        hostname,
      },
      writable: true,
      configurable: true,
    });
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Set default origin
    mockLocationOrigin('https://example.com');
  });

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  describe('when in iframe', () => {
    it('should return true regardless of origin', () => {
      mockInIframe.mockReturnValue(true);
      mockLocationOrigin('https://not-a-preferred-origin.com');

      expect(originPrefersPopup()).toBe(true);
    });

    it('should return true even with preferred origin', () => {
      mockInIframe.mockReturnValue(true);
      mockLocationOrigin('https://app.lovable.app');

      expect(originPrefersPopup()).toBe(true);
    });
  });

  describe('when not in iframe', () => {
    beforeEach(() => {
      mockInIframe.mockReturnValue(false);
    });

    describe('with preferred origins', () => {
      it('should return true for .lovable.app domains', () => {
        mockLocationOrigin('https://app.lovable.app');
        expect(originPrefersPopup()).toBe(true);

        mockLocationOrigin('https://my-project.lovable.app');
        expect(originPrefersPopup()).toBe(true);
      });

      it('should return true for .lovableproject.com domains', () => {
        mockLocationOrigin('https://project.lovableproject.com');
        expect(originPrefersPopup()).toBe(true);

        mockLocationOrigin('https://demo.lovableproject.com');
        expect(originPrefersPopup()).toBe(true);
      });

      it('should return true for .webcontainer-api.io domains', () => {
        mockLocationOrigin('https://stackblitz.webcontainer-api.io');
        expect(originPrefersPopup()).toBe(true);

        mockLocationOrigin('https://container.webcontainer-api.io');
        expect(originPrefersPopup()).toBe(true);
      });

      it('should return true for .vusercontent.net domains', () => {
        mockLocationOrigin('https://codesandbox.vusercontent.net');
        expect(originPrefersPopup()).toBe(true);

        mockLocationOrigin('https://preview.vusercontent.net');
        expect(originPrefersPopup()).toBe(true);
      });

      it('should return true for .v0.dev domains', () => {
        mockLocationOrigin('https://preview.v0.dev');
        expect(originPrefersPopup()).toBe(true);

        mockLocationOrigin('https://app.v0.dev');
        expect(originPrefersPopup()).toBe(true);
      });

      it('should return true for .lp.dev domains', () => {
        mockLocationOrigin('https://preview.lp.dev');
        expect(originPrefersPopup()).toBe(true);

        mockLocationOrigin('https://app.lp.dev');
        expect(originPrefersPopup()).toBe(true);
      });

      it('should handle HTTPS and HTTP protocols', () => {
        mockLocationOrigin('http://localhost.lovable.app');
        expect(originPrefersPopup()).toBe(true);

        mockLocationOrigin('https://secure.v0.dev');
        expect(originPrefersPopup()).toBe(true);
      });
    });

    describe('with non-preferred origins', () => {
      it('should return false for common domains', () => {
        const nonPreferredOrigins = [
          'https://example.com',
          'https://google.com',
          'https://github.com',
          'https://localhost:3000',
          'https://app.mycompany.com',
          'https://production-site.com',
        ];

        nonPreferredOrigins.forEach(origin => {
          mockLocationOrigin(origin);
          expect(originPrefersPopup()).toBe(false);
        });
      });

      it('should return false for similar but non-matching domains', () => {
        const similarOrigins = [
          'https://lovable.app.com', // wrong order
          'https://notlovable.app', // different subdomain structure
          'https://lovableproject.org', // wrong TLD
          'https://webcontainer.io', // missing -api
          'https://vusercontent.com', // wrong TLD
          'https://v0.com', // missing .dev
          'https://v1.dev', // wrong subdomain
        ];

        similarOrigins.forEach(origin => {
          mockLocationOrigin(origin);
          expect(originPrefersPopup()).toBe(false);
        });
      });

      it('should return false for domains that contain preferred origins as substrings', () => {
        const containingOrigins = [
          'https://not-lovable.app-something.com',
          'https://fake-webcontainer-api.io.malicious.com',
          'https://evil-vusercontent.net.phishing.com',
        ];

        containingOrigins.forEach(origin => {
          mockLocationOrigin(origin);
          expect(originPrefersPopup()).toBe(false);
        });
      });
    });

    describe('edge cases', () => {
      it('should handle empty origin', () => {
        mockLocationOrigin('');
        expect(originPrefersPopup()).toBe(false);
      });

      it('should be case insensitive (hostnames are normalized to lowercase)', () => {
        mockLocationOrigin('https://app.LOVABLE.APP');
        expect(originPrefersPopup()).toBe(true);

        mockLocationOrigin('https://APP.V0.DEV');
        expect(originPrefersPopup()).toBe(true);
      });

      it('should handle malformed origins gracefully', () => {
        // These shouldn't normally happen, but we should handle them gracefully
        mockLocationOrigin('not-a-url');
        expect(originPrefersPopup()).toBe(false);

        mockLocationOrigin('file://');
        expect(originPrefersPopup()).toBe(false);
      });
    });
  });

  describe('integration scenarios', () => {
    it('should prioritize iframe detection over origin matching', () => {
      mockInIframe.mockReturnValue(true);
      mockLocationOrigin('https://definitely-not-preferred.com');

      expect(originPrefersPopup()).toBe(true);
      expect(mockInIframe).toHaveBeenCalledOnce();
    });

    it('should call inIframe function', () => {
      mockInIframe.mockReturnValue(false);
      mockLocationOrigin('https://example.com');

      originPrefersPopup();

      expect(mockInIframe).toHaveBeenCalledOnce();
    });

    it('should work with real-world scenarios', () => {
      // Scenario 1: Developer working in CodeSandbox
      mockInIframe.mockReturnValue(false);
      mockLocationOrigin('https://csb-123abc.vusercontent.net');
      expect(originPrefersPopup()).toBe(true);

      // Scenario 2: Developer working in StackBlitz
      mockLocationOrigin('https://stackblitz.webcontainer-api.io');
      expect(originPrefersPopup()).toBe(true);

      // Scenario 3: App embedded in iframe on regular domain
      mockInIframe.mockReturnValue(true);
      mockLocationOrigin('https://myapp.com');
      expect(originPrefersPopup()).toBe(true);

      // Scenario 4: Regular production app
      mockInIframe.mockReturnValue(false);
      mockLocationOrigin('https://myapp.com');
      expect(originPrefersPopup()).toBe(false);
    });
  });
});
