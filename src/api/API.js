const express = require("express");
const {json} = require("express");
const session = require("express-session");
const bcrypt = require ("bcrypt");
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

        const result = await collection.find({}).toArray;

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
async function loginUser(user) {
    try {
        connectToDB()

        const database = client.db('db-cart');
        const collection = database.collection('Users Collection');

        const accounts = await collection.find({}).toArray
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
                        app.use((req, res, next) => {
                            req.session.user = account
                            next();
                        });
                        console.log('Le mot de passe correspond.');
                    } else {
                        console.log('Le mot de passe ne correspond pas.');
                    }
                });
            } else {
                console.log("Le mail saisi ne correspond pas.")
            }
        }

        console.log('Données importées avec succès');
    } catch (err) {
        console.error('Erreur lors de l\'importation des données:', err);
    } finally {
        await client.close();
    }
}

//Session

//Configure session
app.use(session({
    secret: 'votre_secret',
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    if (!req.session.user) {
        req.session.user = {};
    }
    next();
});

//Account API

//Get user information
app.get("/account/:userId", (req, res)=>{
    const accounts = getUsers();
    const userId = parseInt(req.params.userId);
    res.json(accounts[userId-1])
    res.status(200).json(accounts);
});

//Create user
app.post("/register", (req, res)=>{
    const accounts = getUsers();
    let password = req.body.password 

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Erreur lors du hachage du mot de passe :', err);
            password = hash;
        }
        console.log('Mot de passe haché :', hash);
    });

    const newAccount = {
        _id: accounts.length+1,
        email: req.body.email,
        name: req.body.name,
        password: password
    };
    importUsers(newAccount)
    res.status(201).json(newAccount);
})

//Delete user
app.delete("/account/:userId", (req, res)=>{
    const accounts = getUsers();
    const userId = parseInt(req.params.userId);
    for(let i=0; i<accounts.length; i++){
        let currentUser = accounts[i];
        if(currentUser.id === userId){
            accounts.pop(currentUser)
        }
    }
    res.status(200).json(accounts);
})

//Update user balance
app.put('/account/update', (req, res) => {
    const accounts = getUsers();
    const userId = req.body.userId;
    const userNewBalance = req.body.newBalance;
    for(let i=0; i<accounts.length; i++){
        let currentUser = accounts[i];
        if(currentUser.id == userId){
            accounts[i].balance = userNewBalance
        }
    }
    res.status(200).json(accounts);
});

//Cart API

const products = [
    {"id":1, "name": "Water", "price": 1}
]

//Get list of products
app.get("/products", (req, res)=>{
    res.json(products)
    res.status(200).json(products);
});

//Get user's purchase
app.get("/purchases/:userId", (req, res)=>{
    const userId = parseInt(req.params.userId);
    for(let i=0; i<accounts.length; i++){
        let currentUser = accounts[i];
        if(currentUser.id == userId){
            return res.status(200).json(currentUser.purchases)
        }
    }
});

//Purchase items
app.post("/purchase", (req, res)=>{
    const userId = req.body.userId
    const itemId = req.body.itemId
    for(let i=0; i<accounts.length; i++){
        let currentUser = accounts[i];
        if(currentUser.id == userId){
            for(let j=0; j<products.length; j++){
                let currentProduct = products[j];
                if(currentProduct.id == itemId){
                    if (currentUser.balance < currentProduct.price) {
                        return res.status(301).send("insufficient funds")
                    } else {
                        currentUser.purchases.push(currentProduct);
                        return res.status(201).send("succeful purchase"); 
                    }  
                }
            }
        }
    }
    return res.status(404).send("user or product not found")
})

app.listen(8080);