const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const fs = require('fs')
let historyJson = require('./history.json')
let moment = require('moment')
//liste des users connecté

//definit ejs comme template par defaut
app.set('view engine', 'ejs')
//permet d'utiliser les partials ejs
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('index')
})

let server = app.listen(3000,'192.168.1.61', function () {
    console.log('Chat app listening on port 3000');
})

const io = require('socket.io')(server)

io.on('connection', (socket) => {
    let users = []
    //console.log('New user connected: ', socket.username)
    socket.username = 'Anonymous'
    let history = historyJson;
    for (let i = 0; i < history.posts.length; i++) {
        if (i < 50) {
            socket.emit('message', {
                message: history.posts[i].msg,
                username: history.posts[i].username,
                date: moment(history.posts[i].date).fromNow()
            })
        }
    }
    socket.on('change_username', (data) => {
        let now = moment().utc().format()
        console.log('New user connected: ', data.username, now)
        socket.username = data.username
        users.push({
            'id': socket.id,
            'user': socket.username
        })
        console.log(users)
        io.sockets.emit('user_connected', {
            username: socket.username,
            listusers: users
        })
    })
    socket.on('new_message', (data) => {
        let now = moment()
        history.posts.push({
            username: socket.username,
            msg: data.message,
            date: now
        })
        io.sockets.emit('message', {
            message: data.message,
            username: socket.username,
            date: now.fromNow()
        })
        fs.writeFile('history.json', JSON.stringify(history));
    })
    socket.on('disconnect', () => {
        var idx = users.indexOf(socket.username)
        console.log(socket.username)
        users.splice(idx,1)
        io.sockets.emit('user_connected', {
            listusers: users
        })
        console.log(users)
        io.sockets.emit('byeuser', {
            username: socket.username
        })
    })
})
