var lastCommand = null;

var lastUser = null;

const spawn = require('child_process').spawn;
const telnet = spawn('telnet', ['-l', 'mud', 'mud2.co.uk']);

var buffer = '';

var preInPlay = false;
var inPlay = false;
var suppressEmote = false;
var echoResetNumber = false;
var showArrival = false;

telnet.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
  buffer += data;
  console.log(`buffer: ${buffer}`);

  if (!inPlay && buffer.includes('Account ID: ')) {
    telnet.stdin.write(process.env.ACCOUNT+'\r');
    buffer = '';
  } else if (!inPlay && buffer.includes('Password: ')) {
    telnet.stdin.write(process.env.PASSWORD+'\r');
    buffer = '';
  } else if (!inPlay && buffer.includes('Checking your mail may take a while')) {
    telnet.stdin.write('n\r');
    buffer = '';
  } else if (!inPlay && buffer.includes('Hit return.')) {
    telnet.stdin.write('\r');
    buffer = '';
  } else if (buffer.includes('Option (H for help):')) {
    telnet.stdin.write('p\r');
    buffer = '';
    preInPlay = false;
    inPlay = false;
    echoResetNumber = true;
  } else if (!inPlay && buffer.includes('By what name shall I call you (Q to quit)?')) {
    telnet.stdin.write(process.env.PERSONA+'\r');
    buffer = '';
    preInPlay = true;
  } else if (!inPlay && buffer.includes('What sex do you wish to be?')) {
    telnet.stdin.write('m\r');
    buffer = ''
    preInPlay = true;
  } else if (preInPlay || inPlay) {
    buffer = buffer.replace(/\x1b\[[0-9;]*[mG]/g, '');

    while(buffer.includes('*')) {
      // console.log('In buffer: '+buffer);

      var pos = buffer.indexOf('*');
      var line = buffer.substring(0,pos).trim();
      buffer = buffer.substring(pos+1);

      if (lastCommand && line.indexOf(lastCommand) == 0) {
        line = line.substring(lastCommand.length).trim();
        lastCommand = null;
      }

      if (preInPlay) {
        preInPlay = false;
        inPlay = true;

        telnet.stdin.write('whistle\r');
      }
    }
  }
});

telnet.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
  process.exit(0);
});

telnet.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

// keep the connection alive
var interval = setInterval(function() {
  telnet.stdin.write('\r');
}, 30000);
