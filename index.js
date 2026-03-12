import * as core from '@actions/core';
import { HttpClient } from '@actions/http-client';
import os from 'os';
import path from 'path';
import process from 'process';
import * as toolCache from '@actions/tool-cache';

const USER = 'tfausak';
const REPO = 'cabal-gild';

const HTTP = new HttpClient(`${USER}/${REPO}`);
const TOOL = REPO;

try {
  const platform = process.platform;
  const architecture = os.arch();
  const extension = platform === 'win32' ? '.exe' : '';
  core.info(`Platform is ${JSON.stringify(platform)}.`);
  core.info(`Architecture is ${JSON.stringify(architecture)}.`);

  let version = core.getInput('version');
  core.info(`Requested version is ${JSON.stringify(version)}.`);
  if (!version || version === 'latest') {
    core.info('Getting latest version ...');
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    const token = core.getInput('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await HTTP.getJson(
      `https://api.github.com/repos/${USER}/${REPO}/releases/latest`,
      headers);
    version = response.result.tag_name;
  }
  core.info(`Actual version is ${JSON.stringify(version)}.`);

  let dir = toolCache.find(TOOL, version);
  if (dir) {
    core.info('Using cached executable ...');
  } else {
    core.info('Downloading executable ...');
    const file = await toolCache.downloadTool(
      `https://github.com/${USER}/${REPO}/releases/download/${version}/${TOOL}-${version}-${platform}-${architecture}.tar.gz`);
    const directory = await toolCache.extractTar(file);
    dir = await toolCache.cacheFile(
      path.join(directory, `${TOOL}${extension}`),
      `${TOOL}${extension}`,
      TOOL,
      version);
  }
  core.info(`Executable installed in ${JSON.stringify(dir)}.`);

  core.addPath(dir);
} catch (error) {
  core.setFailed(error);
}
