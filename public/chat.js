(function () {
    var socket = io() //.connect('http://localhost:3000')

    var message = document.getElementById('message')
    var username = document.getElementById('username')
    var send_message = document.getElementById('send_message')
    var send_username = document.getElementById('send_username')
    var chatroom = document.getElementById('chatroom')
    var userlist = document.getElementById('listusers')

    //recupere username en localstorage
    if (window.localStorage.getItem('username')) {
        var localusername = window.localStorage.getItem('username');
        socket.emit('change_username', {
            username: localusername
        })
        document.getElementById('chat').style.display = "block";
    } else {
        document.getElementById('login').style.display = "block";
    }

    //envoie new msg via le bouton send
    send_message.addEventListener('click', function (event) {
        if (message.value) {
            socket.emit('new_message', {
                message: message.value
            })
            message.value = "";
        }
    })
    //envoie msg via touche entree
    message.onkeypress = function (event) {
        if (event.keyCode == 13 || event.which == 13) {
            if (message.value) {
                socket.emit('new_message', {
                    message: message.value
                })
                message.value = "";
            }
        }
    };
    //efface les msg lors d'une reconnection,pour eviter les msg en doubles
    socket.on('connect', function(){
        chatroom.innerHTML = '';
    })
    //a la deconnexion
    socket.on('disconnect', function(){
        chatroom.innerHTML += ' It seems internet connection is cut, or server is down, wait a few seconds or try again later ';
        chatroom.scrollTop = chatroom.scrollHeight;
        message.focus();
        
    })
    
    //ecoute new msg
    socket.on('message', function (data) {
        var msgTime = data.date;
        var msgType;
        //detection des liens,images png/jpg, youtube, sites webs
        if (data.message.includes('.png') || data.message.includes('.jpg') && data.message.includes('http')) {
            msgType = '<a target="_blank" href="' + data.message + '"><img src="' + data.message + '"></a>';
        } else if (data.message.includes('youtube') && data.message.includes('http')) {
            var newUrl = data.message.replace('watch?v=', 'embed/');
            msgType = '<iframe width="420" height="315" src="' + newUrl + '" frameborder="0" allowfullscreen></iframe>'
        } else if (data.message.includes('http')) {
            msgType = '<span class="msg"><a href="' + data.message + '">' + data.message + '</a></span>';
        } else {
            msgType = '<span class="msg">' + data.message + '</a></span>';
        }
        chatroom.innerHTML += '<div class="margin"><hr><span class="user">' + data.username + " " + '</span>' + '<span class="time">' + msgTime + '</span><br>' + msgType + '</div>';
        //Gere le scroll pour toujours voir les derniers messages
        setTimeout(function(){chatroom.scrollTop = chatroom.scrollHeight;},100);
        message.focus();
        
    })
    //Declare un nouveau user sur le chat
    socket.on('user_connected', function (data) {
        chatroom.innerHTML += ' Hey, ' + data.username + ' is there!! '
        chatroom.scrollTop = chatroom.scrollHeight;
        message.focus();
    })
    //dire bye quand un user se deconnecte
    socket.on('byeuser', function(data){
        chatroom.innerHTML += ' ' + data.username + ' is gone, bye bye ' + data.username + '!! ';
        chatroom.scrollTop = chatroom.scrollHeight;
        message.focus();
    })
    //envoie new username
    send_username.addEventListener('click', function () {
        socket.emit('change_username', {
            username: username.value
        })
        window.localStorage.setItem('username', username.value)
        document.getElementById('chat').style.display = "block";
        document.getElementById('login').style.display = "none";
        chatroom.scrollTop = chatroom.scrollHeight;
    })
    
})();
