const bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var Product = require('../models/product');
var Order = require('../models/order');
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
                    data:token
                });
            }
        }
        if(!ok){
            res.json({
                code:9994,
                message:"No data"
            })
        }
    })
});
//2
router.route('/singup').post((req, res) => {
    User.findOne({
        phone: req.body.phone
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
            user.phone = req.user.phone;
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
router.route('/sms_verify').post((req, res) => {
    User.findOne({
        phone: req.body.phone,
        code_verify: req.body.code_verify
    }, (err, ok) => {
        if (err) res.json({ code: 1005, message: "Unknow err" });
        console.log(ok);
        if (ok) res.json({
            code: 1000,
            message: "ok",
            data: ok
        })
        else res.json({
            code: 9993,
            message: "code verfity is incorrect.",
            data: []
        })
    })
})
//4
router.route('/resend_sms_verify').post((req, res) => {
    User.findOne({
        phone: req.body.phone
    }, (err, ok) => {
        if (err) res.json({ code: 1005, message: "Unknow err" })
        if (!ok) {
            res.json({
                code: 9994,
                message: "No data or end of list data"
            })
        }
        if (ok) {
            let a = 0;
            while (true) {
                a = Math.random() * 1000000;
                a = a - a % 1.0;
                if (a > 100000 && a < 999999) break;
            }
            User.updateOne({
                phone: req.body.phone
            }, {
                    code_verify: a
                }, (err, ok) => {
                    if (err) res.json({ code: 1005, message: "Unknow err" })
                    else res.json({
                        code: 1000,
                        message: "ok"
                    })
                })
        }
    })
});
//5
router.route('/logout').post((req, res) => {
    console.log(req.userData);
    if (!req.userData) {
        res.json({
            code: 9998,
            message: "Token is in validated"
        })
    }
    else {
        res.json({
            code: 1000,
            message: "ok"
        })
    }
})
//6
router.route('/create_code_reset_password').post((req, res) => {
    User.findOne({
        phone: req.body.phone
    }, (err, ok) => {
        if (err) res.json({ code: 1005, message: "Unknow err" });
        if (ok) {
            let a = 0;
            while (true) {
                a = Math.random() * 1000000;
                a = a - a % 1.0;
                if (a > 100000 && a < 999999) break;
            }
            User.updateOne({
                phone: req.body.phone
            }, {
                    code_reset_pass: a
                }, (err, result) => {
                    if (err) res.json({ code: 1005, message: "Unknow err" });
                    else {
                        res.json({
                            code: 1000,
                            message: "ok"
                        })
                    }
                })
        }
        else res.json({
            code: 9994,
            message: "No data"
        })
    })
});
//7 get all product of catergory
router.route('/get_category').post((req, res) => {
    Product.find({
        categories: req.body.category_id
    }, (err, ok) => {
        if (err) throw err;

        let rs = [];
        let count = req.body.count;
        let index = ok.length - req.body.index - 1;
        for (let i = ok.length - 1; i >= 0; i--) {
            if (index == i) {
                for (let j = i; j >= 0; j--) {
                    rs.push(ok[j]);
                    count--;
                    if (count == 0) break;
                }
            }
            break;
        }
        res.json({
            code: 1000,
            message: "ok",
            data: rs
        })
    })
})
//8
router.route('/check_code_reset_password').post((req, res) => {
    User.findOne({
        phone: req.body.phone
    }, (err, ok) => {
        if (err) res.json({ code: 1005, message: "Unknow err" });
        if (ok) {
            if (ok.code_reset_pass == req.body.reset_code) {
                res.json({
                    code: 1000,
                    message: "ok"
                })
            }
            else {
                res.json({
                    code: 9993,
                    message: "Code is incorrcet"
                })
            }
        }
        if (!ok) {
            res.json({
                code: 9993,
                message: " No data or phone is incorrcet"
            })
        }
    })
});
//9
router.route('/reset_password').post((req, res) => {
    User.findOne({
        phone: req.body.phone
    }, (err, ok) => {
        if (err) res.json({ code: 1005, message: "Unknow err" });
        if (ok) {
            if (req.body.password.length >= 6) {
                User.updateOne({
                    phone: req.body.phone
                }, {
                        pass: bcrypt.hashSync(req.body.password)
                    }, (err, ok1) => {
                        if (err) res.json({ code: 1005, message: "Unknow err" });
                        else {
                            res.json({
                                code: 1000,
                                message: "ok",
                                data: ok
                            })
                        }
                    })
            }
        }
        if (!ok) {
            res.json({
                code: 9994,
                message: "No data"
            })
        }
    })
})
//10
router.route('/get_list_product').post((req, res) => {
    if (req.body.category_id.length > 0 && req.body.brand.length > 0) {
        Product.find({
            categories: req.body.category_id,
            brand: xoadau(req.body.brand)
        }, (err, ok) => {
            if (err) throw err;

            let rs = [];
            let count = req.body.count;
            let index = ok.length - req.body.index - 1;
            for (let i = ok.length - 1; i >= 0; i--) {
                if (index == i) {
                    for (let j = i; j >= 0; j--) {
                        rs.push(ok[j]);
                        count--;
                        if (count == 0) break;
                    }
                }
                break;
            }
            res.json({
                code: 1000,
                message: "ok",
                data: rs
            })
        })
    }
})
//11
router.route('/get_product').post((req, res) => {
    Product.findOne({
        id: req.body.id
    }, (err, ok) => {
        if (err) res.json({ code: 1005, message: "Unknow err" });
        if (ok) res.json({
            code: 1000,
            message: "ok",
            data: ok
        })
        else {
            res.json({
                code: 9994,
                message: "No Data",
                data: []
            })
        }
    })
})
//12
router.route('/add_products').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9998,
            message: "Token is validated"
        })
    }
    else {
        Product.find({}, (err, ok) => {
            if (err) res.json({ code: 1005, message: "Unknow err" })
            let product = new Product();
            product.name = req.body.name;
            product.price = req.body.price;
            product.categories = req.body.category;
            product.described = req.body.described;
            product.brand = req.body.brand.length > 0 ? req.body.brand : "OEM";
            product.state = req.body.state;
            product.id_owner = req.body.id_owner;
            product.id = ok.length+1;
            product.img = req.body.img;
            product.time_creat = new Date();
            product.save((err) => {
                if (err) res.json({ code: 1005, message: "Unknow err" });
                res.json({
                    code: 1000,
                    message: "ok",
                    data: {
                        id: product.id,
                        url: "/getproduct/" + product.id
                    }
                })
            })
        })
    }
});
//13
router.route('/edit_products').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9998,
            message: "Token is validated"
        })
    }
    else {

    }
})
//14
router.route('/del_products').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9998,
            message: "Token is validated"
        })
    }
    else {
        if (req.body.id != undefined && req.body.id.length > 0) {
            console.log(req.body.id)
            Product.findOneAndDelete({
                id: req.body.id
            }, (err, ok) => {
                if (err) res.json({ code: 1005, message: "Unknow err" });
                res.json({
                    code: 1000,
                    message: "ok"
                })
            })
        } else {
            res.json({
                code: 9992,
                message: "thieu"
            })
        }
    }
})
//15
router.route('/get_comment_products').post((req, res) => {
    Product.findOne({
        id: req.body.id
    }, (err, ok) => {
        if (err) res.json({ code: 1005, message: "Unknow err" });
        if (ok) {
            // console.log(ok[0].comment[1].id);
            console.log(ok.comment.length);
            let rs = []; let count = req.body.count;
            for (let i = ok.comment.length - 1; i >= 0; i--) {

                if (ok.comment[i].idcomment == req.body.index) {
                    for (let j = i - 1; j >= 0; j--) {
                        console.log(ok.comment[j].idcomment)
                        rs.push(ok.comment[j]);
                        count--;
                        if (count <= 0) break
                    }
                    break;

                }
            }
            res.json({
                code: 1000,
                message: "ok",
                data: rs
            })

        }
        if (!ok) {
            res.json({
                code: 9994,
                message: "No data"
            })
        }
    })
});
//16
router.route('/set_comment_products').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9998,
            message: "Token is validated"
        })
    }
    else {
        Product.findOne({
            id: req.body.parent_id
        }, (err, ok) => {
            if (err) res.json({ code: 1005, message: "Unknow err" });
            if (!ok) {
                res.json({
                    code: 9992,
                    message: "Product is not existed"
                })
            }
            else {
                User.findOne({
                    phone: req.userData.phone
                }, (err, ok1) => {
                    if (err) res.json({ code: 1005, message: "Unknow err" });
                    if (!ok1) {
                        res.json({
                            code: 9995,
                            message: "user is not validated"
                        })
                    }
                    if (ok1) {
                        let a = ok.comment.length.toString();
                        console.log(ok.comment)
                        Product.update({
                            id: req.body.parent_id
                        }, {
                                $push: {
                                    comment: {
                                        poster: [ok1.name, ok1._id, ok1.avata],
                                        comment: req.body.comment,
                                        answer: "",
                                        idcomment: a
                                    }
                                }

                            }, (err, oki) => {
                                if (err) res.json({ code: 1005, message: "Unknow err" });
                                Product.findOne({
                                    id: req.body.parent_id
                                }, (err, q) => {
                                    let count = req.body.count; let rs = [];
                                    for (let i = q.comment.length - 1; i >= 0; i--) {
                                        rs.push(q.comment[i]);
                                        count--;
                                        if (count <= 0) break;


                                    }
                                    res.json({
                                        code: 1000,
                                        message: "ok",
                                        data: rs
                                    })
                                })

                            })
                    }
                })
            }
        })
    }
})
//17
router.route('/report_products').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9998,
            message: "Token is not validated"
        })
    }
    else {
        User.findOne({
            phone: req.userData.phone
        }, (err, ok) => {
            if (err) res.json({ code: 1005, message: "Unknow err" });
            if (!ok) {
                res.json({
                    code: 9994,
                    message: "NO users found"
                })
            }
            if (ok) {
                Product.updateOne({
                    id: req.body.product_id
                }, {
                        $push: {
                            report: {

                                poster: [{
                                    name: ok.name,
                                    phone: ok.phone,
                                    email: ok.email
                                }],
                                subject: req.body.subject,
                                details: req.body.details,
                            }
                        }
                    }, (err, oki) => {
                        if (err) res.json({ code: 1005, message: "Unknow err" });
                        res.json({
                            code: 1000,
                            message: "Da report thanh cong"
                        })
                    })
            }
        })
    }
})
//18
router.route('/like_products').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9998,
            message: "Token is not valitared"
        })
    }
    else {
        Product.findOne({
            id: req.body.id
        }, (err, ok) => {

            if (!ok) {
                res.json({
                    code: 9994,
                    message: "No products found"
                })
            }
            else {
                let dem = 0;
                if (ok.like != null) {
                    for (let i = 0; i < ok.like.length; i++) {
                        if (ok.like[i].phone == req.userData.phone) {
                            dem++;
                            break;
                        }
                    }
                }
                else dem = 0;

                for (let j = 0; j < ok.dislike.length; j++) {
                    if (ok.dislike[j].phone == req.userData.phone) {
                        dem++; break;
                    }
                }
                if (dem > 0) {
                    res.json({
                        code: 1005,
                        message: "UnKnow, or you liked"
                    });
                }
                else {

                    User.updateOne({
                        phone: req.userData.phone
                    }, {
                            $push: {
                                like: {
                                    id_product: ok.id
                                }
                            }
                        }, (err, oky) => {
                            if (err) throw err;
                            console.log(oky.nModified)
                        })
                    Product.updateOne({
                        id: req.body.id
                    }, {
                            $push: {
                                like: {
                                    phone: req.userData.phone

                                }
                            }
                        }, (err, oki) => {
                            if (err) throw err

                            else res.json({
                                code: 1000,
                                message: "ok"
                            })
                        })
                }
            }
        })
    }
});
//19
router.route('/unlike').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9994,
            message: "Token is not validated"
        })
    }
    else {
        Product.findOne({
            id: req.body.id
        }, (err, ok) => {
            if (err) res.json({ code: 1005, message: "Unknow err" });
            if (!ok) {
                res.json({
                    code: 9994,
                    message: "No data (No find product)"
                })
            }
            else {
                let dem = -1;
                let es;

                for (let i = 0; i < ok.like.length; i++) {

                    if (ok.like[i].phone == req.userData.phone) {
                        dem = i;
                        console.log("-------" + ok.like);
                        //   es=ok.like.splice(i,1);   
                        console.log(ok.like.splice(i, 1));
                        break;
                    }
                    console.log("2");
                }
                if (dem >= 0) {

                    User.findOne({
                        phone: req.userData.phone
                    }, (err, oku) => {
                        if (err) throw err;
                        if (oku) {
                            let dem1 = -1;
                            for (let i = 0; i < oku.like.length; i++) {
                                if (oku.like[i].id_product == req.body.id) {
                                    dem1 = i;
                                    console.log(oku.like);
                                    oku.like.splice(dem1, 1);
                                    console.log(oku.like);
                                    break;
                                }
                            }
                            User.updateOne({
                                phone: req.userData.phone
                            }, {
                                    $set: {
                                        like: oku.like
                                    }
                                }, (err, h) => {
                                    if (err) throw err;
                                    console.log("-----" + h.nModified);
                                })
                        }
                    })


                    Product.updateOne({
                        id: req.body.id
                    }, {
                            $set: {
                                like: ok.like
                            }
                        }, (err, okd) => {
                            if (err) res.json({ code: 1005, message: "Unknow err" });
                            res.json({
                                code: 1000,
                                message: "ok"
                            })
                        })

                }
                else {
                    res.json({
                        code: 1005,
                        message: "Unknow or you dont like product"
                    })
                }
            }
        })
    }


});
router.route('/dislike_products').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9994,
            message: "Token is validated"
        })
    } else {
        Product.findOne({
            id: req.body.id
        }, (err, ok) => {
            if (err) throw err;
            if (ok) {
                let g1 = -1;
                let g2 = -1;
                for (let i = 0; i < ok.dislike.length; i++) {
                    if (ok.dislike[i].phone == req.userData.phone) {
                        g1++;
                        break;
                    }
                }
                for (let i = 0; i < ok.like.length; i++) {
                    if (ok.like[i].phone == req.userData.phone) {
                        g2++;
                        break;
                    }
                }
                if (g1 > 0) {
                    res.json({
                        code: 1005,
                        message: "UnKnow, or you liked"
                    })
                }
                else {
                    User.updateOne({
                        phone: req.userData.phone
                    }, {
                            $push: {
                                dislike: {
                                    id_product: req.body.id
                                }
                            }
                        }, (err, okf) => {
                            if (err) throw err;
                        });
                    Product.updateOne({
                        id: req.body.id
                    }, {
                            $push: {
                                dislike: {
                                    phone: req.userData.phone
                                }
                            }
                        }, (err, ok) => {
                            if (err) throw err
                            res.json({
                                code: 1000,
                                message: "ok"
                            })
                        })
                }
            }
        })
    }
})
router.route('/undislike').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9994,
            message: "Token is not validated"
        })
    }
    else {
        Product.findOne({
            id: req.body.id
        }, (err, ok) => {
            if (err) res.json({ code: 1005, message: "Unknow err" });
            if (!ok) {
                res.json({
                    code: 9994,
                    message: "No data (No find product)"
                })
            }
            else {
                let dem = -1;
                let es;

                for (let i = 0; i < ok.dislike.length; i++) {

                    if (ok.dislike[i].phone == req.userData.phone) {
                        dem = i;
                        console.log("-------" + ok.dislike);
                        //   es=ok.like.splice(i,1);   
                        console.log(ok.dislike.splice(i, 1));
                        break;
                    }
                    console.log("2");
                }
                if (dem >= 0) {

                    User.findOne({
                        phone: req.userData.phone
                    }, (err, oku) => {
                        if (err) throw err;
                        if (oku) {
                            let dem1 = -1;
                            for (let i = 0; i < oku.dislike.length; i++) {
                                if (oku.dislike[i].id_product == req.body.id) {
                                    dem1 = i;
                                    console.log(oku.dislike);
                                    oku.dislike.splice(dem1, 1);
                                    console.log(oku.dislike);
                                    break;
                                }
                            }
                            User.updateOne({
                                phone: req.userData.phone
                            }, {
                                    $set: {
                                        dislike: oku.dislike
                                    }
                                }, (err, h) => {
                                    if (err) throw err;
                                    console.log("-----" + h.nModified);
                                })
                        }
                    })


                    Product.updateOne({
                        id: req.body.id
                    }, {
                            $set: {
                                dislike: ok.dislike
                            }
                        }, (err, okd) => {
                            if (err) res.json({ code: 1005, message: "Unknow err" });
                            res.json({
                                code: 1000,
                                message: "ok"
                            })
                        })

                }
                else {
                    res.json({
                        code: 1005,
                        message: "Unknow or you dont like product"
                    })
                }
            }
        })
    }
})
//20
router.route('/search').post((req, res) => {
    let a = req.body.name;
    console.log(req.body);
    Product.find((err, result) => {
        if (err) res.json({ code: 1005, message: "Unknow err" });
        a = xoadau(a);
        let kq = [];
        a = a.split(" ");
        for (let i = 0; i < result.length; i++) {
            let b = result[i].name;
            b = xoadau(b);
          
            b = b.split(" ");
            for (let e = 0; e < a.length; e++) {
                let num = 0;
                for (let r = 0; r < b.length; r++) {
                    if (a[e] == b[r]) num++;
                }
                if (num > 0) {
                    kq.push(result[i]);
                    e = a.length;
                }
            }
        }
        //xu ly ket qua.
        let rs = [];
        ; let count = req.body.count;
        for (let i = 0; i < kq.length; i++) {
            if (req.body.index == i) {
                for (let j = i; j < kq.length; j++) {
                    rs.push(kq[j]);
                    count--;
                    if (count == 0) break;
                }
                break;
            }

        }
        console.log(rs);
        res.json({
            code: 1000,
            message: "ok",
            data: rs
        })
    })
})
//21
router.route('/get_my_likes').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9994,
            message: "Token is not validated"
        })
    }
    else {
        User.findOne({
            phone: req.userData.phone
        }, (err, ok) => {
            if (err) res.json({ code: 1005, message: "Unknow err" });
            if (ok) {
                let rs = [];
                let count = req.body.count;
                console.log(ok.like.length)
                for (let i = 0; i < ok.like.length; i++) {
                    if (req.body.index == i) {
                        console.log(i)
                        for (let j = i + 1; j < ok.like.length; j++) {
                            console.log(ok.like[j]);
                            rs.push(ok.like[j]);
                            console.log(rs);
                            count--;
                            if (count == 0) break;
                        }
                        break;
                    }
                }
                res.json({
                    code: 1000,
                    message: "ok",
                    data: rs
                })
            }
        })
    }
})
//22
router.route('/get_user_listings').post((req, res) => {
    Product.find({
        id_onwer: req.body.user_id
    }, (err, ok) => {
        if (err) res.json({ code: 1005, message: "Unknow err" });
        if (!ok) {
            res.json({
                code: 9995,
                message: "No data"
            })
        }
        else {
            let rs = [];
            let count = req.body.count;
            for (let i = 0; i < ok.length; i++) {

                if (req.body.index == i) {
                    for (let j = i + 1; j < ok.length; j++) {
                        rs.push(ok[j]);
                        count--;
                        if (count == 0) break;
                    }
                    break;
                }
            }
            res.json({
                code: 1000,
                message: "ok",
                data: rs
            })
        }
    })
});
router.route('/get_user_info').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9994,
            message: "Token is not validated"
        })
    }
    else {
        User.findOne({
            phone: req.userData.phone
        }, (err, ok) => {
            if (err) res.json({ code: 1005, message: "Unknow err" });
            if (ok) {
                res.json({
                    code: 1000,
                    message: "ok",
                    data: ok
                })
            }
            if (!ok) {
                res.json({
                    code: 9995,
                    message: "No Data found"
                })
            }
        })
    }
})
//23
router.route('/set_user_info').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9998,
            message: "Token is in validated"
        })
    }
    else {
        User.findOne({
            phone: req.userData.phone
        }, (err, ok) => {
            if (err) res.json({ code: 1005, message: "Unknow err" });
            if (!ok) {
                res.json({
                    code: 9994,
                    message: "No data of user found"
                })
            }
            else {
                User.updateOne({
                    phone: req.userData.phone
                }, {
                        email: req.body.email > 0 ? req.body.email : ok.email,
                        name: req.body.name.length > 0 ? req.body.name.length : ok.name,
                        avata: req.body.avata.length > 0 ? req.body.avata : ok.avata,

                    })
            }
        })
    }
})
//24
router.route('/get_rates').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9998,
            message: "Token is in validated"
        })
    } else {
        User.findOne({
            phone: req.userData.phone
        }, (err, ok) => {
            if (err) res.json({ code: 1005, message: "Unknow err" });
            if (!ok) {
                res.json({
                    code: 1005,
                    message: "NO data user found"
                })
            }
            if (ok) {
                let rt = [];
                let count = req.body.count;
                if (req.body.level == 0) {
                    for (let i = 0; i < ok.rate.length; i++) {
                        if (req.body.index == i) {
                            for (let j = i + 1; j < ok.rate.length; j++) {
                                rt.push(ok.rate[j]);
                                count--;
                                if (count == 0) break;
                            }
                            break;
                        }
                    }
                }
                if (req.body.level == 1) {
                    let dem = 0, count = req.body.count;
                    for (let i = 0; i < ok.rate.length; i++) {

                        if (ok.rate[i].rate_level != 1) {
                            continue;
                        }
                        dem++;
                        if (dem = req.body.index) {
                            for (let j = i; j < ok.rate.length; j++) {
                                if (ok.rate[j].rate_level != 1) continue;
                                rt.push(ok.rate[j]);
                                count--;
                                if (count == 0) break;
                            }
                        }
                        break;
                    }
                }
                if (req.body.level == 2) {
                    let dem = 0, count = req.body.count;
                    for (let i = 0; i < ok.rate.length; i++) {

                        if (ok.rate[i].rate_level != 2) {
                            continue;
                        }
                        dem++;
                        if (dem = req.body.index) {
                            for (let j = i; j < ok.rate.length; j++) {
                                if (ok.rate[j].rate_level != 2) continue;
                                rt.push(ok.rate[j]);
                                count--;
                                if (count == 0) break;
                            }
                        }
                        break;
                    }
                }
                if (req.body.level == 3) {
                    let dem = 0, count = req.body.count;
                    for (let i = 0; i < ok.rate.length; i++) {

                        if (ok.rate[i].rate_level != 3) {
                            continue;
                        }
                        dem++;
                        if (dem = req.body.index) {
                            for (let j = i; j < ok.rate.length; j++) {
                                if (ok.rate[j].rate_level != 3) continue;
                                rt.push(ok.rate[j]);
                                count--;
                                if (count == 0) break;
                            }
                        }
                        break;
                    }
                }
                res.json({
                    code: 1000,
                    message: "ok",
                    data: rt
                })
            }
        })
    }

})
//25
router.route('/set_rates').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9998,
            message: "Token is not validated"
        })
    } else {
        Order.findOne({
            id_buy: req.userData.phone,
            id_product: req.body.product_id,
            rate: 0
        }, (err, ok) => {
            if (err) res.json({ code: 1005, message: "Unknow err" });
            if (ok) {
                Order.updateOne({
                    id_buy: req.userData.phone,
                    id_product: req.body.product_id,
                }, {
                        rate: 1
                    }, (err, oku) => {
                        if (err) res.json({ code: 1005, message: "Unknow err" });

                    });
                User.updateOne({
                    phone: req.userData.phone
                }, {
                        $push: {
                            rate: {
                                product_id: ok.id_product,
                                rate_level: req.body.rate_level,
                                content: req.body.content,
                                created: new Date()
                            }
                        }
                    }, (err, oky) => {
                        if (err) res.json({ code: 1005, message: "Unknow err" });
                    })

                Product.updateOne({
                    id: req.body.product_id
                }, {
                        $push: {
                            rate: {
                                username: req.body.phone,
                                level: req.body.rate_level,
                                content: req.body.content,
                                created: new Date()
                            }
                        }
                    }, (err, oki) => {
                        if (err) res.json({ code: 1005, message: "Unknow err" });
                        if (oki.nModified == 1) {
                            res.json({
                                code: 1000,
                                message: "ok"
                            })
                        }
                        else {
                            res.json({
                                code: 1005,
                                message: "Unknow err"
                            })
                        }

                    })
            }
            if (!ok) {
                res.json({
                    code: 1005,
                    message: "Unknow err or you rated"
                })
            }
        })
    }
})
//26
router.route('/get_list_blocks').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9998,
            message: "Token is noy validated"
        })
    } else {
        User.findOne({
            phone: req.userData.phone
        }, (err, ok) => {
            if (err) res.json({ code: 1005, message: "Unknow err" });
            if (ok) {
                let rs = [], count = req.body.count;
                for (let i = 0; i < ok.blocked.length; i++) {
                    // console.log(ok.blocked);
                    if (i == req.body.index) {
                        for (let j = i + 1; j < ok.blocked.length; j++) {
                            rs.push(ok.blocked[j]);
                            count--;
                            if (count == 0) break;
                        }
                    }
                    break;
                }
                res.json({
                    code: 1000,
                    message: "ok",
                    data: rs
                })
            }
        })
    }
})
//27
router.route('/blocks').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9998,
            message: "Token is not validated"
        })
    }
    else {
        User.findOne({
            phone: req.body.user_id
        }, (err, ok) => {
            if (err) res.json({ code: 1005, message: "Unknow err" });
            if (!ok) {
                res.json({
                    code: 9994,
                    message: "Not found User blocked"
                })
            }
            else {
                User.updateOne({
                    phone: req.userData.phone
                }, {
                        $push: {
                            blocked: {
                                id: ok._id,
                                name: ok.name,
                                avata: ok.avata
                            }
                        }
                    }, (err, oki) => {
                        if (err) res.json({ code: 1005, message: "Unknow err" });
                        res.json({
                            code: 1000,
                            message: "ok"
                        })
                    })
            }
        })
    }
})
//28
router.route('/get_list_brands').post((req, res) => {
    Product.find({
        brand: xoadau(req.body.brand)
    }, (err, ok) => {
        if (err) res.json({ code: 1005, message: "Unknow err" });
        if (err) throw err;

            let rs = [];
            let count = req.body.count;
            let index = ok.length - req.body.index-1;
            for (let i = ok.length - 1; i >= 0; i--) {
                if (index == i) {
                    for (let j = i; j >= 0; j--) {
                        rs.push(ok[j]);
                        count--;
                        if (count == 0) break;
                    }
                }
                break;
            }
            res.json({
                code: 1000,
                message: "ok",
                data:rs
        })
    })
})
//29
router.route('/answer_comment_products').post((req, res) => {
    User.findOne({
        phone: req.userData.phone,
    }, (err, ok) => {
        if (err) res.json({ code: 1005, message: "Unknow err" });
        if (ok) {
            Product.updateOne({
                id: req.body.id,
                id_onwer: ok._id,
                "comment.idcomment": req.body.id_comment
            }, {
                    $set: {
                        "comment.$.answer": req.body.answer
                    }
                }, (err, oki) => {
                    if (err) res.json({ code: 1005, message: "Unknow err" });
                    if (oki.nModified == 1) {
                        res.json({
                            code: 1000,
                            message: "ok"
                        })
                    }
                    else {
                        res.json({
                            code: 1005,
                            message: "Unknow err,"
                        })
                    }
                })
        }
    })

})
//30
router.route('/search_user').post((req, res) => {
    User.find((err, ok) => {
        if (err) res.json({ code: 1005, message: "Unknow err" });
        let rs = [];
        let a = xoadau(req.body.keyWord).split(" ");
        console.log(a);
        for (let i = 0; i < ok.length; i++) {
            let b = xoadau(ok[i].name).split(" ");
            console.log(b);
            for (let i = 0; i < a.length; i++) {
                for (let j = 0; j < b.length; j++) {
                    if (a[i] == b[j]) {
                        rs.push(ok[i]);
                        i = a.length;
                        break;
                    }
                }
            }
        }
        res.json({
            code: 1000,
            message: "ok",
            data: rs
        })
    })
});
//31
router.route('/set_user_follow').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9998,
            message: "Token is not validated"
        })
    }
    else {
        User.findOne({
            phone: req.userData.phone
        }, (err, ok) => {

            if (err) throw err;
            if (ok) {
                let p = 0;
                for (let i = 0; i < ok.followed.length; i++) {
                    if (ok.followed[i].follower_id === req.body.follower_id) {
                        p = 9;
                        break;
                    }
                }
                if (p > 0) {
                    res.json({
                        code: 1010,
                        message: "Actions activited"
                    })
                }
                else
                    User.updateOne({
                        phone: req.userData.phone
                    }, {
                            $push: {
                                followed: {
                                    follower_id: req.body.follower_id
                                }
                            }
                        }, (err, oki) => {
                            if (err) throw err;
                            res.json({
                                code: 1000,
                                message: "ok"
                            })
                        })

            }
        })
    }
})
//32
router.route('/set_user_unfollow').post((req, res) => {
    if (!req.userData) {
        res.json({
            code: 9998,
            message: "Token is  not validated"
        })
    } else {
        User.findOne({
            phone: req.userData.phone
        }, (err, ok) => {
            if (err) throw err
            let dem = -1;
            for (let i = 0; i < ok.followed.length; i++) {
                if (ok.followed[i].follower_id == req.body.follower_id) {
                    dem = i;
                    break;
                }
            }
            if (dem < 0) {
                res.json({
                    code: 9997,
                    message: "Unknow"
                })
            }
            else {
                console.log(ok.followed)
                let rs = ok.followed.splice(dem, 1);
                console.log(ok.followed);
                User.updateOne({
                    phone: req.userData.phone
                }, {
                        $set: {
                            followed: ok.followed
                        }
                    }, (err, oki) => {
                        if (err) throw err;
                        if (oki.nModified == 1) {
                            res.json({
                                code: 1000,
                                message: "ok"
                            })
                        }
                        else {
                            res.json({
                                code: 1005,
                                message: "Unknow err"
                            })
                        }
                    })
            }
        })
    }

})
router.route('/home').post((req,res)=>{
    // console.log(req.body);
    Product.find((err,ok)=>{
        // console.log(ok)
        let index=ok.length-1-req.body.index;
        let rs=[],count=req.body.count;
        for(let i=ok.length-1;i>=0;i--){

            if(index==i){
                for(let j=i;j>=0;j--){
                    rs.push(ok[j]);
                    count--;
                    if(count==0) break;

                }
            }
            break;
        }
        // console.log(rs);
        res.json({
            code:1000,
            message:"ok",
            data:rs
        })
    })
})
module.exports = router;