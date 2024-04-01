require("dotenv").config()
const express = require("express");
//const session = require("express-session")
const {json, urlencoded} = require("express");
const jwt = require("jsonwebtoken")
const bcrypt = require ("bcrypt");
const cors = require ("cors")

const app = express();
app.use(json());

const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';

const client = new MongoClient(url);

app.use(json());
app.use(urlencoded({ extended: true }));

const protectionRoute = (req, res, next) => {
    const token = req.query.token;
    if (token) {
        jwt.verify(token, `process.env.TOKEN_KEY`, (err, account) =>{
            if (err) {
                return res.redirect("/login")
            }
            next()
        })
    } else {
        return res.redirect("/login")
    }
}

//app.use(
   // session({
    //    name: process.env.SESSION_NAME,
     //   resave: false,
     //   saveUninitialized: false,
      //  secret: process.env.SESSION_SECRET,
      //  cookie: {
       //     maxAge: 1000 * 60 * 60 * 24 * 7,
       //     secure: false
     //   }
 //   })
//)

app.use((req, res, next) => {
    const { token } = req.query;
    if (token) {
        jwt.verify(token, `process.env.TOKEN_KEY`, (err, account) => {
            if (err) {
                console.error('Erreur lors de la vérification du jeton :', err);
                return res.redirect("/login");
            }
            account.token = token;
            res.locals.account = account;
            next();
        });
    } else {
        next();
    }
});



async function connectToDB() {
    try {
        await client.connect();
        console.log('Connecté à la base de données MongoDB');
    } catch (err) {
        console.error('Erreur de connexion à la base de données:', err);
    }
}

// Functions

// Get users
async function getUsers() {
    try {
        connectToDB()

        const database = client.db('db-cart');
        const collection = database.collection('Users Collection');

        const result = await collection.find({}).toArray();

        console.log('Données importées avec succès');
        return result
    } catch (err) {
        console.error('Erreur lors de la récupération de données:', err);
    }
}

// Import users
async function importUsers(user) {
    try {
        connectToDB()

        const database = client.db('db-cart');
        const collection = database.collection('Users Collection');

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash

        await collection.insertOne(user);

        console.log('Données importées avec succès');
    } catch (err) {
        console.error('Erreur lors de l\'importation des données:', err);
    } finally {
        await client.close();
    }
}

//Login user
async function loginUser(req, user) {
    try {
        connectToDB()

        const database = client.db('db-cart');
        const collection = database.collection('Users Collection');

        const accounts = await collection.find({}).toArray()
        const password = user.password
        for (const account of accounts){
            const hashedPassword = account.password
            if (account.email === user.email) {
                bcrypt.compare(password, hashedPassword, (err, result) => {
                    if (err) {
                        console.error('Erreur lors de la comparaison des mots de passe :', err);
                        return;
                    }
                    if (result) {
                        const token = jwt.sign({id: account._id,email:account.email,name:account.name},`process.env.TOKEN_KEY`)
                        account.token = token;
                        console.log('Le mot de passe correspond.');
                        return
                    } else {
                        console.log('Le mot de passe ne correspond pas.');
                        return
                    }
                });
            }
        }

        console.log('Données importées avec succès');
    } catch (err) {
        console.error('Erreur lors de l\'importation des données:', err);
    } finally {
        await client.close();
    }
}

//Login user
async function logoutUser(req) {
    try {
        req.locals.account = undefined
    } catch (err) {
        console.error('Erreur lors de la déconnection:', err);
    }
}

//Account API

//Create user
app.post("/api/register", async (req, res)=>{
    try {
        let password = req.body.password 
        const users = await getUsers();
        let newId = users.length +1

        const newAccount = {
            _id: newId,
            email: req.body.email,
            name: req.body.name,
            password: password
        };
        await importUsers(newAccount)

        //req.session._id = newAccount._id
        const token = jwt.sign({_id: newAccount._id,email:newAccount.email,name:newAccount.name},`process.env.TOKEN_KEY`)
        newAccount.token = token;

        res.redirect("http://localhost:3000/login")
    } catch (err) {
        console.error('Erreur lors du hachage du mot de passe :', err);
        res.status(500).json({ error: 'Erreur lors du hachage du mot de passe' });
    }
})

//Login user
app.post("/api/login", (req, res)=>{
    loginUser(req, req.body)
    res.redirect("http://localhost:3000/")
})

//Logout user
app.post("/api/logout", (req, res)=>{
    logoutUser(req)
    res.redirect("http://localhost:3000/")
})

//Logged user
app.get("/api/logged", (req, res)=>{
    const { account } = res.locals;
    console.log(account)
})

//Cart API

//Middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});


const port = 8080;
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});