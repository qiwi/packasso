# @packasso/cli
# @packasso

<p align="center">
  <img alt="Pablo Picasso" src="https://raw.githubusercontent.com/qiwi/packasso/master/pablo-picasso-self-portrait-1972-06-30.webp" width="200" />&nbsp;
  <img alt="Pablo Picasso" src="https://raw.githubusercontent.com/qiwi/packasso/master/pablo-picasso-self-portrait-1972-07-02.webp" width="200" />&nbsp;
  <img alt="Pablo Picasso" src="https://raw.githubusercontent.com/qiwi/packasso/master/pablo-picasso-self-portrait-1972-07-03.webp" width="200" />&nbsp;
  <br/>
  <i>Postimpressive presets packages</i>
</p>

<details>

<summary>🎨</summary>

[![Release](https://github.com/qiwi/packasso/actions/workflows/release.yml/badge.svg?branch=master)](https://github.com/qiwi/packasso/actions/workflows/release.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/aaced5b2261f8a59b7cd/maintainability)](https://codeclimate.com/github/qiwi/packasso/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/aaced5b2261f8a59b7cd/test_coverage)](https://codeclimate.com/github/qiwi/packasso/test_coverage)

</details>

## Quick Start

Packasso config refers to one or more preset modules. Pick them as the `packasso` field in your `package.json`:

```json
{
  "name": "pablo-picasso",
  "version": "1972.07.03",
  "packasso": "@packasso/preset-ts-tsc-uvu"
}
```

Then run packasso:

```shell
npx @packasso/cli install
```

Get impressions.

## License

[MIT](./LICENSE)
