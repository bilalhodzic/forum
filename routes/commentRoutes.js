var mysql = require("mysql");

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'forum'
});
connection.connect((err) => {
    if (!err) {
        console.log("Database is connected on comment");
    }
    else {
        console.log("Error connecting database");

    }
})
exports.createComment = (req, res) => {
    var uid;
    var date = new Date();

    //get id from the current logged user to store it in database
    connection.query('SELECT * FROM users WHERE email = ?', [req.email], (error, results) => {
        if (error) {
            res.send({
                "failed": "error ocurred in comment"
            })
        }
        else {
            if (results.length > 0)
                uid = results[0].id;
        }
        connection.query('SELECT * FROM topics WHERE name = ?', [req.body.topic], (error, results2) => {
            if (error) {
                res.send({
                    "failed": "error ocurred in comment"
                })
            }
            else {
                if (results2.length > 0) {
                    var comment = {
                        "topic_name": req.body.topic,
                        "topic_id": results2[0].id,
                        "text": req.body.text,
                        "user_id": uid,
                        "created_at": date.getDate() + "-" + parseInt(date.getMonth() + 1) + "-" + date.getFullYear(),
                    }
                    if (comment.topic_name == "undefined" || comment.topic_name == null || comment.topic_name == "") {
                        res.send({
                            "failed": "We cannot find a topic without name",
                            "hint": "insert key 'topic' with value(topic name)"

                        })
                    }
                    else if (comment.text == "undefined" || comment.text == "" || comment.text == null) {
                        res.send({
                            "failed": "you can't create comment without text!"

                        })
                    }
                    else {
                        connection.query('INSERT INTO comments SET ?', comment, (error, results, fields) => {
                            if (error) {
                                res.send({
                                    "failed": "error ocurred"
                                })
                            }
                            else {
                                connection.query(`UPDATE topics SET comments = comments+1 WHERE topics.id = ${results2[0].id}`, (error, results, fields) => {
                                    res.send({
                                        "success": "comment created sucessfully",
                                        "topic":comment.topic_name,
                                        "text":comment.text
                                    });
                                });
                            }
                        });
                    }
                }
                else {
                    res.send({
                        "failed": "topic with that name doesn't exist"
                    })
                }

            }
        })
    })
}
exports.modifyComment = (req, res) => {
    var uid;
    var date = new Date();

    connection.query('SELECT * FROM users WHERE email = ?', [req.email], (error, results) => {
        if (error) {
            res.send({
                "failed": "error ocurred while getting user id"
            })
        }
        else {
            if (results.length > 0)
                uid = results[0].id;
        }

        var comment = {
            "topic_name": req.body.topic,
            "text": req.body.text,
            "updated_at": date.getDate() + "-" + parseInt(date.getMonth() + 1) + "-" + date.getFullYear(),
        }
        if (comment.topic_name == "undefined" || comment.topic_name == null || comment.topic_name == "") {
            res.send({
                "failed": "We cannot find a topic without name",
                "hint": "insert key 'topic' with value(topic name)"

            })
        }
        else if (comment.text == "undefined" || comment.text == "" || comment.text == null) {
            res.send({
                "failed": "you need to insert text for updating"

            })
        }
        else {
            connection.query('SELECT * FROM topics WHERE name = ?', [comment.topic_name], (error, results2) => {
                if (error) {
                    res.send({
                        "failed": "error ocurred while searching for topic. Try again!"
                    })
                }
                else {
                    if (results2.length > 0) {
                        connection.query('SELECT * FROM comments WHERE user_id = ?', [uid], (error, results3) => {
                            if (error) {
                                res.send({
                                    "failed": "error ocurred while checking comments. Try again!"
                                })
                            }
                            else {
                                if (results3[0].user_id == uid) {
                                    connection.query(`UPDATE comments SET text = "${comment.text}", updated_at= "${comment.updated_at}" WHERE comments.id = ${results3[0].id}`, (error, results) => {
                                        if (error) {
                                            res.send({
                                                "failed": "error ocurred while modifying comment"
                                            })
                                        }
                                        else {
                                            res.send({
                                                "success": "comment modified sucessfully",
                                                "topic":comment.topic_name,
                                                "text":comment.text
                                            });
                                        }
                                    });
                                }
                                else {
                                    res.send({
                                        "failed": "You can only modify comment that you create!"
                                    });
                                }
                            }

                        })

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
exports.getComment = (req, res) => {
    var topic = {
        "name": req.body.topic
    }

    if (topic.name == "undefined" || topic.name == null || topic.name == "") {
        res.send({
            "failed": "Please insert a name of topic",
            "hint": "insert key 'topic' with value(topic name)"

        })
    }

    else {
        connection.query('SELECT * FROM comments WHERE topic_name = ?', [topic.name], (error, results) => {
            if (error) {
                res.send({
                    "failed": "error ocurred while searching topics. Try again please"
                })
            }
            else {
                if (results.length == 0) {
                    res.send({
                        "failed": "topic with that name doesn't exist or there is no comments on that topic"

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

                            var data = {
                                topic: results[0].topic_name,

                            }
                            for (var i = 0; i < results.length; i++) {
                                data["comment " + (i + 1)] = {
                                    text: results[i].text,
                                    user_id: results[i].user_id,
                                    created_at: results[i].created_at
                                }
                            }
                            res.send(data)
                        }
                    })

                }
            }

        })
    }
}
exports.deleteComment = (req, res) => {
    var uid;

    connection.query('SELECT * FROM users WHERE email = ?', [req.email], (error, results) => {
        if (error) {
            res.send({
                "failed": "error ocurred while getting user id"
            })
        }
        else {
            if (results.length > 0)
                uid = results[0].id;
        }

        var comment = {
            "topic_name": req.body.topic
        }
        if (comment.topic_name == "undefined" || comment.topic_name == null || comment.topic_name == "") {
            res.send({
                "failed": "We cannot find a topic without name",
                "hint": "insert key 'topic' with value(topic name)"

            })
        }
        
        else {
            connection.query(`SELECT * FROM comments WHERE topic_name = "${comment.topic_name}" and user_id= ${uid}`, (error, results2) => {
                if (error) {
                    console.log(error)
                    res.send({
                        "failed": "error ocurred while searching for topic name. Try again!"
                    })
                }
                else {
                    if (results2.length > 0) {
                        connection.query(`delete from comments  WHERE id = ${results2[0].id}`, (error, results3) => {
                            if (error) {
                                console.log(error)
                                res.send({
                                    "failed": "error ocurred while deleting comment. Try again!"
                                })
                            }
                            else {
                                
                                    connection.query(`UPDATE topics SET comments = comments-1 WHERE topics.name = "${comment.topic_name}"`, (error, results) => {
                                        if (error) {
                                            res.send({
                                                "failed": "error ocurred while modifying topic table"
                                            })
                                        }
                                        else {
                                            res.send({
                                                "success": "comment deleted sucessfully"
                                            });
                                        }
                                    });
                              
                            }

                        })

                    }
                    else {
                        res.send({

                            "success": "topic with that name doesn't exist or you don't have any comments on this topic!"
                        });
                    }
                }
            })
        }
    })
}
exports.searchText=(req, res)=>{
    var text=req.body.text;
    if(text==null){
        res.send({
            failed:"You need to insert text so we can find comments",
            hint:"insert key'text' with your desired text"
        })
    }
    connection.query(`SELECT * FROM comments WHERE text like "%${text}%" `, (error, results) => {
        if (error) {
            console.log(error)
            res.send({
                "failed": "error ocurred while searching for text. Try again!"
            })
        }
        else{
            if(results.length==0){
                res.send({
                    failed:"we didn't find anything. Try again!"
                })
            }
            res.send({
                results});
        }
    
    
    })

}