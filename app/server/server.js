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
	constructor(ws, hostID, id, params = {}){
		this.ws = ws;
		this.id = id;
		this.hostID = hostID;
		this.name = petname(1, ' ');
		this.color = getRandColor();
		this.params = params;
	}
}

class HostUser extends User{
	constructor(ws, hostID, id, params){
		const windowWidth = params.windowWidth;
		const windowHeight = params.windowHeight;
		delete params.windowHeight;
		delete params.windowWidth;

		super(ws, hostID, id, params);
		this.currentConnections = [];
		this.windowWidth = windowWidth;
		this.windowHeight = windowHeight;
	}
	get connectionState(){
		return {
			hostDOM: this.getHostDOM()
		};
	}

	getHostDOM(){
		return this.ws.send({
			type: 'getHostDOM',
			state: {

			}
		});
	}
}

const connect = (ws, hostID, clientData) => {
	return new Promise((resolve, reject) => {
		switch (clientData.type){
			case 'host':
				hostings[hostID] = new HostUser(
					ws,
					hostID,
					clientData.id,
					clientData.params
				);
				resolve({
					clientData: hostings[hostID],
					event: {
						type: 'setConnectionID',
						state: {
							hostID: hostID
						}
					}
				});
				break;
			case 'viewer':
				if (hostings[clientData.host] === undefined){
					reject({
						ws: ws,
						error: 'Connection is not available! Closing connection...'
					});
				}else{
					const viewer = new User(ws, clientData.host, clientData.id, clientData.params);
					hostings[clientData.host].currentConnections.push(viewer);
					const connectionState = hostings[clientData.host].connectionState();
					resolve({
						clientData: viewer,
						event: {
							type: 'setConnectState',
							state: {

							}
						}
					});
				}
				break;
		}
	});
};

server.on('connection', ws => {

	const hostID = generateUID();

	ws.on('message', (data) => {
		data = JSON.parse(data);
		switch (data.type){
			case 'message':
				break;
			case 'init':
				connect(ws, hostID, data.state)
				.then(({clientData, event})=>{
					clientData.ws.send(JSON.stringify(event));
				})
				.catch(({ws, error}) => {
					ws.send(JSON.stringify({
						type: 'error',
						state: {
							error: error
						}
					}));
					ws.close();
				});
				break;
		}		
	});

	ws.on('close', () => {
		if (hostings[hostID] !== undefined){
			delete hostings[hostID];
		}
	});

});