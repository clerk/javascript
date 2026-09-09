require('./proof-network');
const { registerRootComponent } = require('expo');
const App = require('./ProofApp').default;
registerRootComponent(App);
