// IMPORTAR modulo EXPRESS 
const express = require('express');

// IMPORTAR modulo MYSQL

const mysql = require('mysql2');

//IMPORTAR modulo express handelbars

const {engine} = require('express-handlebars');

// IMPORTAR  express fileupload

const fileUpload = require('express-fileupload');

//IMPORTAR file system

const fs = require('fs');

//app é uma instância do express é tudo do express é seve para fazer referencia

const app = express();

//habilitando o upload de arquivos

app.use(fileUpload());

//Adicionar o BOOTSTRAP

app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));

//Adicionar Css

app.use('/css', express.static('./css'));

//Imagem referencia

app.use('/image', express.static('./image'));

//configuração do handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');


//Manipulação de dados via rotas

app.use(express.json());
app.use(express.urlencoded({extended:false}));


// CRIAR CONEXÃO COM O BANCO DE DADOS


conexão= mysql.createConnection({
    host:'localhost', // endereço do banco de dados
    user:'root', // usuário do banco de dados
    password:'10082010', // senha do banco de dados
    database:'projeto' // nome do banco de dados
})


//Teste de conexão com o banco de dados

conexão.connect(function(erro){
    if(erro) throw erro;
    console.log('Conexão com o banco de dados realizada com sucesso!');
})

// Rota principal

// rota hello world
// req = request
// res = response
app.get('/', function (req,res){
    // Sql
    let sql = 'SELECT * FROM produtos'; // selecionar todos os produtos

    //Executar SQL
    conexão.query(sql, function(erro,retorno){
        //Caso ocorra erro
        if(erro) throw erro;

        //Caso contrário
        res.render('formulario', {produtos:retorno});
    })
});

// Rota de cadastro

app.post('/cadastrar', function(req,res){
    // obter os dados do formulário
    let nome = req.body.nome;
    let valor = req.body.valor;
    let imagem = req.files.imagem.name;
    // Estrutura SQL
    let sql = `INSERT INTO produtos (nome, valor, imagem) VALUES ('${nome}', '${valor}', '${imagem}')`; // inserir dados no banco de dados

    //Executar SQL
    conexão.query(sql, function(erro,retorno){ 
        //Caso  ocorra erro
        if(erro) throw erro;

        //Caso contrário
        req.files.imagem.mv(__dirname + '/image/'+ req.files.imagem.name) // salvar a imagem
        console.log(retorno);
    })
    res.redirect('/'); // redirecionar para a página principal
})

// Rota para remover produtos
app.get('/remover/:codigo&:imagem', function(req, res){
    //SQL
    let sql = `DELETE FROM produtos WHERE codigo = ${req.params.codigo}`
    //Executar SQL
    conexão.query(sql, function(erro,retorno){
        //Caso ocorra erro
        if(erro) throw erro;

        //Caso contrário
        fs.unlink(__dirname + '/image/' + req.params.imagem,(erro)=>{ // remover a imagem
            console.log(erro);
        })
    })
    //redirecionar para a página principal
    res.redirect('/');
});

// Rota para editar produtos
app.get('/formularioEditar/:codigo', function(req,res){ // rota para editar produtos
    //SQL
    let sql = `SELECT * FROM produtos WHERE codigo = ${req.params.codigo}`; // selecionar produtos pelo código

    //Executar SQL
    conexão.query(sql, function(erro,retorno){
        //Caso ocorra erro
        if(erro) throw erro;

        //Caso contrário
        res.render('formularioEditar', {produto:retorno[0]});
    })
})
// Rota para atualizar produtos
app.post('/editar', function(req,res){
    // obter os dados do formulário
    let codigo = req.body.codigo;
    let nome = req.body.nome;
    let valor = req.body.valor;
    let nomeImagem = req.body.nomeImagem;
    // Definir o tipo de Edição
    try{
        //Objeto de imagem
        let imagem = req.files.imagem;
        //SQL
        let sql = `UPDATE produtos SET nome = '${nome}', valor = ${valor}, imagem = '${imagem.name}' WHERE codigo = ${codigo}`; // atualizar os produtos
        //Executar SQL
        conexão.query(sql, function(erro,retorno){
            //Caso ocorra erro
            if(erro) throw erro;
            //Remover a imagem antiga
            fs.unlink(__dirname + '/image/' + nomeImagem,(erro)=>{
                console.log('erro ao remover imagem');
            })
            //Cadastro da nova imagem
            imagem.mv(__dirname + '/image/'+ imagem.name); // salvar a imagem
        })
    }catch(erro){
        //SQL
        let sql = `UPDATE produtos SET nome = '${nome}', valor = ${valor} WHERE codigo = ${codigo}`; // atualizar os produtos    
        //Executar SQL
        conexão.query(sql, function(erro,retorno){
            //Caso ocorra erro
            if(erro) throw erro;
        })
    }
    // Finalizar a execução
    res.redirect('/'); // redirecionar para a página principal
})
// Servidor
app.listen(8080)