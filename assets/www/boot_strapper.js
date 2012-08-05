var BootStrapper = {
	start : function (){
		document.addEventListener("deviceReady", Device.onReady);
		window.setInterval(RemoteDB.checkMD5, RemoteDB.md5_tick_interval);
	},
}