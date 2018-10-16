$(function () {
    var socket = io();
    //ENVIAR MENSAGEM
    $('form#mensagem').submit(function () {
        socket.emit('envioMensagem', $('#inputMensagem').val());
        $('#inputMensagem').val('');
        return false;
    });

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
            $('h3.erroLoginRegisto').css('display', 'block');
        } else if (flag == 1) {
            $('div#loginHeader').css('display', 'none');
            $('div#logoutHeader').css('display', 'block');
        }
    });
    //FIM LOGIN

    socket.on('envioMensagem', function (mensagem) {
        $('#listaMensagens').append($('<li>').text(mensagem.utilizador + ': ' + mensagem.msg));
    });
});