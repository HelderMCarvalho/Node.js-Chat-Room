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
        $('h3.nomeUtilizadorExiste').css('display', 'none');
        socket.emit('registarUtilizador', { nome: $('#inputUtilizador').val(), password: $('#inputPassword').val() });
        return false;
    });
    socket.on('confirmacaoRegistarUtilizador', function (flag) {
        if (flag==0) {
            $('h3.nomeUtilizadorExiste').css('display', 'block');
        }
        
    });
    //FIM REGISTAR

    socket.on('envioMensagem', function (mensagem) {
        $('#listaMensagens').append($('<li>').text(mensagem.utilizador + ': ' + mensagem.msg));
    });
});