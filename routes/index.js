var express = require('express');
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js') ;

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res ) {
  Post.get(null, function(err, posts){
  		if(err){
  			posts=[];
  		}
  		res.render('index', {
  			title: '首页',
  			posts: posts,
  		});
  });
});

//注册页面
router.get('/reg' , checkNotLogin);
router.get('/reg' , function (req, res){
	res.render('reg',{
		title: '用户注册',
		layout: 'layout' ,
	});
});
//注册响应
router.post('/reg', checkNotLogin );
router.post('/reg' , function (req, res) {
	if(req.body['password-repeat'] != req.body['password']){
		req.flash('error' , '两次输入口令不一致');
		return res.redirect('/reg');
	}
	if(req.body.username == '' || req.body.username == null ){
		req.flash('error' , '用户名不能为空');
		return res.redirect('/reg');
	}
	//口令散列值
	var md5 = crypto.createHash('md5');
	var pwd= md5.update(req.body.password).digest('base64');

	var newUser = new User({
		name: req.body.username ,
		password: pwd,
	});

	//是否存在重复用户名
	User.prototype.get(newUser.name , function(err, user){
		if (user) {
			err = '该用户名已存在';
		}
		if (err) {
			req.flash('error' , err );
			return res.redirect('/reg');
		}
		newUser.save(function(err){
			if (err) {
				req.flash('error' , err);
				console.log(222+err);
				return res.redirect('/reg');
			}
			req.session.user = newUser ;
			req.flash('success', '注册成功');
			res.redirect('/');
		});
	});

});

//登录
router.get('/login' , checkNotLogin);
router.get('/login' , function(req, res){
	res.render('login', {
		title: '用户登入',
	});
});
router.post('/login', checkNotLogin);
router.post('/login' , function(req, res){
	//生成口令散列值
	md5 = crypto.createHash('md5');
	var pwd = md5.update(req.body.password).digest('base64');

	var loginUser = new User({
		name : req.body.name ,
		password : pwd ,
	});

	loginUser.get(loginUser.name , function(err, user){
		if(!user){
			req.flash('error', '用户不存在');
			return res.redirect('/login');
		}
		if(user.password != pwd ){
			req.flash('error', '密码错误');
			return res.redirect('/login');
		}
		req.session.user = user ;
		req.flash('success', '登入成功');
		res.redirect('/');
	});
});

router.get('/logout' , checkLogin);
router.get('/logout', function(req, res){
	req.session.user = null;
	req.flash('success', '登出成功');
	res.redirect('/');
});


router.post('/post', checkLogin);
router.post('/post' , function (req, res){
	var currentUser = req.session.user ;
	var post = new Post(currentUser.name, req.body.post, null);
	post.save(function(err){
		if(err){
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发表成功');
		res.redirect('/u/'+currentUser.name);
	});
});


router.get('/u/:user', function(req, res){
	User.prototype.get(req.params.user, function(err, user){
		if(!user){
			req.flash('error', '用户不存在');
			return res.redirect('/');
		}
		Post.get(user.name, function (err, posts){
			if(err){
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('user', {
				title: user.name ,
				posts: posts,
			});
		});
	});
});

function checkLogin ( req, res , next ){
	if(!req.session.user){
		req.flash('error', '未登入');
		return res.redirect('/login');
	}
	next();
}


function checkNotLogin (req, res, next) {
	if(req.session.user){
		req.flash('error', '已登入');
		return res.redirect('/');
	}
	next();
}

module.exports = router;