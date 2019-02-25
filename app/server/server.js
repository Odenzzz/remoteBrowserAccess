const WebSocket = require('ws');

const server = new WebSocket.Server({port: 3005});

server.on('connection', ws => {

	ws.send('Welcome');

	ws.on('message', (message) => {
		server.clients.forEach((client) => {
			if	(client.readyState === WebSocket.OPEN){
				client.send(message);
			}
		});
	});
});