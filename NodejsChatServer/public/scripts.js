$(function () {
    var socket = io();
    var utilizador = 'GUEST';
    //ENVIAR MENSAGEM
    $('form#mensagem').submit(function () {
        socket.emit('envioMensagemServidor', $('#inputMensagem').val());
        $('#listaMensagens').append($('<li>').text(utilizador + ': ' + $('#inputMensagem').val()));
        $('#inputMensagem').val('');
        $("#mensagens").scrollTop($("#mensagens")[0].scrollHeight);
        return false;
    });
    //FIM ENVIAR MENSAGEM

    //ENVIAR ESTADO DE COMEÇOU/PAROU DE ESCREVER
    var tem = false;
    var vazio = true;
    $("#inputMensagem").keyup(function () {
        if (($("#inputMensagem").val().length == 1) && (tem == false)) {
            tem = true;
            vazio = false;
            socket.emit('comecaEscrever');
        } else if (($(this).val() == '') && (vazio == false)) {
            tem = false;
            vazio = true;
            socket.emit('parouEscrever');
        }
    });
    //FIM DE ENVIAR ESTADO DE COMEÇOU/PAROU DE ESCREVER

    //REGISTAR
    $('form#registarUtilizador').submit(function () {
        $('h3.erroLoginRegisto').css('display', 'none');
        socket.emit('registarUtilizador', { nome: $('#inputUtilizador').val(), password: $('#inputPassword').val() });
        return false;
    });
    socket.on('confirmacaoRegistarUtilizador', function (flag) {
        if (flag==0) {
            $('h3.erroLoginRegisto').css('display', 'block');
        }
    });
    socket.on('redirect', function (destino) {
        window.location.href = destino;
    });
    //FIM REGISTAR

    //LOGIN
    $('form#loginUtilizador').submit(function () {
        $('h3.erroLoginRegisto').css('display', 'none');
        socket.emit('loginUtilizador', { nome: $('#inputUtilizador').val(), password: $('#inputPassword').val() });
        return false;
    });
    socket.on('confirmacaoLoginUtilizador', function (flag) {
        if (flag == 0) {
            $('h3.erroLoginRegisto').css('display', 'block'); //Não fez login
        } else if (flag == 1) {
            $('div#loginHeader').css('display', 'none'); //Fez login
            $('div#logoutHeader').css('display', 'block');
            utilizador = $('#inputUtilizador').val();
        }
    });
    //FIM LOGIN

    //RECEBER MENSAGEM DO SERVIDOR
    socket.on('envioMensagemCliente', function (mensagem) {
        $('#listaMensagens').append($('<li>').text(mensagem.utilizador + ': ' + mensagem.msg));
    });

    //RECEBER QUEM ESTÁ A ESCREVER
    socket.on('mostrarEscrever', function (utilizadorEscreve) {
        $('#listaEscrever').append($('<li id="' + utilizadorEscreve + '">').text(utilizadorEscreve + ' está a escrever!'));
    });

    //RECEBER QUEM PAROU DE ESCREVER
    socket.on('retirarEscrever', function (utilizadorParouEscrever) {
        var id = '#' + utilizadorParouEscrever;
        $(id).remove();
    });
});