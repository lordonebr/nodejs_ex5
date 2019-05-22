const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http);

app.get('/', (_, res) => {
  res.sendFile(`${__dirname}/index.html`)
})

io.on('connection', socket => {
    let msgIni = 'Olá, vamos cadastrar uma nova ficha. Digite o seu nome completo para começar:';
    let msgAddress = 'Digite o seu endereço:'
    let msgAge = 'Qual a sua idade?'
    let msgEmail = 'Informe seu email:'
    let msgJob = 'Qual sua profissão?'
    let msgFinish = 'Sua ficha cadastral ficou assim:'

    var novaficha = {
        name : '',
        friendlyname : '',
        address : '',
        age : '',
        email : '',
        job : ''
    };

    let jsonBack = {
        origin : '',
        message : msgIni,
        friendlyMessage : ''
    };

    io.emit('messageResponse', jsonBack)

    socket.on('newMessage', msg => {

        let msgResponse = '';
        let friendlyMsg = '';

        if(msg.origin.localeCompare(msgIni) == 0){

            if(msg.message == ''){
                friendlyMsg = 'Você deve preencher seu nome, Por favor, digite o seu nome completo para começar:';
                msgResponse = msgIni;
            }
            else{
                let posSpace = msg.message.search(' ');
                let name = '';
                if(posSpace > 0)
                    name = msg.message.substring(0, posSpace);
                else
                    name = msg.message;

                friendlyMsg = 'Olá ' + name + ', ' + msgAddress;
                msgResponse = msgAddress;

                novaficha.name = msg.message;
                novaficha.friendlyname = name;
            }
        }
        else if(msg.origin.localeCompare(msgAddress) == 0){
            if(msg.message == ''){
                friendlyMsg = novaficha.friendlyname + ', você deve preencher o seu endereço. Por favor, digite o seu endereço:';
                msgResponse = msgAddress;
            }
            else{
                msgResponse = msgAge;
                novaficha.address = msg.message;
            }
        }
        else if(msg.origin.localeCompare(msgAge) == 0){
            if(msg.message == '' || isNaN(msg.message)){
                friendlyMsg = novaficha.friendlyname +  ', você deve preencher a sua idade. Por favor, digite a sua idade:';
                msgResponse = msgAge;
            }
            else{
                msgResponse = msgEmail;
                novaficha.age = msg.message;
            }
        }
        else if(msg.origin.localeCompare(msgEmail) == 0){
            if(msg.message == '' || msg.message.indexOf("@") == -1){
                friendlyMsg = novaficha.friendlyname +  ', você deve preencher um e-mail válido. Por favor, digite o seu e-mail:';
                msgResponse = msgEmail;
            }
            else{
                msgResponse = msgJob;
                novaficha.email = msg.message;
            }
        }
        else if(msg.origin.localeCompare(msgJob) == 0){
            if(msg.message == ''){
                friendlyMsg = novaficha.friendlyname +  ', você deve preencher sua profissão. Por favor, digite qual é sua profissão:';
                msgResponse = msgJob;
            }
            else{
                novaficha.job = msg.message;
                msgResponse = msgFinish + 
                            '<br />Nome: ' + novaficha.name + 
                            '<br />Endereço: ' + novaficha.address + 
                            '<br />Idade: ' + novaficha.age + 
                            '<br />E-mail: ' + novaficha.email + 
                            '<br />Profissão: ' + novaficha.job + 
                            
                            '<br /><br />Cadastro adicionado com sucesso nos nossos sistemas. Obrigado!';
            }
        }
        else{
            novaficha = {
                name : '',
                friendlyname : '',
                address : '',
                age : '',
                email : '',
                job : ''
            }

            msgResponse = msgIni;
        }

        let jsonBack = {
            origin : msg.message,
            message : msgResponse,
            friendlyMessage : friendlyMsg
        };

        io.emit('messageResponse', jsonBack)
    })
})

http.listen(3000, () => console.log('listening on *:3000'))