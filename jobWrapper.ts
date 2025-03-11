const jobName = process.argv[2];
type MessageType = {
  type: string;
  functionString: string;
  ctx: Record<string, any>
}
/*
  1. console.log more than 1 parameter will not saved
  2. printing process.env not working
 */
console.log = (data) => process.send({ type: 'log', data })
process.on('message', async (message: MessageType) => {
  if (message.type === 'jobFunction') {
    try {
      const fn = eval(`async () => await (${message.functionString})(${JSON.stringify(message.ctx)})`);
      process.send({ type: 'system', data: 'Starting job...' });
      await fn();
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