/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;

const CONNECTION_STRING = process.env.DB;

const MONGODB_CONNECTION_STRING = process.env.DB;

let client, db;

(async function() {
  try {
    client = new MongoClient(MONGODB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await client.connect();
    db = client.db("fcc");
  } catch (err) {
    console.error("connection error", err);
  }
})();

module.exports = function(app) {
  app
    .route("/api/threads/:board")
    .post(async function(req, res) {
      try {
        let d = {};
        d.board = req.params.board;
        d.text = req.body.text;
        d.delete_password = req.body.delete_password;
        d.created_on = new Date();
        d.bumped_on = d.created_on;
        d.reported = false;
        d.replies = [];
        let r = await db.collection("boards").insertOne(d);
        d._id = r.insertedId;
        return res.json(d);
      } catch (err) {
        console.error(err);
      }
    })
    .get(async function(req, res) {
      let d = await db
        .collection("boards")
        .find({ board: req.params.board })
        .sort({ bumped_on: -1 })
        .project({ delete_password: 0, reported: 0, replies: { $slice: -3 } })
        .limit(10)
        .toArray();
      return res.json(d);
    })
    .delete(async function(req, res) {
      try {
        let d = await db
          .collection("boards")
          .findOneAndUpdate(
            {
              _id: ObjectId(req.body.thread_id),
              delete_password: req.body.delete_password
            },
            { $set: { text: "[deleted]" } }
          );
        if (d.lastErrorObject.updatedExisting) return res.send("success");
        else return res.send("incorrect password");
      } catch (err) {
        console.log(err);
        res.send("report thread error");
      }
    })
    .put(async function(req, res) {
      try {
        let d = await db
          .collection("boards")
          .findOneAndUpdate(
            { _id: ObjectId(req.body.thread_id) },
            { $set: { reported: true } }
          );
        if (d.lastErrorObject.updatedExisting) return res.send("reported");
      } catch (err) {
        console.log(err);
        res.send("report thread error");
      }
    });

  app
    .route("/api/replies/:board")
    .post(async function(req, res) {
      let d = {};
      d.text = req.body.text;
      d.delete_password = req.body.delete_password;
      d._id = ObjectId();
      d.reported = false;
      d.created_on = new Date();
      let r = await db
        .collection("boards")
        .findOneAndUpdate(
          { _id: ObjectId(req.body.thread_id) },
          { $push: { replies: d }, $set: { bumped_on: d.created_on } }
        );
      return res.json(d);
    })
    .get(async function(req, res) {
      let d = await db.collection("boards").findOne(
        { _id: ObjectId(req.query.thread_id) },
        {
          projection: {
            delete_password: 0,
            reported: 0,
            "replies.delete_password": 0,
            "replies.reported": 0
          }
        }
      );
      res.json(d);
    })
    .delete(async function(req, res) {
      try {
        let d = await db.collection("boards").findOneAndUpdate(
          {
            _id: ObjectId(req.body.thread_id),
            "replies._id": ObjectId(req.body.reply_id),
            "replies.delete_password": req.body.delete_password
          },
          { $set: { "replies.$[ele].text": "[deleted]" } },
          { arrayFilters: [{ "ele._id": ObjectId(req.body.reply_id) }] }
        );
        if (d.lastErrorObject.updatedExisting) return res.send("success");
        else return res.send("incorrect password");
      } catch (err) {
        console.error(err);
        return res.send("delete error");
      }
    })
    .put(async function(req, res) {
      try {
        let d = await db
          .collection("boards")
          .findOneAndUpdate(
            { _id: ObjectId(req.body.thread_id) },
            { $set: { "replies.$[ele].reported": true } },
            { arrayFilters: [{ "ele._id": ObjectId(req.body.reply_id) }] }
          );
        return res.send("reported");
      } catch (err) {
        console.error(err);
        return res.send("error");
      }
    });
};
