'use strict';
var express = require('express');
var aplicacao = express();
var http = require('http').Server(aplicacao);
var socket = require('socket.io')(http);
var readline = require('readline');
var fs = require('fs');
//var stream = fs.createWriteStream("utilizadores.txt");

//ROTAS
aplicacao.use(express.static(__dirname + '/public'));
//FIM ROTAS

//LER UTILIZADORES DO FICHEIRO
var rl = readline.createInterface({
    input: fs.createReadStream('utilizadores.txt'),
    crlfDelay: Infinity
}).on('line', (line) => {
        console.log(`Linha: ${line}`);
    }).on('end', function () {
        rl.close();
    });
//FIM LER UTILIZADORES DO FICHEIRO

socket.on('connection', function (socket2) {
    console.log('Utilizador Ligado!');
    var utilizador = { nome: 'GUEST', password: '' };
    socket2.on('disconnect', function () {
        console.log('Utilizador desligado!');
    });
    socket2.on('envioMensagem', function (mensagem) {
        console.log('Mensagem: ' + mensagem);
        socket.emit('envioMensagem', { utilizador: utilizador.nome, msg: mensagem });
    });

    socket2.on('registarUtilizador', function (uti) {
        utilizador = uti;
        fs.appendFile('utilizadores.txt', uti.nome + '\r\n' + uti.password + '\r\n\r\n', (err) => {
            if (err) {
                throw err;
            }
            console.log('Utilizador criado!');
        });
        //socket.emit('envioMensagem', { utilizador: 'Guest', msg: mensagem });
    });
});

http.listen(5000, function () {
    console.log('A espera de ligacoes!');
});