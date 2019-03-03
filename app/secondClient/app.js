const point = document.getElementById('point');


const ws = new WebSocket('ws://localhost:3005');

const setStatus = (value) => {

	status.innerHTML = value;

};

const printMessage = (message) => {

	const li = document.createElement('li');

	li.innerHTML = message;

	messages.appendChild(li);

};

const movePoint = ({x, y}) => {
	console.log(`x = ${x} || y = ${y}`);
	
	point.style.left = `${x}px`;
	point.style.top = `${y}px`;
};

ws.onopen = () => setStatus('ONLINE');

ws.onclose = () => setStatus('DISCONECTED');

ws.onmessage = (response) => movePoint(JSON.parse(response.data));