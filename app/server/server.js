const WebSocket = require('ws');
const petname = require('node-petname');



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
	constructor(ws, hostID, userID, params = {}){
		this.ws = ws;
		this.userID = userID;
		this.hostID = hostID;
		this.name = petname(1, ' ');
		this.color = getRandColor();
		this.params = params;
		this.responseWaitingList = {};
	}
	sendWaitingResponce(){

	}
}
class HostUser extends User{
	constructor(ws, hostID, userID, params){
		super(ws, hostID, userID, params);
		this.currentConnections = {};
	}
	sendHostDOM(userID){
		this.ws.send(JSON.stringify({
			type: 'getHostDOM',
			state: {
				userID
			}
		}));
	}
}



const connect = (clientData) => {
	return new Promise((resolve, reject) => {
		switch (clientData.type){
			case 'host':
				hostings[clientData.connectionID] = new HostUser(
					clientData.ws,
					clientData.connectionID,
					clientData.userID,
					clientData.params
				);
				resolve({
					clientData: hostings[clientData.connectionID],
					event: {
						type: 'setConnectionID',
						state: {
							connectionID: clientData.connectionID
						}
					}
				});
				break;
			case 'viewer':
				if (hostings[clientData.hostID] === undefined){
					reject({
						ws: clientData.ws,
						error: 'Connection is not available! Closing connection...'
					});
				}else{
					const viewer = new User(clientData.ws, clientData.hostID, clientData.userID, clientData.params);
					hostings[clientData.hostID].currentConnections[clientData.userID] = viewer;
					hostings[clientData.hostID].sendHostDOM(clientData.userID);
					resolve({
						clientData: viewer,
						event: {
							type: 'setConnectState',
							state: {
								connectionState: 'connectionState'
							}
						}
					});
				}
				break;
		}
	});
};

server.on('connection', (ws) => {

	const connectionID = generateUID();

	ws.on('message', (data) => {
		data = JSON.parse(data);
		switch (data.type){
			case 'message':
				console.log(data.state);
				break;
			case 'inputUpdate':
				data.state.hostID = (data.state.hostID === 'host') ? connectionID : data.state.hostID;
				const watchers = hostings[data.state.hostID].currentConnections;
				hostings[data.state.hostID].ws.send(JSON.stringify({
					type: 'setInputValue',
					state: {
						inputID: data.state.inputID,
						inputValue: data.state.inputValue
					}
				}));
				for (let watcher of Object.keys(watchers)){
					watchers[watcher].ws.send(JSON.stringify({
						type: 'setInputValue',
						state: {
							inputID: data.state.inputID,
							inputValue: data.state.inputValue
						}
					}));
				}
				break;
			case 'sendDOM':
				hostings[connectionID].currentConnections[data.state.userID].ws.send(JSON.stringify({
					type: 'setDOM',
					state: {
						DOM: data.state.DOM,
						hostWindowWidth: data.state.hostWindowWidth,
						hostWindowHeight: data.state.hostWindowHeight
					}
				}));
				break;
			case 'init':
				data.state.ws = ws;
				data.state.connectionID = connectionID;
				connect(data.state)
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
		if (hostings[connectionID] !== undefined){
			delete hostings[connectionID];
		}
	});

});