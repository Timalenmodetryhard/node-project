const express = require("express");
const {json} = require("express");
const session = require("express-session");
const bcrypt = require ("bcrypt");
const cors = require ("cors")

const app = express();
app.use(json());

const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';

const client = new MongoClient(url);

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
                        req.session.user = account
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
async function logoutUser() {
    try {
        app.use((req, res, next) => {
            req.session.user = {}
            next();
        });
    } catch (err) {
        console.error('Erreur lors de la déconnection:', err);
    }
}

//Logged user

//Session

//Configure session
app.use(session({
    secret: 'votre_secret',
    resave: false,
    saveUninitialized: true
}));

app.use(cors());

//Account API

//Get user information
app.get("/account/:userId", (req, res)=>{
    const accounts = getUsers();
    const userId = parseInt(req.params.userId);
    res.json(accounts[userId-1])
    res.status(200).json(accounts);
});

//Create user
app.post("/api/register", async (req, res)=>{
    let password = req.body.password 

    try {
        const users = await getUsers();
        const newId = users.length + 1;
        const hash = await bcrypt.hash(password, 10);
        console.log('Mot de passe haché :', hash);

        const newAccount = {
            _id: newId,
            email: req.body.email,
            name: req.body.name,
            password: hash
        };
        importUsers(newAccount)
        res.status(201).json(newAccount);
    } catch (err) {
        console.error('Erreur lors du hachage du mot de passe :', err);
        res.status(500).json({ error: 'Erreur lors du hachage du mot de passe' });
    }
})

//Login user
app.post("/api/login", (req, res)=>{
    loginUser(req, req.body)
    res.status(200).json(req.body);
})

//Logout user
app.post("/api/logout", (req, res)=>{
    logoutUser()
    res.status(200).json(req.body);
})

//Logged user
app.get("/api/logged", (req, res)=>{
    if (req.session.user) {
        res.status(200).json(req.session.user);
    } else {
        res.status(404).json({ error: 'Utilisateur non connecté' });
    }
})

//Cart API

// Middleware pour activer CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

const port = 8080;
app.listen(port, () => {
    
    console.log(`Serveur démarré sur le port ${port}`);
});