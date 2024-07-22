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
			alert('计时结束');
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
curTime = JSON.parse(localStorage.getItem('now'));
var now = new vTime(curTime[0], curTime[1], curTime[2], curTime[3]);
//获取计时器时间
curTime = JSON.parse(localStorage.getItem('timerTime'));
if (curTime) var timerTime = new vTime(curTime[0], curTime[1], curTime[2], curTime[3]);

function checkAlarm() {
	alarms = JSON.parse(localStorage.getItem('alarmClocks'));
	if (alarms) {
		alarms.forEach(function (alarm) {
			if (
				alarm.hour == now.getHours() &&
				alarm.minute == now.getMinutes() &&
				now.getSeconds().toFixed(0) == 0 &&
				now.getMilliseconds().toFixed(0) == 0
			) {
				alert('闹钟响了:' + alarm.name);
				location.reload();
			}
		});
	}
}

function manageTime() {
	//不在主页面时，帮其时间增长;不在计时器页面时，帮其时间减少
	if (location.href.slice(-9) != 'main.html') {
		now.addMilliseconds(10);
		localStorage.setItem('now', JSON.stringify([now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()]));
	}
	if (location.href.slice(-10) != 'timer.html' && timerTime) {
		timerTime.decreaseMilliseconds(10);
		localStorage.setItem(
			'timerTime',
			JSON.stringify([timerTime.getHours(), timerTime.getMinutes(), timerTime.getSeconds(), timerTime.getMilliseconds()])
		);
	}
	checkAlarm(); //检查闹钟响应
}

document.addEventListener('DOMContentLoaded', function () {
	setInterval(manageTime, 10);
});
