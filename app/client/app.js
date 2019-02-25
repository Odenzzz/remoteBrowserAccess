const status = document.getElementById('status');
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');


const ws = new WebSocket('ws://localhost:3005');

const setStatus = (value) => {

	status.innerHTML = value;

};

const printMessage = (message) => {

	const li = document.createElement('li');

	li.innerHTML = message;

	messages.appendChild(li);

};

// form.addEventListener('submit', (event) => {
// 	event.preventDefault();
// 	ws.send(input.value);
// 	input.value = '';
// });

document.addEventListener('mousemove', (event) => {
	let coords = {
		x: event.clientX,
		y: event.clientY
	};
	ws.send(JSON.stringify(coords));
});

ws.onopen = () => setStatus('ONLINE');

ws.onclose = () => setStatus('DISCONECTED');

ws.onmessage = (response) => console.log(response);