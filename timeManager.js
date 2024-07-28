class vTime {
	constructor(hours, minutes, seconds, milliseconds) {
		this.hours = hours;
		this.minutes = minutes;
		this.seconds = seconds;
		this.milliseconds = milliseconds;
	}

	decreaseMilliseconds(dms) {
		let timeChange = false;
		if (this.milliseconds > 0 || this.seconds > 0 || this.hours > 0 || this.minutes > 0) {
			this.milliseconds -= dms;
			timeChange = true;
		}
		if (this.milliseconds < 0) {
			this.seconds--;
			this.milliseconds += 1000;
		}
		if (this.seconds < 0) {
			this.minutes--;
			this.seconds += 60;
		}
		if (this.minutes < 0) {
			this.hours--;
			this.minutes += 60;
		}
		if (this.hours < 0) {
			this.hours = 0;
		}
		if (this.hours == 0 && this.minutes == 0 && this.seconds == 0 && this.milliseconds == 0 && timeChange) {
			// 动态创建音频元素
			var audio = document.createElement('audio');
			audio.src = './mp4/alarm.wav'; // 替换为你的音频文件路径
			audio.controls = false; // 显示播放控件
			audio.autoplay = false; // 设置为 true 可以自动播放，但可能因浏览器设置而不工作
			// 将音频元素添加到文档中
			document.body.appendChild(audio);
			audio.play();
			showNonBlockingAlert('计时结束');
			localStorage.removeItem('pauseTime');
		}
	}

	addMilliseconds(dms) {
		this.milliseconds += dms;
		if (this.milliseconds >= 1000) {
			this.seconds++;
			this.milliseconds -= 1000;
		}
		if (this.seconds >= 60) {
			this.minutes++;
			this.seconds -= 60;
		}
		if (this.minutes >= 60) {
			this.hours++;
			this.minutes -= 60;
		}
		if (this.hours >= 24) {
			this.hours -= 24;
		}
	}

	getHours() {
		return this.hours;
	}

	getMinutes() {
		return this.minutes;
	}

	getSeconds() {
		return this.seconds;
	}

	getMilliseconds() {
		return this.milliseconds;
	}

	copyFrom(time) {
		this.hours = time.getHours();
		this.minutes = time.getMinutes();
		this.seconds = time.getSeconds();
		this.milliseconds = time.getMilliseconds();
	}
}

//获取虚拟时间
var curTime = JSON.parse(sessionStorage.getItem('now'));
if (curTime) {
	var now = new vTime(curTime[0], curTime[1], curTime[2], curTime[3]);
}
//获取计时器时间
curTime = JSON.parse(localStorage.getItem('timerTime'));
if (curTime) var timerTime = new vTime(curTime[0], curTime[1], curTime[2], curTime[3]);
//获取秒表时间
curTime = JSON.parse(sessionStorage.getItem('stopWatchTime'));
if (curTime) var stopWatchTime = new vTime(curTime[0], curTime[1], curTime[2], curTime[3]);
var stopWatch_pause = sessionStorage.getItem('stopWatch_pause');

function showNonBlockingAlert(message) {
	var alertBox = document.getElementById('nonBlockingAlert');
	alertBox.style.display = 'flex';
	var alertText = document.getElementById('alert-text');
	alertText.innerHTML = message;

	// 点击关闭按钮关闭
	document.getElementById('close').addEventListener('click', function () {
		var audio = document.getElementsByTagName('audio')[0];
		if (audio) audio.remove();
		alertBox.style.display = 'none';
	});
}

function checkAlarm() {
	alarms = JSON.parse(localStorage.getItem('alarmClocks'));

	curTime = JSON.parse(sessionStorage.getItem('now'));
	if (curTime) {
		now = new vTime(curTime[0], curTime[1], curTime[2], curTime[3]);
	}

	if (alarms) {
		alarms.forEach(function (alarm) {
			if (
				now &&
				parseInt(alarm.hour) == now.getHours() &&
				parseInt(alarm.minute) == now.getMinutes() &&
				now.getSeconds().toFixed(0) == 0 &&
				now.getMilliseconds().toFixed(0) <= 9
			) {
				// 动态创建音频元素
				var audio = document.createElement('audio');
				audio.src = './mp4/alarm.wav'; // 替换为你的音频文件路径
				audio.controls = false; // 显示播放控件
				audio.autoplay = false; // 设置为 true 可以自动播放，但可能因浏览器设置而不工作
				// 将音频元素添加到文档中
				document.body.appendChild(audio);
				audio.play();
				showNonBlockingAlert('闹钟响了:' + alarm.name);
			}
		});
	}
}

function manageTime() {
	//不在主页面时，帮其时间增长;不在计时器页面时，帮其时间减少
	if (location.href.slice(-9) != 'main.html' && now) {
		now.addMilliseconds(10);
		sessionStorage.setItem('now', JSON.stringify([now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()]));
	}
	if (location.href.slice(-10) != 'timer.html' && timerTime) {
		timerTime.decreaseMilliseconds(10);
		localStorage.setItem(
			'timerTime',
			JSON.stringify([timerTime.getHours(), timerTime.getMinutes(), timerTime.getSeconds(), timerTime.getMilliseconds()])
		);
	}
	if (location.href.slice(-10) != 'watch.html' && stopWatchTime && (!stopWatch_pause || stopWatch_pause == 'false')) {
		stopWatchTime.addMilliseconds(10);
		sessionStorage.setItem(
			'stopWatchTime',
			JSON.stringify([stopWatchTime.getHours(), stopWatchTime.getMinutes(), stopWatchTime.getSeconds(), stopWatchTime.getMilliseconds()])
		);
	}
	checkAlarm(); //检查闹钟响应
}

document.addEventListener('DOMContentLoaded', function () {
	setInterval(manageTime, 10);
});
