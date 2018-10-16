'use strict';
var express = require('express');
var aplicacao = express();
var http = require('http').Server(aplicacao);
var socket = require('socket.io')(http);
var readline = require('readline');
var fs = require('fs');
var buffer = require('buffer');
//var stream = fs.createWriteStream("utilizadores.txt");

//ROTAS
aplicacao.use(express.static(__dirname + '/public'));
//FIM ROTAS

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

    //FUNÇÃO REGISTAR UTILIZADORES
    socket2.on('registarUtilizador', function (uti) {
        var existe = 0; //0 - Não existe | 1 - Existe
        //LER UTILIZADORES DO FICHEIRO E VERIFICAR SE JÁ EXISTE ALGUM COM O MESMO NOME
        var rl = readline.createInterface({
            input: fs.createReadStream('utilizadores.txt'),
            crlfDelay: Infinity
        }).on('line', function (line) {
            if (uti.nome == line) {
                existe = 1;
                rl.close();
            }
        }).on('close', function () {
            if (existe == 0) {
                utilizador = uti;
                var buff = new Buffer(uti.password);
                var buffBase = buff.toString('base64');
                fs.appendFile('utilizadores.txt', uti.nome + '\r\n' + buffBase + '\r\n\r\n', (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log('Utilizador criado!');
                    socket.emit('confirmacaoRegistarUtilizador', 1); //Registou com sucesso
                });
            }
            else {
                socket.emit('confirmacaoRegistarUtilizador', 0); //Não registou
            }
        });
        //FIM LER UTILIZADORES DO FICHEIRO E VERIFICAR SE JÁ EXISTE ALGUM COM O MESMO NOME
    });
});

http.listen(5000, function () {
    console.log('A espera de ligacoes!');
});