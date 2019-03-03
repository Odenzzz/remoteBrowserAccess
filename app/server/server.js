const WebSocket = require('ws');
const petname = require('node-petname')

const server = new WebSocket.Server({port: 3005});


const clients = {};

class User{
	constructor(){
		
	}
}

server.on('connection', ws => {

	ws.send('Welcome');


	ws.on('message', (message) => {
		message = JSON.parse(message);

		switch (message.type){
			case 'message':
				break;
			case 'init':
				clientData = message.client;
				clientData.name = petname(1, ' ');


				server.clients.forEach((client) => {
					if	(client.readyState === WebSocket.OPEN){
						client.send(JSON.stringify(clientData));
					}
				});
				break;
		}

		
	});
});