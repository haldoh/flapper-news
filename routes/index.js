/*jslint node: true*/
"use strict";

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET all posts */
router.get('/posts', function (req, res, next) {
	// Find all posts in the db
	Post.find(function (err, posts) {
		if (err) { return next(err); }
		res.json(posts);
	});
});

/* GET a single post */
router.get('/posts/:post', function (req, res) {
	res.json(req.post);
});

/* POST save a post */
router.post('/posts', function (req, res, next) {
	// Create new post
	var post = new Post(req.body);
	// Save and return it
	post.save(function (err, post) {
		if (err) { return next(err); }
		res.json(post);
	});
});

/* PARAM post */
router.param('post', function (req, res, next, id) {
	// Find post by id
	var query = Post.findById(id);
	query.exec(function (err, post) {
		// If there are no errors, save it in req.post and continue
		if (err) { return next(err); }
		if (!post) { return next(new Error('can\'t find post')); }
		req.post = post;
		return next();
	});
});

module.exports = router;
