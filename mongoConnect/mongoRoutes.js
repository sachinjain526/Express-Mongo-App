module.exports = function (app, db) {

    app.post('/api/create/collection/:collectionName', (req, res) => {
        db.createCollection(req.params.collectionName).then(response => {
            db.close();
            res.json(req.params);
        }).catch(err => {
            res.send(err);
        })

    })
    app.get('/api/users', (req, res) => {
        db.collection('users').find({}).toArray((err, docs) => {
            if (err) {
                console.log(err)
                res.error(err)
            } else {
                res.json(docs);
            }
        })
    });

    app.get('/api/users/history', (req, res) => {
        db.collection('users').findOne({ _id: req.token._id }, function (err, docs) {
            if (err) {
                console.log(err)
                res.error(err)
            } else {
                res.json(docs.history);
            }
        })
    });

    app.get('/api/current_user', (req, res) => {// it will current user detail on screan
        res.json(req.user);
        console.log("current user");
    });

    app.patch('/api/update/history/:id', (req, res) => {// it will current user detail on screan
        console.log(req.body);
        db.collection("users").findOneAndUpdate({ _id: req.token._id },
            { $set: { "history.$[elem].result": req.body.result, "history.$[elem].modifiedDate": req.body.modifiedDate } },
            { arrayFilters: [{ "elem.id": req.params.id }] }).then((result) => {
                if (result.value) {
                    result.value.history.filter(function (el) {
                        if (el.id === req.params.id) {
                            el.result = req.body.result;
                            el.modifiedDate = req.body.modifiedDate;
                            res.json(el);
                            return;
                        }
                    })
                }
            }).catch(err => {
                res.send(err);
            });
    });

    app.post('/api/create/history', (req, res) => {// it will current user detail on screan
        //console.log(req.body);
        db.collection("users").findOneAndUpdate({ _id: req.token._id }, { $push: { history: req.body } }).then((result) => {
            res.json(result.value);
        }).catch(err => {
            res.send(err);
        })
    });
}