var mysql = require("mysql");
const jwt = require('jsonwebtoken');
const mailjet = require('node-mailjet')
    .connect('bda99ebd366ba03786334b07d6ac9294', '82adec7caa9428fd0c3579c64d26cac6')


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'forum'
});
connection.connect((err) => {
    if (!err) {
        console.log("Database is connected on login");
    }
    else {
        console.log("Error connecting database");

    }
})
exports.register = function (req, res) {
    // console.log("req",req.body);
    var users = {
        "first_name": req.body.first_name,
        "last_name": req.body.last_name,
        "email": req.body.email,
        "password": req.body.password,
        "retype_password": req.body.retype_password,
        "ToS_accepted": req.body.ToS_accepted

    }
    if (users.password != null && users.password != "" && users.password.length >= 8) {
        if (users.first_name != null && users.last_name != null) {
            if (users.email != null && users.email != "") {
                if (users.ToS_accepted == 1 && users.ToS_accepted != null) {


                    if (users.retype_password === users.password) {
                        connection.query('SELECT * FROM users WHERE email = ?', [users.email], (error, results, fields) => {
                            if (error) {
                                // console.log("error ocurred",error);
                                res.send({
                                    "code": 400,
                                    "failed": "error ocurred"
                                })
                            }
                            else {
                                if (results.length == 0) {
                                    connection.query('INSERT INTO users SET ?', users, (error, results, fields) => {
                                        if (error) {
                                            console.log("error ocurred ", error);
                                            res.send({
                                                "code": 400,
                                                "failed": "error ocurred"
                                            })
                                        }
                                        else {
                                            console.log('The solution is: ', results);
                                            res.send({
                                                "code": 200,
                                                "success": "user registered sucessfully"
                                            });
                                        }
                                    });
                                }
                                else {
                                    res.send({
                                        "code": 204,
                                        "success": "Email adress already exist"
                                    });
                                }
                            }
                        })
                    }
                    else {
                        res.send({
                            "failed": " Your password did not match!"
                        })
                    }


                }
                else {
                    res.send({
                        "failed": " You must accept Terms of service",
                        "hint": "you need to input 1 (not true)"
                    })
                }
            }
            else {
                res.send({
                    "failed": " You must insert valid email"
                })
            }
        }
        else {
            res.send({
                "failed": " You must insert first name and last name"
            })
        }
    }
    else {
        res.send({
            "failed": " You must insert valid password. Password must be at least 8 characters long"
        })
    }
}
exports.login = function (req, res) {
    var users = {
        email: req.body.email,
        password: req.body.password,


    }

    connection.query('SELECT * FROM users WHERE email = ?', [users.email], (error, results, fields) => {
        if (error) {
            // console.log("error ocurred",error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        }
        else {
            // console.log('The solution is: ', results);
            if (results.length > 0) {
                if (results[0].password == users.password) {
                    jwt.sign({ users }, 'secretkey', /*{ expiresIn: '510000' },*/(err, token) => {
                        res.json({
                            "code": 200,
                            "success": "login sucessfull",

                            "Your token is: ": token
                        });
                    });

                }
                else {
                    res.send({
                        "code": 204,
                        "success": "Email and password does not match"
                    });
                }
            }
            else {
                res.send({
                    "code": 204,
                    "success": "Email does not exits"
                });
            }
        }
    });
}
exports.reset = (req, res) => {
    var email = req.body.email;
    connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results, fields) => {
        if (error) {
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        }
        else {

            if (results.length > 0) {
                if (results[0].email == email) {
                    const request = mailjet
                        .post("send", { 'version': 'v3.1' })
                        .request({
                            "Messages": [
                                {
                                    "From": {
                                        "Email": "hodzic.bilal2@gmail.com",
                                        "Name": "Bilal"
                                    },
                                    "To": [
                                        {
                                            "Email": results[0].email,
                                           
                                        }
                                    ],
                                    "Subject": "Password reset",
                                    "TextPart": "Password reset",
                                    "HTMLPart": "<h3>Dear " + results[0].first_name +", You need to reset your password for forum! </h3><br />May the delivery force be with you!",
                                    "CustomID": "AppGettingStartedTest"
                                }
                            ]
                        })
                    request
                        .then((result) => {
                            console.log(result.body)
                            res.send({
                                "success": "check your mail"

                            });
                        })
                        .catch((err) => {
                            console.log(err.statusCode)
                        })


                    

                }

            }
            else {
                res.send({
                    "code": 204,
                    "success": "Email does not exists"
                });
            }

        }
    });
}