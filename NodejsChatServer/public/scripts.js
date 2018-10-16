$(function () {
    var socket = io();
    //ENVIAR MENSAGEM
    $('form#mensagem').submit(function () {
        socket.emit('envioMensagem', $('#inputMensagem').val());
        $('#inputMensagem').val('');
        return false;
    });

    //REGISTAR
    $('form#utilizador').submit(function () {
        socket.emit('registarUtilizador', { nome: $('#inputUtilizador').val(), password: $('#inputPassword').val() });
        
        return false;
    });

    //FIM REGISTAR

    socket.on('envioMensagem', function (mensagem) {
        $('#listaMensagens').append($('<li>').text(mensagem.utilizador + ': ' + mensagem.msg));
    });
});