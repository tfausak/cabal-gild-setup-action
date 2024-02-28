# cabal-gild-setup-action

This action installs the `cabal-gild` executable from the [Gild][] project,
which can be used to format Haskell package descriptions (`*.cabal` files).

[Gild]: https://github.com/tfausak/cabal-gild

## Usage

Basic usage:

``` yaml
jobs:
  gild:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - uses: tfausak/cabal-gild-setup-action@v2
        with:
          token: ${{ github.token }}
      - run: cabal-gild --input my-package.cabal --mode check
```

Specifying a version:

``` yaml
jobs:
  gild:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - uses: tfausak/cabal-gild-setup-action@v2
        with:
          version: 1.1.0.0
      - run: cabal-gild --input my-package.cabal --mode check
```

## Inputs

- `token`: Optional, no default. The token to use when communicating with
  GitHub's API to get the latest release of Gild. Usually this should be set to
  `${{ github.token }}`. If it's unset, the API request will be unauthenticated
  and may be rate limited.

- `version`: Optional, defaults to `latest`. The version of Gild to use. Find
  versions on [the releases page][]. `v1` of this action supports `< 1.0.2.1`.
  `v2` of this action supports `>= 1.0.2.1`.

[the releases page]: https://github.com/tfausak/cabal-gild/releases
