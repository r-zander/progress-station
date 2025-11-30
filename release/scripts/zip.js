const { execSync } = require('child_process');
const { name, version } = require('../../package.json');

execSync(`bestzip ${name}-${version}.zip audio/ css/ fonts/ img/ js/ vendor/ index.html LICENSE README.md`, { stdio: 'inherit' });
