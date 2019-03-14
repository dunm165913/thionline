const bcrypt = require('bcrypt-nodejs');
let User = require('../models/user');
let Question=require('../models/question')
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

function xoadau(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");


    return str;
}




//1
router.route('/login').post((req, res) => {
    User.findOne({
        phone: req.body.phone
    }, (err, ok) => {
        if (err) res.json({ code: 1005, message: "Unknow err" });
        if (ok) {
            if (bcrypt.compareSync(req.body.pass, ok.pass)) {
                // console.log(ok);
                const token = jwt.sign({
                    // them 1 so truong khi deploy
                    phone: req.body.phone,

                },
                    "webserver",
                    {
                        expiresIn: '100h',
                    });
                console.log("---" + token);
                return res.status(201).json({
                    code: '1000',
                    message: 'OK',
                    data: token,
                    name:ok.name,
                });
            }
        }
        if (!ok) {
            res.json({
                code: 9994,
                message: "No data"
            })
        }
    })
});
//2
router.route('/signup').post((req, res) => {
    User.findOne({
        email: req.body.email
    }, (err, ok) => {
        if (err) res.json({ code: 1005, message: "Unknow err" });
        if (ok) {
            res.json({
                code: 9996,
                message: "User existed"
            })
        }
        if (!ok) {
            let user = new User();
            user.email = req.body.email;
            user.pass = bcrypt.hashSync(req.body.pass);
            user.time = new Date();
            user.avate = "https://images-na.ssl-images-amazon.com/images/I/51%2BJZUHDnPL.jpg"
            user.save((err) => {
                if (err) res.json({ code: 1005, message: "Unknow err" })
                res.json({
                    code: 1000,
                    message: "ok"
                })
            })
        }
    })

})
//3
router.route("/question").post((req,res)=>{
    let rs=  Question.find({
    }
    ).limit(10).select('question answer').
    then(ok=>{
        console.log(ok)
        res.json({
            data:ok
        })
    })

    // console.log(rs)
})
router.route('/create_question').post((req,res)=>{
    console.log(req.body)
    let que= new Question();
    que.question=req.body.question;
    que.correct_answer=req.body.correct_answer;
    que.answer=req.body.answer;
    que.create_at=new Date();
    que.subject=req.body.subject;
    console.log(que)
    que.save((err)=>{
        console.log(err);
        res.json({
            message:"ok"
        })
    });
 
    
})
module.exports = router;