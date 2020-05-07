#!/usr/bin/env node
'use strict';

// 防止未知错误导致进程崩溃
process.on('unhandledRejection', err => {
  throw err;
});

const spawn = require('cross-spawn');
const args = process.argv.slice(2);

//get the args of input
const scriptIndex = args.findIndex(
  x => x === 'build' || x === 'start' || x === 'test' || x === "buildWatch"
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

if (['build', 'start', 'test','buildWatch'].includes(script)) {
  const result = spawn.sync(
    'node',
    nodeArgs
      .concat(require.resolve('../scripts/' + script))
      .concat(args.slice(scriptIndex + 1)),
    { stdio: 'inherit' }
  );
  if (result.signal) {
    if (result.signal === 'SIGKILL') {
      console.log(
        'The build failed because the process exited too early. ' +
        'This probably means the system ran out of memory or someone called ' +
        '`kill -9` on the process.'
      );
    } else if (result.signal === 'SIGTERM') {
      console.log(
        'The build failed because the process exited too early. ' +
        'Someone might have called `kill` or `killall`, or the system could ' +
        'be shutting down.'
      );
    }
    process.exit(1);
  }
  process.exit(result.status);
} else {
  console.log('未知脚本 "' + script + '".');
  console.log('Perhaps you need to update devops-react-server?')
}
