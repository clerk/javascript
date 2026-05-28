import { describe, expect, test, vi } from 'vitest';

/* eslint-disable @typescript-eslint/no-require-imports -- CJS plugin, no ESM export */
const { CLERK_IOS_REQUIREMENT, findOrCreateClerkIOSPackageReference, findOrCreateSwiftPackageProductDependency } =
  require('../../app.plugin.js')._testing;
/* eslint-enable @typescript-eslint/no-require-imports */

const createXcodeProject = objects => ({
  generateUuid: vi.fn(),
  hash: {
    project: {
      objects: {
        XCRemoteSwiftPackageReference: {},
        XCSwiftPackageProductDependency: {},
        PBXProject: {},
        PBXNativeTarget: {},
        ...objects,
      },
    },
  },
});

describe('clerk-ios Swift package helpers', () => {
  test('updates an existing clerk-ios package reference in place', () => {
    const xcodeProject = createXcodeProject({
      XCRemoteSwiftPackageReference: {
        PACKAGE_REF: {
          isa: 'XCRemoteSwiftPackageReference',
          repositoryURL: '"https://github.com/clerk/clerk-ios.git"',
          requirement: { kind: 'exactVersion', version: '1.0.0' },
        },
      },
    });

    const packageUuid = findOrCreateClerkIOSPackageReference(xcodeProject);

    expect(packageUuid).toBe('PACKAGE_REF');
    expect(xcodeProject.generateUuid).not.toHaveBeenCalled();
    expect(xcodeProject.hash.project.objects.XCRemoteSwiftPackageReference.PACKAGE_REF).toMatchObject({
      repositoryURL: 'https://github.com/clerk/clerk-ios.git',
      requirement: CLERK_IOS_REQUIREMENT,
    });
  });

  test('removes duplicate clerk-ios package references and their product dependencies', () => {
    const xcodeProject = createXcodeProject({
      XCRemoteSwiftPackageReference: {
        PACKAGE_REF: {
          isa: 'XCRemoteSwiftPackageReference',
          repositoryURL: 'https://github.com/clerk/clerk-ios.git',
          requirement: { kind: 'exactVersion', version: '1.0.0' },
        },
        DUPLICATE_PACKAGE_REF: {
          isa: 'XCRemoteSwiftPackageReference',
          repositoryURL: 'https://github.com/clerk/clerk-ios.git',
          requirement: CLERK_IOS_REQUIREMENT,
        },
      },
      XCSwiftPackageProductDependency: {
        KIT_REF: {
          isa: 'XCSwiftPackageProductDependency',
          package: 'PACKAGE_REF',
          productName: 'ClerkKit',
        },
        DUPLICATE_KIT_REF: {
          isa: 'XCSwiftPackageProductDependency',
          package: 'DUPLICATE_PACKAGE_REF',
          productName: 'ClerkKit',
        },
      },
      PBXProject: {
        PROJECT_REF: {
          packageReferences: [
            { value: 'PACKAGE_REF', comment: 'clerk-ios' },
            { value: 'DUPLICATE_PACKAGE_REF', comment: 'clerk-ios' },
          ],
        },
      },
      PBXNativeTarget: {
        TARGET_REF: {
          packageProductDependencies: [
            { value: 'KIT_REF', comment: 'ClerkKit' },
            { value: 'DUPLICATE_KIT_REF', comment: 'ClerkKit' },
          ],
        },
      },
    });

    const packageUuid = findOrCreateClerkIOSPackageReference(xcodeProject);

    expect(packageUuid).toBe('PACKAGE_REF');
    expect(xcodeProject.hash.project.objects.XCRemoteSwiftPackageReference).not.toHaveProperty('DUPLICATE_PACKAGE_REF');
    expect(xcodeProject.hash.project.objects.XCSwiftPackageProductDependency).not.toHaveProperty('DUPLICATE_KIT_REF');
    expect(xcodeProject.hash.project.objects.PBXProject.PROJECT_REF.packageReferences).toEqual([
      { value: 'PACKAGE_REF', comment: 'clerk-ios' },
    ]);
    expect(xcodeProject.hash.project.objects.PBXNativeTarget.TARGET_REF.packageProductDependencies).toEqual([
      { value: 'KIT_REF', comment: 'ClerkKit' },
    ]);
  });

  test('reuses a matching Swift package product dependency', () => {
    const xcodeProject = createXcodeProject({
      XCSwiftPackageProductDependency: {
        KIT_REF: {
          isa: 'XCSwiftPackageProductDependency',
          package: 'PACKAGE_REF',
          productName: 'ClerkKit',
        },
      },
    });

    const productUuid = findOrCreateSwiftPackageProductDependency(xcodeProject, 'PACKAGE_REF', 'ClerkKit');

    expect(productUuid).toBe('KIT_REF');
    expect(xcodeProject.generateUuid).not.toHaveBeenCalled();
  });

  test('creates a missing Swift package product dependency', () => {
    const xcodeProject = createXcodeProject({});
    xcodeProject.generateUuid.mockReturnValueOnce('NEW_KIT_REF');

    const productUuid = findOrCreateSwiftPackageProductDependency(xcodeProject, 'PACKAGE_REF', 'ClerkKit');

    expect(productUuid).toBe('NEW_KIT_REF');
    expect(xcodeProject.hash.project.objects.XCSwiftPackageProductDependency.NEW_KIT_REF).toEqual({
      isa: 'XCSwiftPackageProductDependency',
      package: 'PACKAGE_REF',
      productName: 'ClerkKit',
    });
  });
});
