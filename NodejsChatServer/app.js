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

var utilizadoresLigados = [];

socket.on('connection', function (socket2) {
    console.log('Utilizador Ligado!');
    var utilizador = { nome: 'GUEST', password: '' };
    utilizadoresLigados.push(socket2);
    socket2.on('disconnect', function () {
        console.log('Utilizador desligado!');
    }).on('envioMensagemServidor', function (mensagem) {
        utilizadoresLigados.forEach(function (uti) {
            if (uti === socket2) {
                return;
            }
            uti.emit('envioMensagemCliente', { utilizador: utilizador.nome, msg: mensagem });
        });
    }).on('end', function () {
        utilizadoresLigados.splice(utilizadoresLigados.indexOf(socket2), 1);
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
                    socket2.emit('redirect', '/'); //Registou com sucesso
                });
            }
            else {
                socket2.emit('confirmacaoRegistarUtilizador', 0); //Não registou
            }
        });
        //FIM LER UTILIZADORES DO FICHEIRO E VERIFICAR SE JÁ EXISTE ALGUM COM O MESMO NOME
    }).on('loginUtilizador', function (uti) {
        var existe = 0; //0 - Não existe | 1 - Existe
        //LER UTILIZADORES DO FICHEIRO E VERIFICAR SE JÁ EXISTE ALGUM REGISTADO COM ESSE NOME
        var rl = readline.createInterface({
            input: fs.createReadStream('utilizadores.txt'),
            crlfDelay: Infinity
        }).on('line', function (line) {
            if (existe == 0) {
                if (uti.nome == line) {
                    existe = 1;
                }
            } else if (existe == 1) {
                var buff = new Buffer(line, 'base64');
                var password = buff.toString('ascii');
                if (uti.password == password) {
                    rl.close();
                }
            }
        }).on('close', function () {
            if (existe == 0) {
                socket2.emit('confirmacaoLoginUtilizador', 0); //Não fez login
            }
            else if (existe == 1) {
                utilizador = uti;
                socket2.emit('confirmacaoLoginUtilizador', 1); //Fez login
            }
        });
        //LER UTILIZADORES DO FICHEIRO E VERIFICAR SE JÁ EXISTE ALGUM REGISTADO COM ESSE NOME
    });
});

http.listen(5000, function () {
    console.log('A espera de ligacoes!');
});