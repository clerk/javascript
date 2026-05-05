module.exports = {
  dependency: {
    platforms: {
      ios: {},
      android: {
        packageImportPath: 'import expo.modules.clerk.ClerkPackage;',
        packageInstance: 'new ClerkPackage()',
      },
    },
  },
};
