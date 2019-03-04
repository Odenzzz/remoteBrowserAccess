const createConnectionButton = document.getElementById('create-connection');

const getClientId = () => {
	let id = localStorage.getItem('clientId');
	if (id === null || id === undefined) {
		id = Date.now();
		localStorage.setItem('clientId', id);
	}
	return id;
};

const host = new URL(window.location.href).searchParams.get("host");

if (host !== null){
	createConnectionButton.remove();
}

class Connection {
	constructor(url){
		this.ws = new WebSocket(url);
		this.id = getClientId();
		this.ws.onopen = () => {
			this.ws.send(JSON.stringify({
				type: 'init',
				state: this
			}));
		};
		this.ws.onmessage = ({ data }) => {
			data = JSON.parse(data);
			switch (data.type){
				case 'setConnectionID':
					this.connectionID = data.state.hostID;

					let connectionLinkLabel = document.createElement('label');
					connectionLinkLabel.setAttribute('class', 'connection-link');
					connectionLinkLabel.append('Ссылка для подключения: ');
					let inputLink = document.createElement('input');
					inputLink.setAttribute('readonly', 'readonly');
					inputLink.setAttribute('value', `${(window.location.href).substr(0, window.location.href.length - 1)}?host=${this.connectionID}`);
					connectionLinkLabel.append(inputLink);
					document.getElementById('body').appendChild(connectionLinkLabel);

					break;
			}
		};
	}
	sendUpdateInput(id, value){
		this.ws.send(JSON.stringify({
			type: 'updateInput',
			state: {
				id: id,
				value: value
			}
		}));
	}

	setInputValue(id, value){

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
		this.params = {
			windowHeight: window.innerHeight,
			windowWidth: window.innerWidth,
			
		};
		this.__hostDOM = this.getHostDOM();
	}

	getHostDOM(wrapper = 'view-container') {
		let elementId = 1;
		const mainContainer = document.getElementById(wrapper);
		const watchingItems = [...mainContainer.getElementsByTagName('input'), ...mainContainer.getElementsByTagName('textarea')];
		for (let watchingItem of watchingItems){
			watchingItem.setAttribute('class', 'watch-input');
			watchingItem.setAttribute('id', `watch-input-${elementId++}`);
			watchingItem.setAttribute('data-value', watchingItem.value);
		}
		return mainContainer.innerHTML;
	}

	get hostDOM(){
		this.__hostDOM = this.getHostDOM();
		return this.__hostDOM;
	}
}



createConnectionButton.addEventListener('click', (event) => {
	const host = new HostConnection('ws://localhost:3005');
	event.target.remove();
});



