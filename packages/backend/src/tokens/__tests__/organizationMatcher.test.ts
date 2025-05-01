import { match } from '@clerk/shared/pathToRegexp';
import { describe, expect, it } from 'vitest';

import { OrganizationMatcher } from '../organizationMatcher';

describe('OrganizationMatcher', () => {
  describe('constructor', () => {
    it('should create matcher with no patterns when options are undefined', () => {
      const matcher = new OrganizationMatcher();
      expect(matcher).toBeInstanceOf(OrganizationMatcher);
    });

    it('should create matcher with organization patterns', () => {
      const matcher = new OrganizationMatcher({
        organizationPatterns: ['/orgs/:id'],
      });
      expect(matcher).toBeInstanceOf(OrganizationMatcher);
    });

    it('should create matcher with personal account patterns', () => {
      const matcher = new OrganizationMatcher({
        personalAccountPatterns: ['/account'],
      });
      expect(matcher).toBeInstanceOf(OrganizationMatcher);
    });

    it('should throw error for invalid organization pattern', () => {
      expect(() => {
        new OrganizationMatcher({
          organizationPatterns: ['/orgs/:id/***'], // Definitely invalid pattern
        });
      }).toThrow(/Invalid pattern/);
    });

    it('should throw error for invalid personal account pattern', () => {
      expect(() => {
        new OrganizationMatcher({
          personalAccountPatterns: ['/account/***'], // Definitely invalid pattern
        });
      }).toThrow(/Invalid pattern/);
    });
  });

  describe('findTarget', () => {
    it('should return null for no patterns', () => {
      const matcher = new OrganizationMatcher();
      const url = new URL('http://localhost:3000/orgs/123');
      expect(matcher.findTarget(url)).toBeNull();
    });

    it('should find organization by ID', () => {
      const matcher = new OrganizationMatcher({
        organizationPatterns: ['/orgs/:id'],
      });
      const url = new URL('http://localhost:3000/orgs/123');
      expect(matcher.findTarget(url)).toEqual({
        type: 'organization',
        organizationId: '123',
      });
    });

    it('should find organization by slug', () => {
      const matcher = new OrganizationMatcher({
        organizationPatterns: ['/orgs/:slug'],
      });
      const url = new URL('http://localhost:3000/orgs/my-org');
      expect(matcher.findTarget(url)).toEqual({
        type: 'organization',
        organizationSlug: 'my-org',
      });
    });

    it('should find personal account', () => {
      const matcher = new OrganizationMatcher({
        personalAccountPatterns: ['/account'],
      });
      const url = new URL('http://localhost:3000/account');
      expect(matcher.findTarget(url)).toEqual({
        type: 'personalAccount',
      });
    });

    it('should prioritize organization over personal account', () => {
      const matcher = new OrganizationMatcher({
        organizationPatterns: ['/orgs/:id'],
        personalAccountPatterns: ['/orgs/:id'], // Same pattern
      });
      const url = new URL('http://localhost:3000/orgs/123');
      expect(matcher.findTarget(url)).toEqual({
        type: 'organization',
        organizationId: '123',
      });
    });

    it('should handle nested paths', () => {
      const matcher = new OrganizationMatcher({
        organizationPatterns: ['/orgs/:id/(.*)'],
      });
      const url = new URL('http://localhost:3000/orgs/123/settings');
      expect(matcher.findTarget(url)).toEqual({
        type: 'organization',
        organizationId: '123',
      });
    });

    it('should handle multiple patterns', () => {
      const matcher = new OrganizationMatcher({
        organizationPatterns: ['/orgs/:id', '/teams/:id'],
      });
      const url = new URL('http://localhost:3000/teams/123');
      expect(matcher.findTarget(url)).toEqual({
        type: 'organization',
        organizationId: '123',
      });
    });

    it('should return null for non-matching paths', () => {
      const matcher = new OrganizationMatcher({
        organizationPatterns: ['/orgs/:id'],
      });
      const url = new URL('http://localhost:3000/other/123');
      expect(matcher.findTarget(url)).toBeNull();
    });
  });

  describe('pathToRegexp behavior', () => {
    it('should throw error for invalid pattern', () => {
      expect(() => {
        match(['/orgs/:id/***']);
      }).toThrow();
    });
  });
});
