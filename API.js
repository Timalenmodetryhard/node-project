const express = require("express");
const {json} = require("express");
const app = express();
app.use(json());

//Account API

const accounts = []

//Get user information
app.get("/account/:userId", (req, res)=>{
    const userId = parseInt(req.params.userId);
    res.json(accounts[userId-1])
    res.status(200).json(accounts);
});

//Create user
app.post("/register", (req, res)=>{
    const newAccount = {
        id: accounts.length+1,
        name: req.body.name,
        balance: req.body.balance,
        purchases: []
    };
    accounts.push(newAccount);
    res.status(201).json(newAccount);
})

//Delete user
app.delete("/account/:userId", (req, res)=>{
    const userId = parseInt(req.params.userId);
    for(let i=0; i<accounts.length; i++){
        let currentUser = accounts[i];
        if(currentUser.id == userId){
            accounts.pop(currentUser)
        }
    }
    res.status(200).json(accounts);
})

//Update user balance
app.put('/account/update', (req, res) => {
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