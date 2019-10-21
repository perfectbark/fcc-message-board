/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function() {
  let tid, rid;
  suite("API ROUTING FOR /api/threads/:board", function() {
    suite("POST", function() {
      test("Post a thread", function(done) {
        chai
          .request(server)
          .post("/api/threads/test")
          .send({
            delete_password: "password",
            text: "test thread text"
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, "_id");
            assert.property(res.body, "reported");
            assert.property(res.body, "delete_password");
            tid = res.body._id;
            done();
          });
      });
    });

    suite("GET", function() {
      test("Get a thread", function(done) {
        chai
          .request(server)
          .get("/api/threads/test")
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], "text");
            assert.property(res.body[0], "replies");
            assert.property(res.body[0], "created_on");
            assert.property(res.body[0], "bumped_on");
            assert.notProperty(res.body[0], "delete_password");
            assert.notProperty(res.body[0], "reported");
            done();
          });
      });
    });

    suite("DELETE", function() {
      test("Delete a thread with correct password", function(done) {
        chai
          .request(server)
          .delete("/api/threads/test")
          .send({
            delete_password: "password",
            thread_id: tid
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      });

      test("Delete a thread with wrong password", function(done) {
        chai
          .request(server)
          .delete("/api/threads/test")
          .send({
            delete_password: "wrongpass",
            thread_id: tid
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "incorrect password");
            done();
          });
      });
    });

    suite("PUT", function() {
      test("Report a thread", function(done) {
        chai
          .request(server)
          .put("/api/threads/test")
          .send({
            thread_id: tid
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "reported");
            done();
          });
      });
    });
  });

  suite("API ROUTING FOR /api/replies/:board", function() {
    suite("POST", function() {
      test("Delete a thread with correct password", function(done) {
        chai
          .request(server)
          .post("/api/replies/test")
          .send({
            text: "reply text",
            delete_password: "password",
            thread_id: tid
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, "_id");
            rid = res.body._id;
            done();
          });
      });
    });

    suite("GET", function() {
      test("Get all replies of a thread", function(done) {
        chai
          .request(server)
          .get("/api/replies/test")
          .query({ thread_id: tid })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body.replies);
            assert.notProperty(res.body.replies[0], "delete_password");
            assert.notProperty(res.body.replies[0], "reported");
            done();
          });
      });
    });

    suite("PUT", function() {
      test("Report a reply", function(done) {
        chai
          .request(server)
          .put("/api/replies/test")
          .send({
            thread_id: tid
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "reported");
            done();
          });
      });
    });

    suite("DELETE", function() {
      test("Delete a reply with correct password", function(done) {
        chai
          .request(server)
          .delete("/api/replies/test")
          .send({
            reply_id: rid,
            delete_password: "password",
            thread_id: tid
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      });

      test("Delete a reply with wrong password", function(done) {
        chai
          .request(server)
          .delete("/api/replies/test")
          .send({
            reply_id: rid,
            delete_password: "wrongpass",
            thread_id: tid
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "incorrect password");
            done();
          });
      });
    });
  });
});
