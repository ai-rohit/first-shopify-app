const express = require("express");
const app = express();
require("dotenv").config();
const axios = require("axios");
const cookie = require("cookie");
const nonce = require("nonce");
const crypto = require("crypto");
const url = require("url");
const { verifyHMAC } = require("./helpers/verifyhmac");

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_SECRET_KEY;
const ngrokAddress = "https://0a41-27-34-108-114.ngrok.io";
const scopes = "write_products";

app.get("/shopify", (req,res)=>{
    const shop = req.query.shop;
    if(shop){
        const state = nonce();
        const redirect = ngrokAddress+"/shopify/callback";
        const installUrl = 'https://'+shop+'/admin/oauth/authorize?client_id='+apiKey+"&scope="+scopes+"&state="+state+"&redirect_uri="+redirect;
        console.log(state);
        res.cookie('state', state);
        res.redirect(installUrl);
    }else{
        return res.status(400).send("shop missing")
    }
    // res.send("Hello World");
});

app.get("/shopify/callback", async (req, res)=>{
    let securityPass = false;
    const {shop, code, hmac} = req.query;
    // console.log(req.query);
    // console.log(shop, code);
    const regex =  /^[a-z\d_.-]+[.]myshopify[.]com$/;
    if(!shop.match(regex)){
        return res.send("Invalid shop name")
    }
    let urlObj = url.parse(req.url);
    let query = urlObj.search.slice(1);
    if(verifyHMAC(query)){
        let accesstokenURL = 'https://' + shop + '/admin/oauth/access_token';
        let accessPayload = {
            client_id: apiKey,
            client_secret: apiSecret,
            code
        }
        try{
            const respose = await axios.post(accesstokenURL, accessPayload);
            return res.redirect('/shopify/app?shop='+shop+"&access_token="+respose.data.access_token);
        }catch(error){
            console.log("axios error", error);
        }
        
    }
});

app.get("/shopify/app", async (req, res)=>{
    try{
        
        const access_token = req.query.access_token;
        console.log("\n\n access token", access_token);
        const shopData = await axios.get('https://'+req.query.shop+'/admin/shop.json',{headers:{"X-Shopify-Access-Token":access_token}});
        res.send(shopData.data);
    }catch(error){
        console.log("axios error***", error);
    }
})
app.listen(3000, ()=>{
    console.log("Connected to 3000");
})