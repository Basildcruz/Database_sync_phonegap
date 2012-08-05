var Device = {
	onReady : function() {
		RemoteDB.checkMD5();
	},
	display : function() {
		$(LocalDB.connection.transaction(function(tx) {
			tx.executeSql("select * from myProduct", [], function(tx, results) {
				var s = "<h4>Offers</h4>", price = "<h4>prices</h4>";
				console.log(results.rows.length + " records on database");
				for ( var i = 0; i < results.rows.length; i++) {
					s += results.rows.item(i).name + "<br/>";
					price += "$ " + results.rows.item(i).price + "<br/>";
				}
				$("#docs").html("Offers List");
				$("#a").html(s);
				$("#b").html(price);
			});
		}));
	},
	notify : function(message) {
		navigator.systemNotification.enableNotification();
		PhoneGap.exec(null, null, "systemNotification", "cancelNotification",
				[]);
		navigator.systemNotification.createStatusBarNotification(message);
		navigator.systemNotification.showTickerText("new offer");
		navigator.notification.beep(1);
		navigator.notification.vibrate(1500);
	}
}

function alertDismissed() {
	// do something
}
