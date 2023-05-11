import { env } from 'node:process'

import { cmd, Command, Commands, Context, execute, npx } from '@packasso/core'

const pkgNpx: (context: Context, prefix: string) => Promise<unknown> = async (
  context,
  prefix,
) => {
  for (const module of context.pkg.modules) {
    await execute(
      cmd(
        `${npx(context.pkg, context.root, module)} ${context.command}`,
        context.args,
        {
          NODE_ENV: env.NODE_ENV,
          NPM_CONFIG_YES: env.NPM_CONFIG_YES,
        },
      ),
      context.pkg,
      {
        prefix,
      },
    )
  }
}

const cmdNpx: (prefix: boolean) => Command = (prefix) => async (context) => {
  const { all, reverse, ...args } = context.args
  const apkgs = [...(all ? context.pkgs : []), context.pkg]
  const fpkgs = reverse ? apkgs.reverse() : apkgs
  for (const pkg of fpkgs) {
    await pkgNpx({ ...context, pkg, args }, prefix ? `[${pkg.name}]` : 'none')
  }
}

const cmdNpxWithPrefix = cmdNpx(true)
const cmdNpxNonePrefix = cmdNpx(false)

export const commands: Commands = new Proxy(
  {
    install: async (context) => {
      await cmdNpxWithPrefix({
        ...context,
        args: { ...context.args, all: true, reverse: false },
      })
    },
    uninstall: async (context) => {
      await cmdNpxWithPrefix({
        ...context,
        args: { ...context.args, all: true, reverse: true },
      })
    },
  },
  {
    get: (target, prop, receiver) => {
      if (Reflect.ownKeys(target).includes(prop)) {
        return Reflect.get(target, prop, receiver)
      }
      return cmdNpxNonePrefix
    },
  },
)
