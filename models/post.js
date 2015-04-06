var mongodb = require('./db');

function Post (username, post, time) {
	this.user = username ;
	this.post = post ;
	if (time) {
		this.time = time ;
	}else{
		this.time = new Date();
	}
};

module.exports = Post ;

Post.prototype.save = function(callback) {
	//存入Mongodb文档
	var post = {
		user: this.user ,
		post: this.post ,
		time: this.time ,
	};
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取post集合
		db.collection('posts' , function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//为user添加属性索引；
		//	collection.ensureIndex('user', {unique: false},function(err){
		//		callback(err);
		//	});
			console.log('插入语句');
			console.log(post);
			collection.insert(post, {safe: false},function(err, post){
				console.log(err);
				console.log(post);
				mongodb.close();
				callback(err, post);
			});
		});
	});
};

Post.get = function get( username, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//查找对应的文档
			var query = {} ;
			if(username){
				query.user = username ;
			}
			collection.find(query).sort({time: -1}).toArray(function(err, docs){
				mongodb.close();
				if(err){
					callback(err, null);
				}
				//把post封装为Post对象
				var posts = [] ;
				docs.forEach(function(doc, index){
					var post = new Post(doc.user, doc.post, doc.time);
					posts.push(post);
				});
				callback(null, posts);

			});

		});
	});
};




