var mysql = require("mysql");


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'forum'
});
connection.connect((err) => {
    if (!err) {
        console.log("Database is connected on topic");
    }
    else {
        console.log("Error connecting database");

    }
})
exports.createTopic = (req, res) => {
    var user_id;
    var date = new Date();

    //get id from the current logged user to store it in database
    connection.query('SELECT * FROM users WHERE email = ?', [req.email], (error, results) => {
        if (error) {
            res.send({
                "code": 400,
                "failed": "error ocurred in topic"
            })
        }
        else
            if (results.length > 0)
                user_id = results[0].id;




        var topic = {
            "name": req.body.name,
            "text": req.body.text,
            //"category": req.body.category
            "created_at": date.getDate() + "-" + parseInt(date.getMonth() + 1) + "-" + date.getFullYear(),
            "user_id": user_id
        }

        if (topic.name == "undefined" || topic.name == null || topic.name == "") {
            res.send({
                "failed": "you can't create topic without name"

            })
        }
        else if (topic.text == "undefined" || topic.text == "" || topic.text == null) {
            res.send({
                "failed": "you can't create topic without text!"

            })
        }
        else {
            connection.query('SELECT * FROM topics WHERE name = ?', [topic.name], (error, results, fields) => {
                if (error) {
                    // console.log("error ocurred",error);
                    res.send({
                        "code": 400,
                        "failed": "error ocurred"
                    })
                }
                else {
                    if (results.length == 0) {
                        connection.query('INSERT INTO topics SET ?', topic, (error, results, fields) => {
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
                                    "success": "topic created sucessfully"
                                });
                            }
                        });
                    }
                    else {
                        res.send({
                            "code": 204,
                            "success": "Topic with that name already exists"
                        });
                    }
                }
            })
        }
    })
}
exports.modifyTopic = (req, res) => {
    var uid;
    var date = new Date();

    //get id from the current loged user to check their topic
    connection.query('SELECT * FROM users WHERE email = ?', [req.email], (error, results) => {
        if (error) {
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        }
        else
            if (results.length > 0)
                uid = results[0].id;




        var topic = {
            "name": req.body.name,
            "text": req.body.text,
            //"category": req.body.category
            "updated_at": date.getDate() + "-" + parseInt(date.getMonth() + 1) + "-" + date.getFullYear()

        }

        if (topic.name == "undefined" || topic.name == null || topic.name == "") {
            res.send({
                "failed": "We can't find topic without name. Please enter a name of topic"

            })
        }
        else if (topic.text == "undefined" || topic.text == "" || topic.text == null) {
            res.send({
                "failed": "please insert modified text to your topic"

            })
        }
        else {
            connection.query('SELECT * FROM topics WHERE name = ?', [topic.name], (error, results, fields) => {
                if (error) {
                    // console.log("error ocurred",error);
                    res.send({
                        "code": 400,
                        "failed": "error ocurred while searching for topic. Try again!"
                    })
                }
                else {
                    if (results.length > 0) {
                        if (results[0].user_id == uid) {
                            connection.query(`UPDATE topics SET text = "${topic.text}", updated_at= "${topic.updated_at}" WHERE topics.id = ${results[0].id}`, (error, results, fields) => {
                                if (error) {
                                    console.log("error ocurred ", error);
                                    res.send({
                                        "code": 400,
                                        "failed": "error ocurred while modifying topic"
                                    })
                                }
                                else {
                                    console.log('The solution is: ', results);
                                    res.send({
                                        "code": 200,
                                        "success": "topic modified sucessfully"
                                    });
                                }
                            });
                        }
                        else {
                            res.send({
                                "failed": "You can only modify topic that you create!"
                            });
                        }
                    }
                    else {
                        res.send({

                            "success": "topic with that name doesn't exists!"
                        });
                    }
                }
            })
        }
    })
}
exports.getTopic = (req, res) => {
    var topic = {
        "name": req.body.name
    }

    if (topic.name == "undefined" || topic.name == null || topic.name == "") {
        res.send({
            "failed": "Please insert a name of topic"

        })
    }

    else {
        connection.query('SELECT * FROM topics WHERE name = ?', [topic.name], (error, results) => {
            if (error) {
                res.send({
                    "failed": "error ocurred while searching. Try again please"
                })
            }
            else {
                if (results.length == 0) {
                    res.send({
                        "failed": "topic with that name doesn't exist"

                    })
                }
                else {
                    connection.query('SELECT * FROM users WHERE id = ?', [results[0].user_id], (err, results2) => {
                        if (err) {
                            res.send({
                                "failed": "error ocurred while searching. Try again please"
                            })
                        }
                        else {
                            res.send({
                                "name": results[0].name,
                                "text": results[0].text,
                                "created": results[0].created_at,
                                "posted by": results2[0].first_name + " " + results2[0].last_name,
                                "comments":results[0].comments

                            })
                        }
                    })

                }
            }

        })
    }
}
exports.deleteTopic=(req, res)=>{
    var uid;
    var date = new Date();

    //get id from the current loged user to check their topic
    connection.query('SELECT * FROM users WHERE email = ?', [req.email], (error, results) => {
        if (error) {
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        }
        else
            if (results.length > 0)
                uid = results[0].id;




        var topic = {
            "name": req.body.name
        }

        if (topic.name == "undefined" || topic.name == null || topic.name == "") {
            res.send({
                "failed": "We can't find topic without name. Please enter a name of topic"

            })
        }
        else {
            connection.query('SELECT * FROM topics WHERE name = ?', [topic.name], (error, results) => {
                if (error) {
                    res.send({
                        "code": 400,
                        "failed": "error ocurred while searching topic. Try again!"
                    })
                }
                else {
                    if (results.length > 0) {
                        if (results[0].user_id == uid) {
                            connection.query(`delete from topics  WHERE topics.id = ${results[0].id}`, (error, results) => {
                                if (error) {
                                    console.log("error ocurred ", error);
                                    res.send({
                                        "failed": "error ocurred while deleting topic"
                                    })
                                }
                                else {
                                    res.send({
                                        "success": "topic deleted sucessfully"
                                    });
                                }
                            });
                        }
                        else {
                            res.send({
                                "failed": "You can only delete topic that you created!"
                            });
                        }
                    }
                    else {
                        res.send({

                            "success": "topic with that name doesn't exists!"
                        });
                    }
                }
            })
        }
    })
}
exports.getAll=(req, res)=>{
    connection.query('SELECT * FROM topics ', (error, results) => {
        if (error) {
            res.send({
                "code": 400,
                "failed": "error ocurred while searching topic. Try again!"
            })
        }
        else{
            res.send(
                results
            )
        }
    })
}

