const core = require('@actions/core');
const fs = require('fs/promises');
const os = require('os');
const process = require('process');
const tc = require('@actions/tool-cache');

const TOOL_NAME = 'cabal-gild';
const LATEST_VERSION = '1.0.0.0';

(async () => {
  try {
    const platform = process.platform;
    const architecture = os.arch();
    const extension = platform === 'win32' ? '.exe' : '';

    let version = core.getInput('version');
    if (!version || version === 'latest') {
      version = LATEST_VERSION;
    }

    let dir = tc.find(TOOL_NAME, version);
    if (!dir) {
      const file = await tc.downloadTool(`https://github.com/tfausak/${TOOL_NAME}/releases/download/${version}/${TOOL_NAME}-${version}-${platform}-${architecture}${extension}`);
      await fs.chmod(file, 0o755);
      dir = await tc.cacheFile(file, `${TOOL_NAME}${extension}`, TOOL_NAME, version);
    }

    core.addPath(dir);
  } catch (error) {
    core.setFailed(error);
  }
})();
