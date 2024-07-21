// 定义虚拟时间
// 与Date()具有一些相同的接口

class vTime {
	constructor(hours, minutes, seconds, milliseconds) {
		this.hours = hours;
		this.minutes = minutes;
		this.seconds = seconds;
		this.milliseconds = milliseconds;
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

window.addEventListener('DOMContentLoaded', () => {
	// 获取本地时间
	const curTime = localStorage.getItem('now');
	var now = new vTime(curTime[0], curTime[1], curTime[2], curTime[3]);
	var stopWatchTime = new vTime(0, 0, 0, 0);
	// 更新钟表
	// setInterval(updateClock, interval, now); // 每10毫秒更新一次时钟，因此时钟显示为100帧
	// 点击开始按钮更新钟表
	const start = document.getElementById('start-button');
	start.addEventListener('click', function handleStart() {
		var update = setInterval(updateClock, interval, stopWatchTime);
		start.textContent = '暂停';
		start.removeEventListener('click', handleStart); // 移除事件监听器
		start.addEventListener('click', function handlePause() {
			start.textContent = '开始';
			clearInterval(update);
			start.removeEventListener('click', handlePause); // 移除事件监听器
			start.addEventListener('click', handleStart); // 添加事件监听器
		});
	});
	// 点击重置按钮重置钟表
	const reset = document.getElementById('reset-button');
	reset.addEventListener('click', function handleReset() {
		location.reload();
	});
	// TODO: 点击钟表跳转网页
});

// 表示是否是现实时间
let realTime = true;

// 表示是否拖动
let dragHand = 0;

// 表示三个指针的角度
let hourDeg = 0;
let minuteDeg = 0;
let secondDeg = 0;

// 定义时钟刷新的频率
const interval = 10;

//格式化时间
function formatTime(time) {
	return time < 10 ? '0' + time : time;
}

// 更新时钟
function updateClock(time) {
	// 更新虚拟时间

	time.addMilliseconds(interval);

	// 获取当前时间
	const now = time;
	const hours = now.getHours() % 12;
	const minutes = now.getMinutes();
	const seconds = parseFloat(now.getSeconds());
	const milliseconds = parseFloat(now.getMilliseconds());

	//更新数字显示
	const timeNum = document.getElementById('time');
	timeNum.textContent = `${formatTime(minutes)}:${formatTime(seconds.toFixed(0))}.${formatTime(milliseconds.toFixed(0) / 10)}`;

	// 获取dom树节点
	const hourHand = document.getElementById('hour-hand');
	const minuteHand = document.getElementById('minute-hand');
	const secondHand = document.getElementById('second-hand');

	// 获取时钟指针角度
	hourDeg = (360 / 12) * (hours + minutes / 60 + seconds / 3600 + milliseconds / 3600000);
	minuteDeg = (360 / 60) * (minutes + seconds / 60 + milliseconds / 60000);
	secondDeg = (360 / 60) * (seconds + milliseconds / 1000);

	//更新时针指针角度
	hourHand.setAttribute('transform', `rotate(${hourDeg}, 250, 250)`);
	minuteHand.setAttribute('transform', `rotate(${minuteDeg}, 250, 250)`);
	secondHand.setAttribute('transform', `rotate(${secondDeg}, 250, 250)`);

	//检查闹钟是否响起
	alarms = JSON.parse(localStorage.getItem('alarmClocks'));
	if (alarms) {
		alarms.forEach(function (alarm) {
			if (alarm.hour == now.getHours() && alarm.minute == minutes && seconds.toFixed(0) == 0) {
				alert('闹钟响了:' + alarm.name);
			}
		});
	}
}

function checkAlarm(now) {
	alarms = JSON.parse(localStorage.getItem('alarmClocks'));
	if (alarms) {
		alarms.forEach(function (alarm) {
			if (alarm.hour == now.getHours() && alarm.minute == minutes && seconds.toFixed(0) == 0) {
				alert('闹钟响了:' + alarm.name);
			}
		});
	}
}
