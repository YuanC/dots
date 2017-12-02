// Server
const express = require('express')
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http)
const PORT = process.env.PORT || 5000

app.use(express.static('pixi'))
app.get('/*', (req,res) => res.sendFile(__dirname + '/index.html'))

let board, players, leaderboard, time
const BOARD_SIZE = 20

io.on('connection', (socket) => {

  socket.on('player_connect', () => { // e.g. "toronto"

    players[socket.id] = {'score': 0, 'uname': socket.id}
    socket.emit('connectSuccess', {board, leaderboard, time, 'player': players[socket.id], 'player_count': Object.keys(players).length})
    socket.broadcast.emit('player_count_change', Object.keys(players).length)
    console.log('connections' + Object.keys(players).length)

  })

  socket.on('player_disconnect', () => {

    delete players[socket.id]
    socket.broadcast.emit('player_count_change', Object.keys(players).length)
    console.log('connections: ' + Object.keys(players).length)

  })

  socket.on('clear_dots', (dots) => {

    // delete dots
    // move dots down
    // regenerate buffer
    // update user score

    players[socket.id]['score'] += dots.length

    socket.broadcast.emit('clear_dots', {dots, board})
    socket.emit('clear_dots', {dots, board})

  })

  socket.on('edit_uname', (uname) => { players[socket.id]['uname'] = uname })

})

function init () {

  generateBoard()
  players = {}
  leaderboard = []
  time = 30

  setInterval(() => {
      time -= 1

      if (time <= 0) {
        generateBoard()

        // create new board
        // calculate leaderboard
        // reset user scores

        io.sockets.emit('end_round', {board, leaderboard, time})

      }

    }, 1000)

}

init()

function generateBoard () {
  board = []
  for (let i = 0; i < BOARD_SIZE*2; i++) {
    board.push([])
    for (let j = 0; j < BOARD_SIZE; j++) {
      board[i].push(Math.floor(Math.random()*5))
    }
  }
}

function fillBufferForCol (col) {
  for (let j = BOARD_SIZE*2; j >= 0; j--) {

  }
}

http.listen(PORT, () => console.log('Listening on port ' + PORT))

