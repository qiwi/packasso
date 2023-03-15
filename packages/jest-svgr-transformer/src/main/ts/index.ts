import { basename, parse } from 'node:path'

import { camelCase, startCase } from 'lodash-es'

export default {
  process: (source: string, filename: string) => {
    const content = JSON.stringify(basename(filename))
    const name = `Svg${startCase(camelCase(parse(filename).name))}`
    return {
      code: `
        const React = require('react');
        module.exports = {
          __esModule: true,
          default: ${content},
          ReactComponent: React.forwardRef(function ${name}(props, ref) {
            return {
              $$typeof: Symbol.for('react.element'),
              type: 'svg',
              ref: ref,
              key: null,
              props: Object.assign({}, props, {
                children: ${content}
              })
            };
          }),
        };
      `,
    }
  },
}
