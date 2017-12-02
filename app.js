// Server
const express = require('express')
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http)
const PORT = process.env.PORT || 5000

app.use(express.static('pixi'))
app.get('/*', (req,res) => res.sendFile(__dirname + '/index.html'))

let board, players, leaderboard, time, temp = 0
const BOARD_SIZE = 20, ROUND_TIME = 60

io.on('connection', (socket) => {

  socket.on('player_connect', () => { // e.g. "toronto"

    players[socket.id] = {'score': 0, 'uname': 'player' + temp++}
    socket.emit('connect_success', {board, leaderboard, time, 'player': players[socket.id], 'player_count': Object.keys(players).length})
    socket.broadcast.emit('player_count_change', Object.keys(players).length)
    console.log('Users Connected: ' + Object.keys(players).length)

  })

  socket.on('disconnect', () => {

    delete players[socket.id]
    socket.broadcast.emit('player_count_change', Object.keys(players).length)
    console.log('Users Connected: ' + Object.keys(players).length)

  })

  socket.on('clear_dots', (dots) => {

    cols = {}

    for (let dot of dots) {
      board[dot[x]][dot[y]] = null

      if (!dot[y] in cols) {
        cols[y] = true
      }
    }

    for (let col in cols) {
      if (cols.hasOwnProperty(col)) {
        // Move Dots Down

        applyGravity(col)

        fillColBuffer(col)
        // regenerate buffer
      } 
    }

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
  time = ROUND_TIME

  setInterval(() => {
    time--

    if (time <= 0) { // Round is over
      generateBoard()

      // Calculate Leaderboard for Round
      player_arr = Object.keys(players).map(key => players[key]) 
      player_arr.sort((a, b) => a.score - b.score)
      leaderboard = player_arr

      // reset user scores
      for (let p_id in players) {
        if (players.hasOwnProperty(p_id)) {
          players[p_id]['score'] = 0
        }
      }

      time = ROUND_TIME
      io.sockets.emit('end_round', {board, leaderboard, time})

    }

  }, 1000)

}

function fillColBuffer (col) {
  for (let j = BOARD_SIZE*2; j >= 0; j--) {


  }
}

function applyColGravity (col) {
  for (let j = BOARD_SIZE*2; j >= 0; j--) {
    if (!board[col][j]) {
      temp = j - 1

      while (!temp) {

      }
    }
  }
}

function generateBoard () {
  board = []
  for (let i = 0; i < BOARD_SIZE*2; i++) {
    board.push([])
    for (let j = 0; j < BOARD_SIZE; j++) {
      board[i].push(Math.floor(Math.random()*5))
    }
  }
}

init()
http.listen(PORT, () => console.log('Listening on port ' + PORT))

