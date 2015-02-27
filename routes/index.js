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
router.get('/posts/:post', function (req, res, next) {
	req.post.populate('comments', function (err, post) {
		if (err) { return next(err); }
	});
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

/* PUT upvotes a post */
router.put('/posts/:post/upvote', function (req, res, next) {
	// Upvote the post
	req.post.upvote(function (err, post) {
		if (err) { return next(err); }
		res.json(post);
	});
});

/* POST comment a post */
router.post('/posts/:post/comments', function (req, res, next) {
	// New comment, get content and belonging post from req
	var comment = new Comment(req.body);
	comment.post = req.post;
	// Save the comment
	comment.save(function (err, comment) {
		if (err) { return next(err); }
		req.post.comments.push(comment);
		// Save the post with the new comment
		req.post.save(function (err, post) {
			if (err) { return next(err); }
			res.json(comment);
		});
	});
});

/* PUT upvotes a comment */
router.put('/posts/:post/comments/:comment/upvote', function (req, res, next) {
	// Upvote the comment
	req.comment.upvote(function (err, comment) {
		if (err) { return next(err); }
		res.json(comment);
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

/* PARAM comment */
router.param('comment', function (req, res, next, id) {
	// Find comment by id
	var query = Comment.findById(id);
	query.exec(function (err, comment) {
		// If there are no errors, save it in req.post and continue
		if (err) { return next(err); }
		if (!comment) { return next(new Error('can\'t find comment')); }
		req.comment = comment;
		return next();
	});
});

module.exports = router;
