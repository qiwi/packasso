import { Context } from '@packasso/core'
import { Command, Commands, npx } from '@packasso/core'

const pkgNpx: (context: Context, prefix: string) => Promise<unknown> = async (
  { pkg, root, command, args },
  prefix,
) => {
  for (const module of pkg.modules) {
    await npx(pkg, root, module, command, args, {
      prefix,
    })
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
