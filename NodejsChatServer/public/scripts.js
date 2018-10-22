$(document).ready(function () {
    var socket = io();
    var utilizador = 'GUEST'; //Nome de utilizador padrão
    //ENVIAR MENSAGEM
    $('form#mensagem').submit(function () { //Esta função é executada quando o utilizador enviar a mensagem
        if ($('#destino').val() == 'Todos') { //Verifica se o valor do campo "destino" (para quem a mensagem é destinada) é "==Todos", caso seja quer dizer que esta mensagem é para ser enviada para todos os utilizadores
            socket.emit('envioMensagemServidor', $('#inputMensagem').val()); //Envia a mensagem para o servidor
            $('#listaMensagens').append($('<li>').text(utilizador + ': ' + $('#inputMensagem').val())); //Adiciona a mensagem que o utilizador acabou de enviar na "lista de mensagens"
        } else { //Este "else" será executado caso o campo "destino" tenha um valor "!=Todos" (o que quer dizer que a mensagem é para ser enviada apenas para o utilizador que estiver selecionado no campo "destino")
            socket.emit('envioMensagemPrivadaServidor', { destino: $('#destino').val(), msg: $('#inputMensagem').val() }); //Envia um objeto, composto pelo utilizador de destino e pela mensagem, para o servidor
            $('#listaMensagens').append($('<li>').text('Privada para ' + $('#destino').val() + ': ' + $('#inputMensagem').val())); //Adiciona a mensagem que o utilizador acabou de enviar na "lista de mensagens"
        }
        $('#inputMensagem').val(''); //Limpa o campo de mensagens
        $("#mensagens").scrollTop($("#mensagens")[0].scrollHeight); //Faz scoll para cima da lista de mensagens (para vermos a mensagem acabada de enviar)
        return false;
    });
    //FIM ENVIAR MENSAGEM

    //ENVIAR ESTADO DE COMEÇOU/PAROU DE ESCREVER
    var tem = false; //false - O campo de mensagem não tem conteúdo; true - O campo de mensagens tem conteúdo
    //(Esta última variável não é totalmente necessária para a funcionalidade de "ENVIAR ESTADO DE COMEÇOU/PAROU DE ESCREVER" mas ajuda porque fará com que o servidor não receba um evento cada vez que o utilizador pressione uma tecla)
    $("#inputMensagem").keyup(function () { //Esta função é executada cada vez que o utilizador pressionar uma tecla tendo o campo de "mensagem" selecionado
        if (($("#inputMensagem").val().length >= 1) && (tem == false)) { //Verifica se o campo de "mensagem" tem 1 ou + de 1 caráter e se anteriormente estava vazio (no fundo, este "if" verifica quando o utilizador começa a escrever no campo vazio)
            tem = true; //Caso o que está escrito acima seja verdade, quer dizer que o campo já tem algo escrito logo "tem" passa a ser "true"
            socket.emit('comecaEscrever'); //Envia o aviso de que o utilizador começou a escrever
        } else if (($("#inputMensagem").val() == '') && (tem == true)) { //Verifica se o campo de "mensagem" está vazio e se anteriormente não estava vazio (no fundo, este "if" verifica quando o utilizador tem o campo vazio sendo que anteriormente estava cheio)
            tem = false; //Caso o que está escrito acima seja verdade, quer dizer que o campo passa a não ter nada escrito logo "tem" passa a ser "false"
            socket.emit('parouEscrever'); //Envia o aviso de que o utilizador parou de escrever
        }
    });
    //FIM DE ENVIAR ESTADO DE COMEÇOU/PAROU DE ESCREVER

    //REGISTAR
    $('form#registarUtilizador').submit(function () { //Esta função é executada quando o utilizador envia o formulário de registo
        $('h3.erroLoginRegisto').css('display', 'none'); //Esconde a mensagem de erro de registo (caso ela já esteja à vista)
        socket.emit('registarUtilizador', { nome: $('#inputUtilizador').val(), password: $('#inputPassword').val() }); //Envia um objeto, composto pelo nome de utilizador e pela password, para o servidor
    });
    socket.on('confirmacaoRegistarUtilizador', function (flag) { //Recebe a confirmação de que o utilizador foi ou não registado ("flag" pode tomar o valor de 0 - Não foi registado; 1 - Foi registado)
        if (flag == 0) { //Verifica "flag" (se for "=0" quer dizer que não foi registado)
            $('h3.erroLoginRegisto').css('display', 'block'); //Mostra a mensagem de erro
        } else if (flag == 1) { //Verifica "flag" (se for "=1" quer dizer que foi registado)
            window.location.href = '/'; //Redireciona o utilizador para a página de chat onde poderá vazer o login
        }
    });
    //FIM REGISTAR

    //LOGIN
    $('form#loginUtilizador').submit(function () { //Esta função é executada quando o utilizador envia o formulário de login
        $('h3.erroLoginRegisto').css('display', 'none'); //Esconde a mensagem de erro do login (caso ela já esteja à vista)
        socket.emit('loginUtilizador', { nome: $('#inputUtilizador').val(), password: $('#inputPassword').val() }); //Envia um objeto, composto pelo nome de utilizador e pela password, para o servidor
        return false;
    });
    socket.on('confirmacaoLoginUtilizador', function (flag) { //Recebe a confirmação de que o utilizador fez ou não o login com sucesso ("flag" pode tomar o valor de 0 - Não fez login com sucesso; 1 - Fez login com sucesso)
        if (flag == 0) { //Verifica "flag" (se for "=0" quer dizer que não fex login)
            $('h3.erroLoginRegisto').css('display', 'block'); //Mostra a mensagem de erro
        } else if (flag == 1) { //Verifica "flag" (se for "=1" quer dizer que fez login)
            utilizador = $('#inputUtilizador').val(); //Muda o nome de utilizador para o valor do campo "utilizador"
            $('div#loginHeader').css('display', 'none'); //Esconde o formulário de login e o botão de registo
            $('#utilizadorLigado').text('Bem vindo ' + utilizador + '!'); //Cria uma mensagem de boas-vindas
            $('div#logoutHeader').css('display', 'block'); //Mostra o botão de logout
        }
    });
    //FIM LOGIN

    //RECEBER MENSAGEM DO SERVIDOR
    socket.on('envioMensagemCliente', function (mensagem) { //Recebe uma mensagem e coloca-a na lista de mensagens ("mensagem" é um objeto composto pelo autor da mensagem e pela mensagem)
        $('#listaMensagens').append($('<li>').text(mensagem.utilizador + ': ' + mensagem.msg)); //Adiciona a mensagem recebida na "lista de mensagens"
    });
    socket.on('envioMensagemPrivadaCliente', function (mensagem) { //Recebe uma mensagem e coloca-a na lista de mensagens ("mensagem" é um objeto composto pelo autor da mensagem e pela mensagem)
        $('#listaMensagens').append($('<li>').text('Privada de ' + mensagem.utilizador + ': ' + mensagem.msg)); //Adiciona a mensagem recebida na "lista de mensagens"
    });
    //FIM RECEBER MENSAGEM DO SERVIDOR

    //RECEBER QUEM COMEÇOU/PAROU DE ESCREVER
    socket.on('mostrarEscrever', function (utilizadorEscreve) { //Recebe e mostra o utilizador que começou a escrever ("utilizadorEscreve" é o nome do utilizador que começou a escrever)
        $('#listaEscrever').append($('<li id="escrever' + utilizadorEscreve + '">').text(utilizadorEscreve + ' está a escrever!'));  //Adiciona o aviso de que algem começou a escrever na "lista de escrever"
    });
    socket.on('retirarEscrever', function (utilizadorParouEscrever) { //Recebe e retira o utilizador que parou de escrever ("utilizadorParouEscrever" é o nome do utilizador que parou de escrever)
        var id = '#escrever' + utilizadorParouEscrever; //Constroi o "id" do elemento da lista que vai ser removido
        $(id).remove(); //Remove esse elemento
    });
    //FIM RECEBER QUEM COMEÇOU/PAROU DE ESCREVER

    //ATUALIZAR LISTA DE UTILIZADORES LIGADOS
    socket.on('atualizarUtilizadoresLigados', function (nomesUtilizadoresLigados) { //Recebe e mostra os utilizadores ligados ("nomesUtilizadoresLigados" é um array com todos os nomes de utilizadores que estão neste momento ligados)
        $('#listautilizadoresLigados').empty(); //Limpa a atual lista de "utilizadores ligados"
        $('#destino').empty(); //Limpa a caixa de seleção de utilizador para enviar mensagem privada
        $('#destino').append($('<option value="Todos">').text('TODOS')); //Adiciona o destino padrão (disponibiliza o envio de mensagens para todos os utilizadores que tem de estar sempre visível)
        $.each(nomesUtilizadoresLigados, function (key, value) { //Percorre os nomes utilizadores ligados ("value" será o nome de cada elemento dos "nomes utilizadores ligados")
            $('#listautilizadoresLigados').append($('<li>').text(value)); //Adiciona cada utilizador à lista de "utilizadores ligados"
            if (value != 'GUEST' && value != utilizador) { //Verifica se nome de utilizador que está a ser percorrido neste momento é ("!=GUEST" e "!=" dele próprio)
                $('#destino').append($('<option value="' + value + '">').text(value)); //Caso seja, adiciona à lista de "destino" esse nome de utilizador
            } //(No fundo, este "if" fará com que sejam adicionados à lista de destino todos os nomes dos utilizadores ligados exceto os "GUEST" e o próprio utilizador)
        });
    });
    //FIM ATUALIZAR LISTA DE UTILIZADORES LIGADOS
});