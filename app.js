const express = require("express");
const app = express();
const path = require('path');
const exphbs = require("express-handlebars");
const db = require("./db/connection");
const bodyParse = require("body-parser");
const Job = require("./models/Job");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log("O Express está rodando na porta "+PORT);
})

//body parser
app.use(bodyParse.urlencoded({extended: false}));

// handle bars
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs.engine({defaultLayout: 'main', extname: '.handlebars'}));
app.set('view engine', 'handlebars');

// static folder
app.use(express.static(path.join(__dirname, 'public')));

// db connection
db.authenticate()
.then(() => {
    console.log("Conectou ao banco com sucesso");
}).catch(err => {
    console.log("Ocorreu um erro ao conectar", err);
})

// Routes
app.get("/", (req, res) => {

    let search = req.query.job;
    let query = '%'+search+'%';

    if(!search) {
        // pegar todas as vagas do BD e Renderizar no html
        Job.findAll({order: [
            ['createdAt', 'DESC']
        ]})
        .then(jobs => {
            res.render('index', {
                jobs
            });
        })
        .catch(err => console.log(err));
    } else {
        // pegar vagas do BD fintrando pesquisa e Renderizar no html
        Job.findAll({
            where: {title: {[Op.like]: query}},
            order: [
            ['createdAt', 'DESC']
        ]})
        .then(jobs => {
            res.render('index', {
                jobs, search
            });
        })
        .catch(err => console.log(err));
    }
})


// jobs routes
app.use('/jobs', require('./routes/jobs'));