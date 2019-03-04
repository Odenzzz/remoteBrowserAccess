const WebSocket = require('ws');
const petname = require('node-petname');
const translate = require('translate');

const server = new WebSocket.Server({port: 3005});


const hostings = {};

const getRandColor = () => {
	const red = Math.floor(Math.random() * 255);
	const green = Math.floor(Math.random() * 255);
	const blue = Math.floor(Math.random() * 255);
	const color = `rgba(${red}, ${green}, ${blue})`;

	return color;
};

const generateUID = () => {
	let firstPart = (Math.random() * 46656) | 0;
	let secondPart = (Math.random() * 46656) | 0;
	firstPart = ("000" + firstPart.toString(36)).slice(-3);
	secondPart = ("000" + secondPart.toString(36)).slice(-3);
	return String(firstPart + secondPart).toUpperCase();
};

class User{
	constructor(ws, id, hostID){
		this.ws = ws;
		this.id = id;
		this.hostID = hostID;
		this.name = petname(1, ' ');
		this.color = getRandColor();
	}
}

class HostUser extends User{
	constructor(ws, id, hostID, windowWidth, windowHeight, initDOM){
		super(ws, id, hostID);
		this.currentConnections = [];
		this.windowWidth = windowWidth;
		this.windowHeight = windowHeight;
		this.initDOM = initDOM;
	}
}

server.on('connection', ws => {

	const hostID = generateUID();

	ws.on('message', (data) => {
		data = JSON.parse(data);
		switch (data.type){
			case 'message':
				break;
			case 'init':
				clientData = data.state;
				switch (clientData.type){
					case 'host':
						hostings[hostID] = new HostUser(
							ws,
							clientData.params.id,
							hostID,
							clientData.params.windowWidth,
							clientData.params.windowHeight,
							clientData.__hostDOM			
						);
						clientData = hostings[hostID];
						break;
				}
				clientData.ws.send(JSON.stringify({
					type: 'setConnectionID',
					state: {
						hostID: clientData.hostID
					}
				}));
				break;
		}		
	});

	ws.on('close', () => {
		if (hostings[hostID] !== undefined){
			delete hostings[hostID];
		}
	});

});