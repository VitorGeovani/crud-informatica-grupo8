const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const bodyParser = require('body-parser');
const port = 3000; //porta padrÃ£o
const mysql = require('mysql2');
const multer = require('multer');
let data;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
   // cb(null, './uploads/');
    cb(null, '/var/www/html/uploads/');
  },
  filename: function(req, file, cb) {
    data = new Date().toISOString().replace(/:/g, '-') + '-';
     cb(null, data + file.originalname);  
        
    }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
    fileFilter: fileFilter
});

// configurando body parse para pegar os POSTS mais tarde
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

// definindo as rotas
const router = express.Router();
router.get('/',(req, res) => res.json({ message: 'funcionando'}));
app.use('/', router);

//iniciar o servidor
app.listen(port);
console.log('API funcionando!');

//Função para acessar o banco de dados
function execSQLQuery(sqlqry, res) {
    const connection = mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'grupo8',
        password: 'Senai115',
        database: 'crudinfo'
    });
    // Esse connection serve para exibir os resultados de error ou se executou nossa funções GET, DELETE, POST, PATCH
    connection.query(sqlqry, function (error, results, fields) {
        if (error)
            res.json(error)
        else
            res.json(results);
        connection.end();
        console.log("Executou!")
    });
}
 
router.get('/produtos', (req, res) => {
    execSQLQuery('SELECT * FROM produtos', res);
})
 
router.get('/produtos/:codProduto?', (req, res) => {
  let filter = '';
  if(req.params.codProduto) filter = ' WHERE codProduto=' + parseInt(req.params.codProduto);
  execSQLQuery('SELECT * FROM produtos' + filter, res); 
});
 
router.delete('/produtos/:codProduto', (req, res) =>{
  execSQLQuery('DELETE FROM produtos WHERE codProduto=' + parseInt(req.params.codProduto), res);
});
 
router.post('/produtos', upload.single('imagem_produto'), (req, res) => {
  console.log(req.file);
  const nome = req.body.nome.substring(0,150);
  const precoVenda = req.body.precoVenda.substring(0,30);
  const descricao = req.body.descricao.substring(0,255);
  const imagem = 'uploads/' + req.file.filename; 
  execSQLQuery(`INSERT INTO produtos(nome, precoVenda, descricao, imagem_produto) VALUES('${nome}', '${precoVenda}', '${descricao}', '${imagem}')`, res);
});
 
router.patch('/produtos/:codProduto', (req, res) => {
  const codProduto = parseInt(req.params.codProduto);
  const nome = req.body.nome.substring(0,150);
  const precoVenda = req.body.precoVenda.substring(0,30);
  const descricao = req.body.descricao.substring(0,255);
  execSQLQuery(`UPDATE produtos SET nome='${nome}', precoVenda='${precoVenda}', descricao='${descricao}'  WHERE codProduto=${codProduto}`, res);
});
