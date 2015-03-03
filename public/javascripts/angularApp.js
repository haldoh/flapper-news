/*jslint node: true */
/*jslint nomen: true */
/*global angular */
"use strict";

var app = angular.module('flapperNews', ['ui.router']);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	
	function ($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: '/home.html',
				controller: 'MainCtrl',
				resolve: {
					postPromise: ['posts', function (posts) {
						return posts.getAll();
					}]
				}
			})
			.state('posts', {
				url: '/posts/{id}',
				templateUrl: '/posts.html',
				controller: 'PostsCtrl',
				resolve: {
					post: ['$stateParams', 'posts', function ($stateParams, posts) {
						return posts.get($stateParams.id);
					}]
				}
			});
	
		$urlRouterProvider.otherwise('home');
		
	}
]);

app.factory('posts', ['$http', function ($http) {
	var o = {
		posts: []
	};
	// Method to get all posts
	o.getAll = function () {
		return $http.get('/posts').success(function (data) {
			angular.copy(data, o.posts);
		});
	};
	// Method to create new posts
	o.create = function (post) {
		return $http.post('/posts', post).success(function (data) {
			o.posts.push(data);
		});
	};
	// Method to upvote posts
	o.upvote = function (post) {
		return $http.put('/posts/' + post._id + '/upvote').success(function (data) {
			post.upvotes += 1;
		});
	};
	// Method to downvote posts
	o.downvote = function (post) {
		return $http.put('/posts/' + post._id + '/downvote').success(function (data) {
			post.downvotes += 1;
		});
	};
	// Method to retrieve a single post
	o.get = function (id) {
		return $http.get('/posts/' + id).then(function (res) {
			return res.data;
		});
	};
	// Method to add a comment
	o.addComment = function (id, comment) {
		return $http.post('/posts/' + id + '/comments', comment);
	};
	// Method to upvote a comment
	o.upvoteComment = function (post, comment) {
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote').success(function (data) {
			comment.upvotes += 1;
		});
	};
	// Method to downvote a comment
	o.downvoteComment = function (post, comment) {
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/downvote').success(function (data) {
			comment.downvotes += 1;
		});
	};
	return o;
}]);

app.controller('MainCtrl', [
	'$scope',
	'posts',
	function ($scope, posts) {
		/* Hide/show new post form */
		$scope.postForm = false;
		$scope.showForm = function () {
			$scope.postForm = true;
		};
		$scope.hideForm = function () {
			$scope.postForm = false;
		};
		/* Posts mechanics */
		$scope.posts = posts.posts;
		// New post
		$scope.addPost = function () {
			if (!$scope.title || $scope.title === '') { return; }
			posts.create({
				title: $scope.title,
				link: $scope.link
			});
			$scope.title = '';
			$scope.link = '';
			$scope.postForm = false;
		};
		// Upvote
		$scope.incrementUpvotes = function (post) {
			posts.upvote(post);
		};
		// Downvote
		$scope.incrementDownvotes = function (post) {
			posts.downvote(post);
		};
	}
]);

app.controller('PostsCtrl', [
	'$scope',
	'posts',
	'post',
	function ($scope, posts, post) {
		/* Hide/show new post form */
		$scope.commentForm = false;
		$scope.showForm = function () {
			$scope.commentForm = true;
		};
		$scope.hideForm = function () {
			$scope.commentForm = false;
		};
		/* Comments */
		$scope.post = post;
		// New comment
		$scope.addComment = function () {
			if ($scope.body === '') { return; }
			posts.addComment(post._id, {
				body: $scope.body,
				author: $scope.author
			}).success(function (comment) {
				$scope.post.comments.push(comment);
			});
			$scope.body = '';
			$scope.author = '';
			$scope.commentForm = false;
		};
		// Upvote comment
		$scope.incrementUpvotes = function (comment) {
			posts.upvoteComment(post, comment);
		};
		// Downvote comment
		$scope.incrementDownvotes = function (comment) {
			posts.downvoteComment(post, comment);
		};
	}
]);