const createConnectionButton = document.getElementById('create-connection');

const getClientId = () => {
	let id = localStorage.getItem('clientId');
	if (id === null || id === undefined) {
		id = Date.now();
		localStorage.setItem('clientId', id);
	}
	return id;
};


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
			console.log(data);
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
		const watching_items = [...mainContainer.getElementsByTagName('input'), ...mainContainer.getElementsByTagName('textarea')];
		for (let watching_item of watching_items){
			watching_item.setAttribute('class', 'watch-input');
			watching_item.setAttribute('id', `watch-input-${elementId++}`);
			watching_item.setAttribute('data-value', watching_item.value);
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



