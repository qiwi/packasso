import { Command, FlowController, Logger } from 'concurrently'

export class LogStart implements FlowController {
  private readonly logger: Logger

  public constructor({ logger }: { logger: Logger }) {
    this.logger = logger
  }

  public handle(commands: Command[]) {
    commands.forEach((command) =>
      command.timer.subscribe(({ endDate }) => {
        if (!endDate) {
          this.logger.logCommandEvent(command.command, command)
        }
      }),
    )

    return { commands }
  }
}
