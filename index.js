const express = require("express");
const app = express();
require("dotenv").config();
const axios = require("axios");
const cookie = require("cookie");
const nonce = require("nonce");
const crypto = require("crypto");

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_SECRET_KEY;
const ngrokAddress = "https://ba02-27-34-108-98.ngrok.io";
const scopes = "write_products";

app.get("/shopify", (req,res)=>{
    const shop = req.query.shop;
    if(shop){
        const state = nonce();
        const redirect = ngrokAddress+"/shopify/callback";
        const installUrl = 'https://'+shop+'/admin/oauth/authorize?client_id='+apiKey+"&scope="+scopes+"&state="+state+"&redirect_uri="+redirect;

        res.cookie('state', state);
        res.redirect(installUrl);
    }else{
        return res.status(400).send("shop missing")
    }
    res.send("Hello World");
});

app.listen(3000, ()=>{
    console.log("Connected to 3000");
})