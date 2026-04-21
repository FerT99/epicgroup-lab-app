const net = require('net');

const client = new net.Socket();

console.log('Checking port 3001...');

client.connect(3001, '127.0.0.1', function () {
    console.log('Connected to 127.0.0.1:3001');
    client.destroy();
});

client.on('error', function (err) {
    console.error('Connection failed (127.0.0.1): ' + err.message);

    // Try localhost
    console.log('Trying localhost...');
    const client2 = new net.Socket();
    client2.connect(3001, 'localhost', function () {
        console.log('Connected to localhost:3001');
        client2.destroy();
    });
    client2.on('error', function (err2) {
        console.error('Connection failed (localhost): ' + err2.message);
    });
});

client.on('close', function () {
    console.log('Connection closed');
});
