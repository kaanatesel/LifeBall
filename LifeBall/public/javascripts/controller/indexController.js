app.controller('indexController', ['$scope', 'indexFactory', ($scope, indexFactory) => {

    $scope.messages = []
    $scope.players = {}

    const connectionOptions = {
        reconnectionAttepts: 3,
        reconnectionDelay: 3000,
    }
    function scrollTop(){

        setTimeout(() => {
            const element = document.getElementById('chat-area')
            element.scrollTop = element.scrollHeight;
        })
    }

    function bubbleMessage(id,message){
        $('#'+id).find('.message').show().html(message)
        setTimeout(()=>{
            $('#'+id).find('.message').hide()
        },2000)
    }

    $scope.init = () => {
        const userName = prompt('pls enter your name')

        if (userName)
            initSocket(userName)
        else
            return false
    }

    function initSocket(userName) {

        indexFactory.connectSocket('http://localhost:3000', connectionOptions)
            .then((socket) => {
                console.log('bağlantı gerçeklerşti')
                socket.emit('userName', { userName })

                socket.on('initplayers', (players) => {
                    $scope.players = players;
                    $scope.$apply()
                })

                socket.on('userName', (data) => {
                    console.log(data)
                    const messageData = {
                        type: {
                            code: 0,
                            message: 1,
                        },
                        username: data.userName,
                    }

                    $scope.messages.push(messageData)
                    $scope.players[data.id] = data;
                    $scope.$apply();
                    scrollTop()
                })

                socket.on('DisUser', (user) => {
                    const messageData = {
                        type: {
                            code: 0,
                            message: 0,
                        },
                        username: user.userName,
                        scrollTop()
                    }
                    $scope.messages.push(messageData)
                    delete $scope.players[user.id]
                    $scope.$apply();
                })

                socket.on('animate', (data) => {
                    console.log(data)
                    $('#' + data.socketId).animate({ 'left': data.x, 'top': data.y }, () => {
                        animation = false
                    })
                })

                socket.on('newMessage', newMessage => {
                    $scope.messages.push(newMessage)
                    bubbleMessage(newMessage.socketId,newMessage.text)
                    scrollTop()
                    $scope.$apply()

                })

                $scope.onClickPlayer = ($event) => {
                    let animation = false
                    if (!animation) {
                        let x = $event.offsetX
                        let y = $event.offsetY

                        socket.emit('animate', { x, y })

                        animation = true;

                        $('#' + socket.id).animate({ 'left': x, 'top': y }, () => {
                            animation = false
                        })
                    }
                }


                $scope.newMessage = () => {
                    let message = $scope.message
                    const messageData = {
                        type: {
                            code: 1,
                        },
                        text: message,
                        username: userName,
                    }

                    $scope.messages.push(messageData)
                    $scope.message = ''

                    socket.emit('newMessage', messageData)
                    bubbleMessage(socket.id,messageData.text)
                    scrollTop()
                }


            }).catch((err) => {
                console.log(err)
            })

    }
}])