import lodash from 'lodash'
import axios from 'axios'
const jobName = process.argv[2];
type MessageType = {
  type: string;
  functionString: string;
  ctx: Record<string, any>
}
console.log = (data, ...optionalParams) => {
  if (optionalParams.length) {
    optionalParams.forEach(value => {
      if (typeof value === 'object' && !(value instanceof Date)) value = JSON.stringify(value)
      data += ` ${value}`
    })
  }
  process.send({ type: 'log', data })
}
process.on('message', async (message: MessageType) => {
  if (message.type === 'jobFunction') {
    try {
      const fn = eval(`async (ctx) => await (${message.functionString})(ctx)`);
      process.send({ type: 'system', data: 'Starting job...' });
      await fn({
        ...message.ctx,
        packages: {
          lodash,
          axios
        }
      });
      process.send({ type: 'system', data: 'Job completed.' });
      process.exit(0);
    } catch (error) {
      if (error.stack) {
        const reg = new RegExp("(?<=anonymous\\>:).*(?=\\))", 'g')
        const location = error.stack.match(reg)[0]
        process.send({ type: 'error', data: `Job failed: ${error} <${jobName}:${location}>` });
      }
      else process.send({ type: 'error', data: `Job failed: ${error.message}` });
      process.exit(1);
    }
  }
});

process.on('uncaughtException', (err) => {
  process.send({ type: 'error', data: `Uncaught exception: ${err.message}` });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  process.send({ type: 'error', data: `Unhandled rejection: ${reason}` });
  process.exit(1);
});