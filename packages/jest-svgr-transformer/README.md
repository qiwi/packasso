# @packasso/jest-svgr-transformer

[![Maintainability](https://api.codeclimate.com/v1/badges/aaced5b2261f8a59b7cd/maintainability)](https://codeclimate.com/github/qiwi/packasso/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/aaced5b2261f8a59b7cd/test_coverage)](https://codeclimate.com/github/qiwi/packasso/test_coverage)

[Jest SVG transformer](https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object) compatible with [@svgr/webpack](https://react-svgr.com/) loader

## Usage

```json
{
  "transform": {
    "^.+\\.svg$": "@packasso/jest-svgr-transformer"
  }
}
```

## License

[MIT](./LICENSE)
