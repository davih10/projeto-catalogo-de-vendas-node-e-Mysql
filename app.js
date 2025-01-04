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

    // SQL
    let sql = `DELETE FROM produtos WHERE codigo = ${req.params.codigo}`;
    
        // Executar o comando SQL
        conexao.query(sql, function(erro, retorno){
            // Caso falhe o comando SQL
            if(erro) throw erro;
            // Caso o comando SQL funcione
            fs.unlink(__dirname+'/image/'+req.params.imagem, (erro_imagem)=>{
                console.log('Falha ao remover a imagem ');
            });
        });
        
        // Redirecionamento
        res.redirect('/');
    
    });

// Servidor
app.listen(8080)