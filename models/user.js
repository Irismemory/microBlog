var mongodb = require('./db');

function User(user){
	this.name = user.name ;
	this.password = user.password ;
}



User.prototype.get = function (username , callback){
	mongodb.open(function(err , db){
		if (err){
			return callback(err);
		}

		//读取数据库
		db.collection('users' , function(err , collection ){
			if (err){
				mongodb.close();
				return callback(err) ;
			}
			collection.findOne ( { name: username}, function( err , doc ){
				mongodb.close();
				if(doc){
					var user = new User(doc);
					callback(err , user );
				}else{
					callback (err , null );
				}
			});



		});

	});
};

User.prototype.save = function (callback ){
	//存入数据库中
	var user = {
		name: this.name ,
		password: this.password ,
	};

	mongodb.open(function(err, db){
		if (err){
			return callback(err);
		}
		//
		db.collection ('users', function( err , collection){
			if (err){
				mongodb.close();
				return callback(err);
			}
			//为name添加索引
			collection.ensureIndex('name' , {unique: true} , function(err){
				callback(err);
			});
			collection.insert(user , {safe: true} , function(err, user){
				mongodb.close();
				callback(err, user);
			});
		}) ;
	});
};

module.exports = User ;



