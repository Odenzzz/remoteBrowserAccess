const WebSocket = require('ws');
const petname = require('node-petname');
const translate = require('translate');

const server = new WebSocket.Server({port: 3005});


const hostings = {};

const getRandColor = () => {
	const red = Math.random() * 255;
	const green = Math.random() * 255;
	const blue = Math.random() * 255;
	const color = `rgba(${red}, ${green}, ${blue})`;

	return color;
};

class User{
	constructor(ws, id){
		this.ws = ws;
		this.id = id;
		this.name = petname(1, ' ');
		this.color = getRandColor();
	}
}

class HostUser extends User{
	constructor(ws, id, windowWidth, windowHeight, initDOM){
		super(ws, id);
		this.currentConnections = [];
		this.windowWidth = windowWidth;
		this.windowHeight = windowHeight;
		this.initDOM = initDOM;
	}
}

server.on('connection', ws => {

	ws.on('message', (data) => {
		console.log(ws);
		data = JSON.parse(data);
		switch (data.type){
			case 'message':
				break;
			case 'init':
				clientData = data.state;
				switch (clientData.type){
					case 'host':
						if (hostings[clientData.id] === undefined){
							hostings[clientData.id] = new HostUser(
									ws,
									clientData.id,
									clientData.params.windowWidth,
									clientData.params.windowHeight,
									clientData.__hostDOM
								);
						}
						clientData = hostings[clientData.id];
						break;
				}
				server.clients.forEach((client) => {
					if	(client.readyState === WebSocket.OPEN){
						delete clientData.ws;
						client.send(JSON.stringify(clientData));
					}
				});
				break;
		}		
	});
});