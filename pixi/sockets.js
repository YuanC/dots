var socket = io.connect();

socket.on('connect_success', function (data) {
  console.log(data);
  initialize(data);
})

socket.on('player_count_change', function (data) {
  console.log(data);
})

socket.on('clear_dots', function (data) {
  console.log(data)
})

socket.on('end_round', function (data) {
  console.log(data);
  resetBoard(data);
})

function initSocket() {
  socket.emit('player_connect');
}

window.addEventListener('DOMContentLoaded', initSocket);