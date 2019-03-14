const Express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const auth = require("./auth");
const app = Express();



app.set('view engine', 'ejs');




app.use(auth);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());




const mongoose = require('mongoose');
mongoose.connect("mongodb://du.nm165913:du20091998@ds213896.mlab.com:13896/thionline",
    { useNewUrlParser: true }).then((res)=>{
        // console.log(res)
    }).catch(err => {
        console.log(err)
    });



const api = require('./router/api');
app.use('/api', api);





app.listen(process.env.PORT || 8000);

