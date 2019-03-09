const createConnectionButton = document.getElementById('create-connection');

const getClientId = () => {
	let id = localStorage.getItem('clientId');
	if (id === null || id === undefined) {
		id = Date.now();
		localStorage.setItem('clientId', id);
	}
	return id;
};

// const hostDOM = (wrapper = 'view-container') => {
// 	let elementId = 1;
// 	const mainContainer = document.getElementById(wrapper);
// 	const watchingItems = [...mainContainer.getElementsByTagName('input'), ...mainContainer.getElementsByTagName('textarea')];
// 	for (let watchingItem of watchingItems){
// 		watchingItem.setAttribute('class', 'watch-input');
// 		watchingItem.setAttribute('id', `watch-input-${elementId++}`);
// 		watchingItem.setAttribute('data-value', watchingItem.value);
// 		watchingItem.addEventListener('keydown', (event) => {
// 			console.log(event);
// 		});
// 	}
// 	return mainContainer.innerHTML;
// }


class Connection {
	constructor(url){
		this.ws = new WebSocket(url);
		this.userID = getClientId();
		this.params = {};
		this.ws.onopen = () => {
			this.ws.send(JSON.stringify({
				type: 'init',
				state: this
			}));
		};
		this.eventsMap = {
			'error': 'throwError',
			'setConnectState': 'setConnectState',
			'setDOM': 'setDOM',
			'setInputValue': 'setInputValue'
		};
		this.ws.onmessage = ({ data }) => {
			data = JSON.parse(data);
			this[this.eventsMap[data.type]](data.state);
		};
	}

	hostDOMUpdate(wrapper = 'view-container'){
		let elementId = 1;
		const mainContainer = document.getElementById(wrapper);
		const watchItems = [...mainContainer.getElementsByTagName('input'), ...mainContainer.getElementsByTagName('textarea')];
		for (let watchItem of watchItems){
			watchItem.setAttribute('class', 'watch-input');
			watchItem.setAttribute('id', `watch-input-${elementId++}`);
			watchItem.setAttribute('data-value', watchItem.value);
			watchItem.addEventListener('keyup', (event) => this.sendInputUpdate(event.target, this.userID, 'host'));
		}
		return mainContainer.innerHTML;
	}

	setDOM(state){
		const contentWrapper = document.getElementById('view-container');
		contentWrapper.style.cssText = `width: ${state.hostWindowWidth}px; height: ${state.hostWindowHeight}px`;
		contentWrapper.innerHTML = state.DOM;
		const watchItems = document.getElementsByClassName('watch-input');
		for (let watchItem of watchItems){
			watchItem.value = watchItem.dataset.value;
			watchItem.addEventListener('keyup', (event) => this.sendInputUpdate(event.target, this.userID, this.hostID));
			watchItem.removeAttribute('data-value');
		}
	}

	sendInputUpdate (input, senderID, hostID) {
		this.ws.send(JSON.stringify({
			type: 'inputUpdate',
			state: {
				inputID: input.getAttribute('id'),
				senderID: senderID,
				hostID: hostID,
				inputValue: input.value
			}
		}));
	}

	throwError(state){
		console.error(`Something went wrong: (${state.error})`);
	}

	setConnectState(state){
		console.log(state);
	}

	setInputValue(state){
		document.getElementById(state.inputID).value = state.inputValue;
	}

	sendMouseCoords(){

	}

	getMousesCoords(mouses){

	}
}

class HostConnection extends Connection{

	constructor(url){
		super(url);
		this.type = 'host';
		this.eventsMap.setConnectionID = 'setConnectionID';

		this.eventsMap.responceWaitingMessage = 'setConnectionID';

		this.eventsMap.getHostDOM = 'getHostDOM';
	}


	getHostDOM (state) {
		this.windowWidth = window.innerWidth;
		this.windowHeight = window.innerHeight;
		this.ws.send(JSON.stringify({
			type: 'sendDOM',
			state: {
				DOM: this.hostDOMUpdate(),
				hostWindowWidth: this.windowWidth,
				hostWindowHeight: this.windowHeight,
				userID: state.userID
			}
		}));
	}


	get windowWidth(){
		return this.params.windowWidth;
	}
	set windowWidth(width){
		this.params.windowWidth = width;
	}

	get windowHeight(){
		return this.params.windowHeight;
	}
	set windowHeight(height){
		this.params.windowHeight = height;
	}

	setConnectionID(state) {
		this.connectionID = state.connectionID;
		console.log('connected');
		let connectionLinkLabel = document.createElement('label');
		connectionLinkLabel.setAttribute('class', 'connection-link');
		connectionLinkLabel.append('Ссылка для подключения: ');
		let inputLink = document.createElement('input');
		inputLink.setAttribute('readonly', 'readonly');
		inputLink.setAttribute('value', `${(window.location.href).substr(0, window.location.href.length - 1)}?host=${this.connectionID}`);
		connectionLinkLabel.append(inputLink);
		document.getElementById('body').appendChild(connectionLinkLabel);
	}


}

class ViewerConnecion extends Connection{
	constructor(url, host){
		super(url);
		this.type = 'viewer';
		this.hostID = host;
		this.params = {

		};
	}
}



createConnectionButton.addEventListener('click', (event) => {
	const host = new HostConnection('ws://localhost:3005');
	event.target.remove();
});


const host = new URL(window.location.href).searchParams.get("host");

if (host !== null){
	const viewer = new ViewerConnecion('ws://localhost:3005', host);
	createConnectionButton.remove();
}
