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

var utilizadoresLigados = []; //Guarda os sockets ligados
var nomeUtilizadoresLigados = []; //Guarda apenas os nomes de utilizadores ligados

socket.on('connection', function (socket2) { //Esta fun��o � executada quando algum utilizador se conecta ao servidor
    var utilizador = { nome: 'GUEST', password: '' }; //Cria o objeto local "utilizador" (como acabou de se conectar � um "GUEST")
    socket2.utilizador = utilizador; //Guarda no socket a informa��o do utilizador
    utilizadoresLigados.push(socket2); //Insere o socket do utilizador que se ligou nos "utilizadores ligados"
    nomeUtilizadoresLigados.push(utilizador.nome); //Insere apenas o nome do utilizador que se ligou nos "nome utilizadores liagdos"
    socket.emit('atualizarUtilizadoresLigados', nomeUtilizadoresLigados); //Envia a lista dos utilizadores ligados
    console.log('Utilizador Ligado! TOTAL: ' + utilizadoresLigados.length);
    socket2.on('disconnect', function () { //Esta fun��o � executada quando algum utilizador se desconecta do servidor
        utilizadoresLigados.splice(utilizadoresLigados.indexOf(socket2), 1); //Retira o socket do utilizador que se desligou dos "utilizadores ligados"
        nomeUtilizadoresLigados.splice(nomeUtilizadoresLigados.indexOf(utilizador.nome), 1); //Retira apenas o nome do utilizador que se desligou dos "nome utilizadores liagdos"
        socket.emit('atualizarUtilizadoresLigados', nomeUtilizadoresLigados); //Envia a lista dos utilizadores ligados
        console.log('Utilizador desligado! TOTAL: ' + utilizadoresLigados.length);
    }).on('envioMensagemServidor', function (mensagem) { //Envia a mensagem de um utilizador para todos os outros menos para o que a enviou ("mensagem" � a mensagem a ser enviada)
        utilizadoresLigados.forEach(function (uti) { //Percorre os utilizadores ligados ("uti" ser� cada elemento dos "utilizadores ligados")
            if (uti === socket2) { //Verifica se o utilizador atualmente percorrido � igual o que enviou a mensagem
                return; //Caso seja, este "return" far� com que seja passado � frente sem executar mais c�digo
            }
            uti.emit('envioMensagemCliente', { utilizador: utilizador.nome, msg: mensagem }); //Envia a mensagem para o utilizador "uti"
        });
    }).on('envioMensagemPrivadaServidor', function (dados) { //Envia a mensagem de um utilizador apenas para 1 destinat�rio ("dados" � um objeto composto pelo nome de utilizador de destino e pela mensagem)
        utilizadoresLigados.forEach(function (uti) { //Percorre os utilizadores ligados ("uti" ser� cada elemento dos "utilizadores ligados")
            if (uti.utilizador.nome == dados.destino) { //Verifica se o utilizador atualmente percorrido � igual ou utilizador para o qual a mensagem � destinada
                uti.emit('envioMensagemPrivadaCliente', { utilizador: utilizador.nome, msg: dados.msg }); //Envia a mensagem para o utilizador "uti" (neste caso � o utilizador destino)
                return;
            }
        });
    }).on('registarUtilizador', function (uti) { //Regista utilizador caso esse nome de utilizador esteja dispon�vel ("uti" � o objeto recebido do formul�rio de registo que contem o nome de utilizador e password)
        var existe = 0; //0 - N�o existe; 1 - Existe
        //LER UTILIZADORES DO FICHEIRO E VERIFICAR SE J� EXISTE ALGUM COM O MESMO NOME
        var rl = readline.createInterface({ //Cria uma "Interface" do m�dulo "ReadLine"
            input: fs.createReadStream('utilizadores.txt'), //Ficheiro que vai ser lido
            crlfDelay: Infinity
        }).on('line', function (line) { //Percorre o ficheiro linha a linha
            if (uti.nome == line) { //Verifica se o nome de utilizador recebido � igual � linha que est� neste momento a ser percorrida
                existe = 1; //Caso seja, "existe" passa a ter o valor de 1 (o que quer dizer que j� existe um utilizador registado com esse nome)
                rl.close();
            }
        }).on('close', function () { //Quando o ficheiro acabar de ser lido
            if (existe == 0) { //Verifica "existe" (se for "=0" quer dizer que n�o existe nenhum utilizador registado com esse nome e que pode ser criado | se for "=1" quer dizer que n�o pode ser criado)
                var buff = new Buffer(uti.password);
                var buffBase = buff.toString('base64'); //A password � codificada
                fs.appendFile('utilizadores.txt', uti.nome + '\r\n' + buffBase + '\r\n\r\n', (err) => { //As informa��es do novo utilizador s�o escritas o ficheiro
                    if (err) {
                        throw err;
                    }
                    console.log('Utilizador criado!');
                    socket2.emit('confirmacaoRegistarUtilizador', 1); //Envia a confirma��o positiva de registo
                });
            }
            else {
                socket2.emit('confirmacaoRegistarUtilizador', 0); //Envia a confirma��o negativa de registo
            }
        });
        //FIM LER UTILIZADORES DO FICHEIRO E VERIFICAR SE J� EXISTE ALGUM COM O MESMO NOME
    }).on('loginUtilizador', function (uti) { //Faz login do utilizador caso exista e tenha introduzido a password correta ("uti" � o objeto recebido do formul�rio de login que contem o nome de utilizador e password)
        var existe = 0, passcorreta = 0; //0 - N�o existe; 1 - Existe | 0 - N�o introduziu a password correta;  1 - Introduziu a password correta
        //LER UTILIZADORES DO FICHEIRO E VERIFICAR SE EXISTE ALGUM REGISTADO COM ESSE NOME E COM ESSA PASSWORD
        var rl = readline.createInterface({ //Cria uma "Interface" do m�dulo "ReadLine"
            input: fs.createReadStream('utilizadores.txt'), //Ficheiro que vai ser lido
            crlfDelay: Infinity
        }).on('line', function (line) { //Percorre o ficheiro linha a linha
            if (existe == 0) { //Verifica "existe" (se for "=0" quer dizer que ainda n�o encontrou nenhum utilizador com esse nome e vai continuar a procurar at� ao fim do ficheiro)
                if (uti.nome == line) { //Verifica se o nome de utilizador recebido � igual � linha que est� neste momento a ser percorrida
                    existe = 1; //Caso seja, "existe" passa a ter o valor de 1 (o que quer dizer que n�o ser�o verificados mais nomes e que pode ser verificada a password)
                }
            } else if (existe == 1) { //Verifica "existe" (se for "=1" quer dizer que existe 1 utilizador registado com esse nome e que pode ser verificada a password)
                var buff = new Buffer(line, 'base64');
                var password = buff.toString('ascii'); //A password � descodificada
                if (uti.password == password) { //Verifica se a password recebida � igual � password descodificada
                    passcorreta = 1; //Caso seja, "passcorreta" passa a ter o valor de 1 (o que quer dizer que o utilizador existe e introduziu a password correta)
                    rl.close();
                } else {
                    rl.close();
                }
            }
        }).on('close', function () { //Quando o ficheiro acabar de ser lido
            if (existe == 0 || passcorreta == 0) { //Verifica "existe" e "passcorreta" (se 1 dos 2 for "=0" quer dizer que n�o introduziu o nome de utilizador ou a password corretos)
                socket2.emit('confirmacaoLoginUtilizador', 0); //Envia a confirma��o negativa de login
            } else if (existe == 1 && passcorreta == 1) { //Verifica "existe" e "passcorreta" (se os 2 forem "=1" quer dizer que introduziu o nome de utilizador e a password corretos)
                nomeUtilizadoresLigados.splice(nomeUtilizadoresLigados.indexOf('GUEST'), 1); //Retira um "GUEST" da lista de "nome utilizadores ligados"
                utilizador = uti; //Guarda a informa��o do utilizador que fez login no objeto local "utilizador"
                socket2.utilizador = utilizador; //Guarda no socket a informa��o do utilizador que fez login
                socket2.emit('confirmacaoLoginUtilizador', 1); //Envia a confirma��o positiva de login
                nomeUtilizadoresLigados.push(utilizador.nome); //Insere apenas o nome do novo utilizador que fez login nos "nome utilizadores liagdos"
                socket.emit('atualizarUtilizadoresLigados', nomeUtilizadoresLigados); //Envia a lista dos utilizadores ligados
            }
        });
        //FIM LER UTILIZADORES DO FICHEIRO E VERIFICAR SE EXISTE ALGUM REGISTADO COM ESSE NOME E COM ESSA PASSWORD
    }).on('comecaEscrever', function () { //Envia o aviso de que 1 utilizador come�ou a escrever para todos os outros menos para o que come�ou a escrever
        utilizadoresLigados.forEach(function (uti) { //Percorre os utilizadores ligados ("uti" ser� cada elemento dos "utilizadores ligados")
            if (uti === socket2) { //Verifica se o utilizador atualmente percorrido � igual o que come�ou a escrever
                return; //Caso seja, este "return" far� com que seja passado � frente sem executar mais c�digo
            }
            uti.emit('mostrarEscrever', utilizador.nome); //Envia o nome do utilizador que come�ou a escrever
        });
    }).on('parouEscrever', function () { //Envia o aviso de que 1 utilizador parou de escrever para todos os outros menos para o que parou de escrever
        utilizadoresLigados.forEach(function (uti) { //Percorre os utilizadores ligados ("uti" ser� cada elemento dos "utilizadores ligados")
            if (uti === socket2) { //Verifica se o utilizador atualmente percorrido � igual o que parou de escrever
                return; //Caso seja, este "return" far� com que seja passado � frente sem executar mais c�digo
            }
            uti.emit('retirarEscrever', utilizador.nome); //Envia o nome do utilizador que parou de escrever
        });
    });
});

http.listen(5000, function () { //Porta em que o servidor est� a ser executado
    console.log('A espera de ligacoes!');
});