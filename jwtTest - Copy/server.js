const Express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const auth = require("./auth");
const app = Express();



app.set('view engine','ejs');




app.use(auth);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get("/",(req,res)=>{
    res.render('home');
    // res.sendFile(__dirname+"/index.html");
});
app.get('/user/login',(req,res)=>{
    res.sendFile(__dirname+"/views/login.html");
})



const mongoose=require('mongoose');
mongoose.connect("mongodb://du.nm165913:du20091998@ds115753.mlab.com:15753/tmdt",{ useNewUrlParser: true } );



const api=require('./router/api');
app.use('/api',api);





app.listen(process.env.PORT || 8000);

