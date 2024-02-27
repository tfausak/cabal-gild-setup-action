const core = require('@actions/core');
const httpClient = require('@actions/http-client');
const os = require('os');
const path = require('path');
const process = require('process');
const toolCache = require('@actions/tool-cache');

const HTTP_CLIENT = new httpClient.HttpClient('tfausak/cabal-gild-setup-action');
const TOOL_NAME = 'cabal-gild';

(async () => {
  try {
    const platform = process.platform;
    const architecture = os.arch();
    const extension = platform === 'win32' ? '.exe' : '';
    core.info(JSON.stringify({ platform, architecture }));

    let version = core.getInput('version');
    if (!version || version === 'latest') {
      // https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-the-latest-release
      const headers = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      };
      const token = process.env['GITHUB_TOKEN'];
      if (token) {
        core.info('got token');
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await HTTP_CLIENT.getJson('https://api.github.com/repos/tfausak/cabal-gild/releases/latest', headers);
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
