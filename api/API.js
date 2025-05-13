require("dotenv").config()
const express = require("express");
const session = require("express-session")
const {json, urlencoded} = require("express");
const jwt = require("jsonwebtoken")
const bcrypt = require ("bcrypt");
const cors = require("cors")
const path = require("path");

const app = express();
app.use(json());

const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';

const client = new MongoClient(url);

app.use(json());
app.use(urlencoded({ extended: true }));

app.use(cors({ origin: 'http://localhost:3000' }));

const protectionRoute = (req, res, next) => {
    const token = req.query.token;
    if (token) {
        jwt.verify(token, `process.env.TOKEN_KEY`, (err, account) =>{
            if (err) {
                return res.redirect("http://localhost:3000/login")
            }
            next()
        })
    } else {
        return res.redirect("http://localhost:3000/login")
    }
}

app.use((req, res, next) => {
    const { token } = req.query;
    if (token) {
        console.log("token valid")
        jwt.verify(token, `process.env.TOKEN_KEY`, (err, account) => {
            if (!err) {
                const database = client.db('db-cart');
                const collection = database.collection('Cart_Items Collection');
        
                const result = collection.find({}).toArray();

                account.token = token;
                account.cart = result.find(cart => cart.user_id === account._id)
                res.locals.account = account;
            }
        });
    }
    console.log("no token")
    next();
});

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

app.use(express.static(path.join(__dirname, "public")))



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

//Get Carts
async function getCarts() {
    try {
        connectToDB()
        
        const database = client.db('db-cart');
        const collection = database.collection('Cart_Items Collection');

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

        const carts = await getCarts();

        const newCart = {
            _id: carts.length + 1,
            user_id: user._id,
            items: []
        }
        
        await importCarts(newCart)

        console.log('Données importées avec succès');
    } catch (err) {
        console.error('Erreur lors de l\'importation des données:', err);
    } finally {
        await client.close();
    }
}

// Import carts
async function importCarts(cart) {
    try {
        const database = client.db('db-cart');
        const collection = database.collection('Cart_Items Collection');

        await collection.insertOne(cart);

        console.log('Données importées avec succès');
    } catch (err) {
        console.error('Erreur lors de l\'importation des données:', err);
    }
}

//Login user
async function loginUser(req, res, user) {
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
                        res.redirect("/api/login");
                    }
                    if (result) {
                        const token = jwt.sign({id: user._id,email:user.email,name:user.name},`process.env.TOKEN_KEY`)
                        user.token = token;
                        console.log('Le mot de passe correspond.');
                        res.redirect(`http://localhost:3000`)
                    } else {
                        console.log('Le mot de passe ne correspond pas.');
                        res.redirect("http://localhost:3000/login")
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

        res.redirect("http://localhost:3000/login");
    } catch (err) {
        console.error('Erreur lors du hachage du mot de passe :', err);
        res.redirect("http://localhost:3000/register")
    }
})

//Login user
app.post("/api/login", (req, res)=>{
    loginUser(req, res, req.body)
})

//Logout user
app.post("/api/logout", (req, res)=>{
    logoutUser(req)
    res.redirect("http://localhost:3000/")
})

//Logged user
app.get("/api/logged", (req, res)=>{
    const { account } = res.locals;
    console.log(JSON.stringify(account));
    console.log("logged")

    res.send(account)
})


//Cart API

app.get("/api/viewCart", protectionRoute, async (req, res)=>{
    try {
        const { cart } = res.locals
        res.send(cart) 
    } catch (err) {
        console.error("Erreur lors de l'afficahge du panier :", err)
    }
})

//Add item
app.post("/api/addItem", protectionRoute, async (req, res)=>{
    try {
        connectToDB()

        const database = client.db('db-cart');
        const collection = database.collection('Cart_Items Collection');

        const localCart = res.locals.cart;

        const newItem = {
            name: req.body.name,
            price: req.body.price
        };

        localCart.push(newItem)
        await collection.updateOne(
            { _id: localCart._id },
            { $push: { items: newItem } }
        );

        res.redirect("http://localhost:3000/login");
    } catch (err) {
        console.error("Erreur lors de l'ajout au panier :", err);
        res.redirect("http://localhost:3000/register")
    } finally {
        await client.close()
    }
})

app.post("/api/editCart", protectionRoute, async (req, res)=>{
    try {
        connectToDB()

        const database = client.db('db-cart');
        const collection = database.collection('Cart_Items Collection');

        const localCart = res.locals.cart;

        //Duplicate item
        if (req.body.option === "duplicate"){
            for (let i=1; i<req.body.number-1;i++){
                const dupItem = {
                    name: req.body.name,
                    price: req.body.price
                }
                localCart.push(dupItem)
                await collection.updateOne(
                    { _id: localCart._id },
                    { $push: { items: dupItem } }
                );
            }
        }

        //Reduce item
        if (req.body.option === "reduce"){
            for (let i=1; i<req.body.number-1;i++){
                const redItem = {
                    name: req.body.name,
                    price: req.body.price
                }
                const index = localCart.findIndex(item => item.name === redItem.name && item.price === redItem.price);
                if (index !== -1) {
                    localCart.splice(index, 1);
                }
                await collection.updateOne(
                    { _id: localCart._id },
                    { $pull: { items: redItem } }
                );
            }
        }
    } catch (err) {
        console.error("Erreur lors de la modification du panier :", err);
    } finally {
        await client.close()
    }
})

//Remove item
app.post("/api/removeItem", protectionRoute, async (req, res) => {
    try {
        connectToDB();

        const database = client.db('db-cart');
        const collection = database.collection('Cart_Items Collection');

        const localCart = res.locals.cart;

        const removedItem = {
            name: req.body.name,
            price: req.body.price
        };

        const index = localCart.findIndex(item => item.name === removedItem.name && item.price === removedItem.price);
        if (index !== -1) {
            localCart.splice(index, 1);
        }

        await collection.updateOne(
            { _id: localCart._id },
            { $pull: { items: removedItem } }
        );

        res.redirect("http://localhost:3000/login");
    } catch (err) {
        console.error('Erreur lors de la suppression de l\'élément du panier :', err);
        res.redirect("http://localhost:3000/register");
    } finally {
        await client.close()
    }
});

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
