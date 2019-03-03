const status = document.getElementById('status');
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');


const ws = new WebSocket('ws://localhost:3005');

const getClientId = () => {
	let id = localStorage.getItem('clientId');
	if (id === null || id === undefined) {
		id = Date.now();
		localStorage.setItem('clientId', id);
	}
	return id;
};



const printMessage = (message) => {

	const li = document.createElement('li');

	li.innerHTML = message;

	messages.appendChild(li);

};


document.addEventListener('mousemove', (event) => {
	let coords = {
		x: event.clientX,
		y: event.clientY
	};
	// ws.send(JSON.stringify(coords));
});

const clientState = {
	type: 'host',
	clientId: getClientId(),
	windowWidth: window.innerWidth,
	windowHeight: window.innerHeight,
};

let message = {
	type: 'init',
	client: clientState
}

ws.onopen = () => ws.send(JSON.stringify(message));

ws.onclose = () => setStatus('DISCONECTED');

ws.onmessage = (response) => console.log(response);


