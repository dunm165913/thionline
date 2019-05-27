const bcrypt = require('bcrypt-nodejs');
let User = require('../models/user');
let Question = require('../models/question')
let Exam = require('../models/exam')
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

let exam = {};


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

function select_question(level, size) {
    Question.aggregate([
        { $match: { level: level.toString() } },
        { $sample: { size: parseInt(size) } }
    ]).exec((err, ok) => {

        return ok
    })
}


//1
router.route('/login').post((req, res) => {
    console.log(req.body)
    User.findOne({
        email: req.body.email
    }, (err, ok) => {
        if (err) res.json({ code: 9991, message: "loi", data: [] })
        if (ok) {
            if (bcrypt.compareSync(req.body.pass, ok.pass)) {
                // console.log(ok);
                const token = jwt.sign({
                    // them 1 so truong khi deploy
                    email: req.body.email,

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
                    name: ok.name,
                });
            }
            else {
                res.json({
                    code: 9994,
                    message: "No data",
                    data: "",
                    name: ""
                })
            }
        }
        if (!ok) {
            res.json({
                code: 9994,
                message: "No data",
                data: "",
                name: ""
            })
        }
    })
});
//2
router.route('/signup').post((req, res) => {
    User.findOne({
        email: req.body.email
    }, (err, ok) => {
        if (err) res.json({ code: 9991, message: "loi", data: [] })
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
                if (err) res.json({ code: 9991, message: "loi", data: [] })
                res.json({
                    code: 1000,
                    message: "ok"
                })
            })
        }
    })

})
//3 create size question level 
router.route("/get_question").post((req, res) => {

    console.log(req.body)
        Question.aggregate([
            {
                $match: {
                    level: req.body.level?req.body.level:"1",
                    class: req.body.class ? req.body.class : "12",
                    subject: req.body.subject ? req.body.subject : "Toan"
                }
            }, // filter the results
            { $sample: { size: parseInt(req.body.size)?parseInt(req.body.size):1 } } // You want to get 5 docs
        ]).exec((err, ok) => {
            if (err) res.json({ code: 9991, message: "loi", data: [] })
            console.log(ok);
            res.json({
                code: 1000,
                message: "ok",
                data: ok
            })
        }); 
})


router.route('/create_question').post((req, res) => {
    console.log(req.body)
    if (req.body.question.length>0 && req.body.correct_answer.length>0 && req.body.answer.length==3 && req.body.subject && req.body.level) {
        let que = new Question();
        let a = req.body.answer
if(req.body.image.length>10){
    que.url=req.body.image
}
        que.question = req.body.question;
        que.correct_answer = req.body.correct_answer;
        que.answer=req.body.answer,
        que.class=req.body.classes
        que.subject = req.body.subject;
        que.level = req.body.level;
        que.create_at = new Date();
       
        console.log(que)
        que.save((err) => {
            console.log(err);
            res.json({
                message: "ok"
            })
        });

    } else {
        res.json({
            code: 9999,
            message: "Co loi",
            data: []
        })
    }
})
//4 tao de thi tu do
router.route('/created_exam_fee').post((req, res) => {
    // console.log(req.userData)
    if (!req.userData) {
        res.json({
            code: 9999,
            message: "loi",
            data: {}
        })
    } else {
        //get 30 questions level 1
        Question.aggregate([
            { $match: { level: '1' } },
            { $sample: { size: 1 } }
        ]).exec((err, ok) => {
            console.log(0)
            if (err) res.json({ code: 9991, message: "loi", data: [] })
            Question.aggregate([
                { $match: { level: '2' } },
                { $sample: { size: 2 } }
            ]).exec((err, ok1) => {
                console.log(1)
                if (err) res.json({ code: 9991, message: "loi", data: [] })
                Question.aggregate([
                    { $match: { level: '3' } },
                    { $sample: { size: 1 } }
                ]).exec((err, ok2) => {
                    if (err) res.json({ code: 9991, message: "loi", data: [] })
                    ok1.map(x => ok.push(x))
                    ok2.map(x => ok.push(x))
                    console.log(2)
                    exam.ex1 = {
                        data: ok,
                        create_at: new Date(),
                        handle: setTimeout(() => {
                            exam.ex1.data = []
                            //cancel by system

                        }, 10000),
                        hand: setTimeout(() => { exam.ex1 = undefined }, 20000)
                    }
                    console.log(exam)
                    res.json({
                        code: 1000,
                        message: "ok",
                        data: ok
                    })
                })
            })
        })
    }
})


router.route('/check_question').post((req, res) => {
    if(!req.body.answer) req.body.answer="A :___________________________________"
    let a = req.body.answer
    a = a.split(' :')
    Question.findOne({
        _id: req.body.id_question,
        correct_answer: a[1]
    }, ((err, ok) => {
        if (err) throw err;

        console.log(a)
        if (ok) res.json({
            code: 1000,
            message: "Chinh Xac"
        })
        else res.json({
            code: 1000,
            message: "Oh!! Ban chua chinh xac"
        })
    }))
})
router.route('/test').post((req, res) => {
    console.log(exam)
    res.json({})
})

router.route('/check_result').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9999,
            message: "ko xac thuc dc"
        })
    }
    else {
        if (req.body.id_exam.match(/^[0-9a-fA-F]{24}$/))
            Exam.find({
                _id: req.body.id_exam
            }).select('correct_answer').exec((err, ok) => {
                if (err) throw err;
                let resu = 0;
                if (ok.length == 1) {
                    for (let i = 0; i < 50; i++) {

                        try {

                            if (req.body.result[i].answer.split(" :")[1] == ok[0].correct_answer[i].correct_answer) resu++
                        }
                        catch (err) {

                        }
                    }
                    res.json({
                        code: 1000,
                        message: resu + "/50"
                    })
                } else {
                    res.json({
                        code: 9999,
                        message: "Loi tham so"
                    })
                }

            })
        else {
            res.json({
                code: 9999,
                message: "Loi tham so"
            })
        }
    }
})

router.route('/check_code_exam').post((req, res) => {
    if (!req.userData) res.json({
        code: 9999,
        message: "loi  xac thuc"
    })
    else {
        if (req.body.code.match(/^[0-9a-fA-F]{24}$/))
            Exam.find({
                _id: req.body.code
            }).select('questions').exec((err, re) => {
                if (err) throw err;
                if (re.length == 1) res.json({
                    code: 1000,
                    message: "ok",
                    data: re
                })
                else res.json({
                    code: 9999,
                    message: "loi tham so"
                })
            })
        else res.json({
            code: 9999,
            message: "loi tham so code"
        })



    }
})
module.exports = router;