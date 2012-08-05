/**
 * contains reference to local database and handle its functionalities
 *
 */
var LocalDB = {
	connection : null,
	max_db_size : 1000000,
	/**
	 * connect to local database
	 * @function
	 */
	connect : function() {
		console.log("connecting to local database...");
		LocalDB.connection = window.openDatabase("main", "1", "Main DB", LocalDB.max_db_size);
		LocalDB.connection.transaction(LocalDB.init, LocalDB.onError, LocalDB.onReady);
	},
	onError : function(e) {
		console.log("SQL ERROR");
		console.dir(e);
	},
	init : function(tx) {
		tx.executeSql("create table if not exists myProduct(id INTEGER PRIMARY KEY,name,price)");
	},
	onReady : function() {
		if (navigator.network && navigator.network.connection.type != Connection.NONE) {
			RemoteDB.sync();
		} else
			Device.display();
	},
};

var RemoteDB = {
	md5 : '',
	md5_tick_interval : 10000,
	//url : 'http://192.168.1.18:8082',
	url : 'http://196.218.156.154:8880',

	checkMD5 : function() {
		var url = RemoteDB.url + "/content/campaignHash";
		$.get(url, function(resp) {
			console.log(resp);
			if (resp != RemoteDB.md5) {
				RemoteDB.md5 = resp;
				LocalDB.connect();
			}
		})
	},
	sync : function() {
		$("#docs").html("Refreshing documentation...");
		$.get(RemoteDB.url + "/index.php/content/getProducts", function(resp, code) {
			console.log("back from getting updates with " + resp.length + " items to process.");
			RemoteDB.checkForChanges(resp);
			RemoteDB.checkForDeletionChanges(resp);
			Device.display();
		}, "json");
	},
	checkForChanges : function(records) {
		//check fo new db updates or insertions
		records.forEach(function(ob) {
			LocalDB.connection.transaction(function(ctx) {
				ctx.executeSql("select name from myProduct where id = ?", [ob.id], function(tx, checkres) {
					if (checkres.rows.length) {
						console.log("updating " + ob.id + " " + ob.name);
						tx.executeSql("update myProduct set id=?,name=?,price=? where id=?", [ob.id, ob.name, ob.price, ob.id]);
					} else {
						console.log("insert " + ob.id + " " + ob.name);
						tx.executeSql("insert into myProduct (id,name,price) values(?,?,?)", [ob.id, ob.name, ob.price]);
						navigator.systemNotification.enableNotification();
						PhoneGap.exec(null, null, "systemNotification", "cancelNotification", []);
						navigator.systemNotification.createStatusBarNotification("new offer", ob.name + " $" + ob.price, "new offer");
						navigator.systemNotification.showTickerText("new offer");
						navigator.notification.beep(1);
						navigator.notification.vibrate(1500);
					}
				});
			});
		});
	},
	checkForDeletionChanges : function(records) {
		LocalDB.connection.transaction(function(tx) {
			tx.executeSql("select id,name,price from myProduct", [], function(tx, results) {
				for (var i = 0; i < results.rows.length; i++) {
					var x = true;
					records.forEach(function(ob) {
						if (results.rows.item(i).id == ob.id) {
							x = false;
						}
					});
					if (x) {
						console.log("possible delete " + results.rows.item(i).id);
						tx.executeSql("delete from myProduct where id = ?", [results.rows.item(i).id]);
					}
				}
			});
		});
	}
}