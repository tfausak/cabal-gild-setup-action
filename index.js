const core = require('@actions/core');
const httpClient = require('@actions/http-client');
const path = require('path');
const toolCache = require('@actions/tool-cache');

const HTTP_CLIENT = new httpClient.HttpClient('tfausak/cabal-gild-setup-action');
const TOOL_NAME = 'cabal-gild';

(async () => {
  try {
    const platform = core.platform.platform;
    const architecture = core.platform.arch;
    const extension = core.platform.isWindows ? '.exe' : '';
    core.info(JSON.stringify({ platform, architecture }));

    let version = core.getInput('version');
    if (!version || version === 'latest') {
      // https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-the-latest-release
      const response = await HTTP_CLIENT.getJson('https://api.github.com/repos/tfausak/cabal-gild/releases/latest', {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
      });
      version = response.result.tag_name;
    }
    core.info(JSON.stringify({ version }));

    let dir = toolCache.find(TOOL_NAME, version);
    if (!dir) {
      const file = await toolCache.downloadTool(`https://github.com/tfausak/cabal-gild/releases/download/${version}/cabal-gild-${version}-${platform}-${architecture}.tar.gz`);
      const directory = await toolCache.extractTar(file);
      dir = await toolCache.cacheFile(path.join(directory, `${TOOL_NAME}${extension}`), `${TOOL_NAME}${extension}`, TOOL_NAME, version);
    }
    core.info(JSON.stringify({ dir }))

    core.addPath(dir);
  } catch (error) {
    core.setFailed(error);
  }
})();
