import {
  concurrently,
  ConcurrentlyCommandInput,
  ConcurrentlyOptions,
  InputHandler,
  KillOnSignal,
  KillOthers,
  LogError,
  LogExit,
  Logger,
  LogOutput,
  LogTimings,
  RestartProcess,
} from 'concurrently'

import { LogStart } from './LogStart'

export default (
  commands: ConcurrentlyCommandInput[],
  options: Partial<ConcurrentlyOptions> = {},
) => {
  const logger = new Logger({
    hide: options.hide,
    prefixFormat: options.prefix,
    prefixLength: options.prefixLength,
    raw: options.raw,
    timestampFormat: options.timestampFormat,
  })

  return concurrently(commands, {
    maxProcesses: options.maxProcesses,
    raw: options.raw,
    successCondition: options.successCondition,
    cwd: options.cwd,
    logger,
    outputStream: options.outputStream || process.stdout,
    group: options.group,
    controllers: [
      new LogError({ logger }),
      new LogOutput({ logger }),
      new LogStart({ logger }),
      new LogExit({ logger }),
      new InputHandler({
        logger,
        defaultInputTarget: options.defaultInputTarget,
        inputStream:
          options.inputStream ||
          (options.handleInput ? process.stdin : undefined),
        pauseInputStreamOnFinish: options.pauseInputStreamOnFinish,
      }),
      new KillOnSignal({ process }),
      new RestartProcess({
        logger,
        delay: options.restartDelay,
        tries: options.restartTries,
      }),
      new KillOthers({
        logger,
        conditions: options.killOthers || [],
        killSignal: options.killSignal,
      }),
      new LogTimings({
        logger: options.timings ? logger : undefined,
        timestampFormat: options.timestampFormat,
      }),
    ],
    prefixColors: options.prefixColors || [],
    additionalArguments: options.additionalArguments,
  })
}

export { type ConcurrentlyOptions } from 'concurrently'
