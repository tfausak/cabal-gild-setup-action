const core = require('@actions/core');
const fs = require('fs/promises');
const httpClient = require('@actions/http-client');
const os = require('os');
const process = require('process');
const toolCache = require('@actions/tool-cache');

const HTTP_CLIENT = new httpClient.HttpClient('@tfausak/cabal-gild-setup-action');
const TOOL_NAME = 'cabal-gild';

(async () => {
  try {
    const platform = process.platform;
    core.info(JSON.stringify({ platform }));
    const architecture = os.arch();
    core.info(JSON.stringify({ architecture }));
    const extension = platform === 'win32' ? '.exe' : '';
    core.info(JSON.stringify({ extension }));

    let version = core.getInput('version');
    if (!version || version === 'latest') {
      const response = await HTTP_CLIENT.getJson('https://api.github.com/repos/tfausak/cabal-gild/releases/latest');
      version = response.result.tag_name;
    }
    core.info(JSON.stringify({ version }));

    let dir = toolCache.find(TOOL_NAME, version);
    if (!dir) {
      const file = await toolCache.downloadTool(`https://github.com/tfausak/cabal-gild/releases/download/${version}/cabal-gild-${version}-${platform}-${architecture}${extension}`);
      await fs.chmod(file, 0o755);
      dir = await toolCache.cacheFile(file, `${TOOL_NAME}${extension}`, TOOL_NAME, version);
    }
    core.info(JSON.stringify({ dir }));

    core.addPath(dir);
  } catch (error) {
    core.setFailed(error);
  }
})();
