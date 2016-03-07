var fb = new Firebase('https://glaring-torch-8342.firebaseio.com/');
var fbProdutos = new Firebase('https://glaring-torch-8342.firebaseio.com/produtos');
var fbCompras = new Firebase('https://glaring-torch-8342.firebaseio.com/compras');
var compras;
var produtos;
var lista = new Array();
var emaildoCookie = '';

function main(){
    verificaCookie();
    initViewLogin();
    //initViewCompras();
}

function initViewCadastro() {
    console.log('exibir cadastro');
    conteudo('fragments/cadastro',function() {
        //Botao de cadastro de novo usuario
    	$('#btn-sigin').on('click', function(ev){
    		var txtemail = $('#txt-email');
    		var txtsenha = $('#txt-senha');
    		var txtresenha = $('#txt-resenha');
    
    		var email = txtemail.val();
    		var senha = txtsenha.val();
    		var resenha = txtresenha.val();

    		var completo = true;
    
    		if(email==null || email==''){
    			if(!txtemail.hasClass('notificado')){
    				txtemail.addClass('notificado');
    				$('#lb-email').after('<h5 id="emailnotificado" class="vermelho">Campo obrigatório</h5>');
    				completo = false;
    			}
    		}else{
    			if(txtemail.hasClass('notificado')){
    				txtemail.removeClass('notificado');
    				$('#emailnotificado').detach();
    			}
    		}
    
    		if(senha==null || senha==''){
    			if(!txtsenha.hasClass('notificado')){
    				txtsenha.addClass('notificado');
    				$('#lb-senha').after('<h5 id="senhanotificado" class="vermelho">Campo obrigatório</h5>');
    				completo = false;
    			}
    		}else{
    			if(txtsenha.hasClass('notificado')){
    				txtsenha.removeClass('notificado');
    				$('#senhanotificado').detach();
    			}
    		}
    
    		if(resenha==null || resenha==''){
    			if(!txtresenha.hasClass('notificado')){
    				txtresenha.addClass('notificado');
    				$('#lb-resenha').after('<h5 id="resenhanotificado" class="vermelho">Campo obrigatório</h5>');
    				completo = false;
    			}
    		}else{
    			if(txtresenha.hasClass('notificado')){
    				txtresenha.removeClass('notificado');
    				$('#resenhanotificado').detach();
    			}
    		}
    
    		if(senha != resenha){
    			if(!txtresenha.hasClass('naoconfere')){
    				txtresenha.addClass('naoconfere');
    				$('#lb-resenha').after('<h5 id="senhanaoconfere" class="vermelho">Senha não confere</h5>');
    				completo = false;
    			}
    		}else{
    			if(txtresenha.hasClass('naoconfere')){
    				txtresenha.removeClass('naoconfere');
    				$('#senhanaoconfere').detach();
    			}
    		}
    
    		if(completo){
    		    
    			var user = {
        			email: email,
        			password: senha
    			}
    			
    			fb.createUser(user,function(error, userData) {
    			    if(error){
    			        console.log('erro criando usuario ', error);
    			        if('INVALID_EMAIL'==error.code){
    			            if(!txtemail.hasClass('notificado')){
                    			txtemail.addClass('notificado');
                    			$('#lb-email').after('<h5 id="emailnotificado" class="vermelho">Campo inválido</h5>');
                    		}
    			        }
    			    }else{
    			        console.log('usuario criado ',userData.uid);
    			        alert('Cadastro efetuado');
    			        initViewLogin();
    			    }
    			});
    		
    		}
    	});
    });
}

//Busca o conteudo de um fragmento
function conteudo(fragmento, callback){
    console.log('Buscando conteudo de '+fragmento);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var texto = xhttp.responseText;
            $('#tela').html(texto);
            callback();
        }
    }
    xhttp.open("GET", fragmento, true);
    xhttp.send();
}

//Exibe a tela de login
function initViewLogin(){
    console.log('exibir login');
    conteudo('fragments/login',function(){
        
        if(emaildoCookie==''){
            $('#txt-email').focus();
        }else{
            $('#txt-email').val(emaildoCookie);
            $('#txt-senha').focus();
        }
        
        
        //Botao de logar
        $('#btn-logar').on('click',function(ev) {
            logar();
        });
        
        //Pressionar enter no campo senha faz a acao de logar
        $('#txt-senha').on('keypress',function(ev) {
            if(ev.keyCode==13){
              logar();  
            }
        });
        
        //Botao cadastrar
        $('#btn-cadastro').on('click',function(ev) {
            initViewCadastro();
        });
        
    });
}

function logar(){
    var txtemail = $('#txt-email');
    var txtsenha = $('#txt-senha');
    var email = txtemail.val();
    var senha = txtsenha.val();
    if(email!=null && email!=''){
        if(senha!=null && senha!=''){
            var user = {
			    email: email,
			    password: senha
		    }
            fb.authWithPassword(user, function(error, userData){
                if(error){
                    console.log('erro de login',error);
                    if('INVALID_PASSWORD'==error.code || 'INVALID_USER'==error.code || 'INVALID_EMAIL'==error.code){
                       if(!txtsenha.hasClass('notificado')){
                            txtsenha.addClass('notificado');
				            $('#lb-senha').after('<h5 id="emailsenhanotificado" class="vermelho">Email ou senha invalidos</h5>');
                       }
                    }else{
                        if(!txtsenha.hasClass('notificado')){
                            txtsenha.addClass('notificado');
				            $('#lb-senha').after('<h5 id="emailsenhanotificado" class="vermelho">'+error.message+'</h5>');
                        }
                    }
                }else{
                    console.log('login efetuado',userData);
                    initViewCompras();
                    criarCookie(email);
                }
            });
        }
    }  
}

function initViewLista(){
    conteudo('fragments/lista',function() {

        fbProdutos.once('value', function (dataSnapshot) {
            console.log("retornando produtos");
            var produtos = dataSnapshot.val();
            var produto;
            dataSnapshot.forEach(function(childSnapshot){
                produto = childSnapshot.val();
                console.log(produto.nome);
                var linhaProduto = '<div class="checkbox"><label><input type="checkbox">'+produto.nome+'</label></div>';
                $('#lista').append(linhaProduto);
            });
                
            
        }, function (err) {
            console.log("erro retornando produtos",err);
        });
    });
}

function initViewCompras(){
    conteudo('fragments/compras',function() {
        $('#btn-novalista').on('click',function(ev){
            initViewLista();
        });
        
        fbCompras.once('value', function (dataSnapshot) {
            console.log("retornando compras");
            compras = dataSnapshot.val();
            var compra;
            dataSnapshot.forEach(function(childSnapshot){
                compra = childSnapshot.val();
                var linhaCompra = '<a href="#" class="list-group-item">'+compra.data+'</a>';
                $('#listacompras').append(linhaCompra);
            });
            
            $('.list-group-item').on('click',function(ev) {
                exibirCompra($(this).html());
            });
                
            
        }, function (err) {
            console.log("erro retornando compras",err);
        });
        
        fbProdutos.once('value', function (dataSnapshot) {
            console.log("retornando produtos");
            produtos = dataSnapshot.val();
        }, function (err) {
            console.log("erro retornando produtos",err);
        });
        
    });
}

//Exibe a compra da data informada
function exibirCompra(dataCompra){
    conteudo('fragments/lista',function() {
        
        $('#btn-fechar').on('click',function(ev){
            initViewCompras();
        });
        
        var compra = buscarCompra(dataCompra);
        var itens = compra.produtos;
        var item;
        var total = 0;
        //var cont = -1;
        for(item in itens){
            
            var produto = buscarProduto(item);
            var itemDados = itens[item].split('|');
            var index = 0;
            var marcado = JSON.parse(itemDados[index++]);
            var nome = produto.nome;
            var qtd = JSON.parse(itemDados[index++]);
            var unit = JSON.parse(itemDados[index++]);
            var subt = qtd*unit;
            total += subt;

            var itemCompra = new ItemCompra(marcado,nome,qtd,unit,subt);
            
            lista.push(itemCompra);
            addItemView(itemCompra);
        }
        
        atualizaTotal();
        
        var prod;
        var opcoes = '';
        for(prod in produtos){
            var pro = produtos[prod];
            opcoes += '<option>'+pro.nome+'</option>';
        }
        
        $('#selecao').append(opcoes);
        
        //Remove o item da view e da lista
        $('.item').on('click',function(ev) {
            var remover = $(this).attr('id');
            var linhaRemover = '#linha'+remover;
            $(linhaRemover).remove();
            lista.splice(--remover,1);
            atualizaTotal();
        });
        
        $('#btn-adicionar').on('click',function(ev) {
            var selecionado = $('#selecao').val();
            var produto = buscarProduto(selecionado);
            var itemCompra = new ItemCompra(false,produto.nome,1,0,0);
            lista.push(itemCompra);
            addItemView(itemCompra);
            
        });
        
        $('.itemMarca').on('click',function(ev) {
            var linha = $(this).parent();
            var spanId = '#span'+linha.attr('id').replace('linha','');
            if(linha.hasClass('marcado')){
                $(spanId).hide();
                linha.removeClass('marcado');
            }else{
                $(spanId).show();
                linha.addClass('marcado');
            }
        });
        
        // $('.itemQtd').on('click',function(ev) {
            
        // });
        
    });
}

//Adiciona o item na tabela
function addItemView(itemCompra){
    var cont = lista.length;
    var linhaItem;
            
    linhaItem = '<tr id="linha'+cont+'">';
    linhaItem += '<td class="itemMarca"><span id="span'+cont+'" class="glyphicon glyphicon-ok"/></td>';
    linhaItem += '<td class="itemMarca">'+itemCompra.nome+'</td>';
    linhaItem += '<td class="itemQtd" contenteditable="true" onfocusout="atualizaItem()">'+itemCompra.qtd+'</td>';
    linhaItem += '<td contenteditable="true">'+itemCompra.unit+'</td>';
    linhaItem += '<td>'+itemCompra.subt+'</td>';
    linhaItem += '<td><span class="glyphicon glyphicon-remove item" id="'+cont+'"/></td>';
    linhaItem += '</tr>';
    $('#tabela').append(linhaItem);
    
    if(itemCompra.marcado){
        $('#linha'+cont).addClass('marcado')
    }else{
        $('#span'+cont).hide();
    }
}

function atualizaItem(){
    var linha = $(this).parent();
    alert(linha);
}

//Percorre a lista atual de produtos para retornar o desejado
function buscarProduto(codigoNome) {
    if(isNaN(codigoNome)){
        var codigo;
        var produto;
        for(codigo in produtos){
            produto = produtos[codigo];
            if(produto.nome==codigoNome){
                codigoNome = codigo;
            }
        }
    }
    return produtos[codigoNome];
    
}

//Percorre a lista atual de compras para retornar a desejada
function buscarCompra(dataCompra){
    var compra;
    for(compra in compras){
        var compraAtual = compras[compra];
        if(compraAtual.data==dataCompra){
           return compraAtual;
        }
    }
}

function retiraBarras(dataCompra){
    var semBarras = dataCompra.split('/');
    var dtCompra = semBarras[0]+semBarras[1]+semBarras[2];
    return dtCompra;
}

//Atualiza o total da compra na tela, percorrendo a lista de itens
function atualizaTotal(){
    var codigo;
    var itemCompra;
    var total = 0;
    for(codigo in lista){
        itemCompra = lista[codigo];
        total += itemCompra.subt;
    }
    $('#total').html('<b>Total($)</b>='+total);
}

//Se o Cookie existe, retorna o email
function verificaCookie(){
    var incCookie = document.cookie.split(';');
    if(incCookie!=''){
        for(var i = 0; i<incCookie.length; i++){
            var cookieAtual = incCookie[i].split('=');
            if(cookieAtual[0]=='email'){
                emaildoCookie = cookieAtual[1];
            }
        }
    }
}

//Cria o cookie com o email informado
function criarCookie(email){
    var emailCookie = 'email='+email+';path=/;expires=never';
    document.cookie = emailCookie;
}

$(document).ready(main);