const inicDebug = require('debug')('app:inicio');
const dbDebug = require('debug')('app:dataBase');
const express = require('express');
const config = require('config');
//const logger = require('./logger');
const morgan = require('morgan');
const joi = require('joi');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

console.log('Aplicación: ' + config.get('name'));
console.log('DB server: ' + config.get('configDB.host'));

if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    //console.log('Morgan habilitado');
    inicDebug('Morgan habilitado');
}

dbDebug('Conectando a DB');

//app.use(logger);

//app.use(function(req, res, next){
//    console.log('Autenticando....... ');
//    next();
//})

const users = [
    {id: 1, name: 'Pepe'},
    {id: 2, name: 'James'},
    {id: 3, name: 'John'},
];

app.get('/', (req, res) => {
    res.send('Hola mundo desde express');
});

app.get('/api/users', (req, res) => {
    console.log('/api/users');    
    res.send(users);
});

app.get('/api/users/:id', (req, res) => {
    let user = userExist(req.params.id);
    if(!user){
        res.status(404).send('El usuario no existe');
        return;
    }
    res.send(user);
});

app.post('/api/users', (req, res) => {
    const {error, value} = userValidate(req.body.name);
    if(!error){
        const user = {
            id: users.length + 1,
            name: value.name,
        };
        users.push(user);
        res.send(user);
    }else{
        res.status(400).send(error.details[0].message);
    }
});

app.put('/api/users/:id', (req, res) => {
    let user = userExist(req.params.id);
    if(!user){
        res.status(404).send('El usuario no existe');
        return;
    }

    const {error, value} = userValidate(req.body.name);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }

    user.name = value.name;
    res.send(user);
});

app.delete('/api/users/:id', (req, res) => {
    let user = userExist(req.params.id);
    if(!user){
        res.status(404).send('El usuario no existe');
        return;
    }    
    const index = users.indexOf(user);
    users.splice(index, 1);
    res.send(user);
});

const port = config.get('port') || 3000;
app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}....`);
});

function userExist(id){
    return users.find(u => u.id === +id);
}

function userValidate(n){
    const schema = joi.object({
        name: joi.string().min(3).required(),  
    });  
    return schema.validate({name: n});
}