$(function () {
    H_login = {};
    H_login.openLogin = function(){
        $('.login-header a').click(function(){
            $('.login').show();
            $('.login-bg').show();
        });
    };
    H_login.closeLogin = function(){
        $('.close-login').click(function(){
            $('.login').hide();
            $('.login-bg').hide();
        });
    };
    H_login.loginForm = function () {
        $("#login-button-submit").on('click',function(){
              var username = $("#username");
              var usernameValue = $("#username").val();
            if(usernameValue == ""){
                alert("输入不能为空");
                username.focus();
                return false;
            }else if(usernameValue.length > 100){
                alert("输入不能大于100字符");
                username.focus();
                return false;
            }else{
                alert("发送成功");
                setTimeout(function(){
                    $('.login').hide();
                    $('.login-bg').hide();
                    $('.list-input').val('');
                },2000);
            }
        });
    };
    H_login.run = function () {
        this.closeLogin();
        this.openLogin();
        this.loginForm();
    };
    H_login.run();
});