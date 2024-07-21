window.addEventListener('DOMContentLoaded', () => {
	// 设置拖动效果
	setDrag();
	// 更新钟表
	setInterval(updateClock, interval); // 每10毫秒更新一次时钟，因此时钟显示为100帧
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

var vtime = new vTime(0, 0, 0, 0);

// 更新时钟
function updateClock() {
	// 当没有拖动时执行
	if (!dragHand) {
		// 更新虚拟时间
		if (realTime) {
			vtime.copyFrom(new Date());
		} else {
			vtime.addMilliseconds(interval);
		}
		// 获取当前时间
		const now = realTime ? new Date() : vtime; // TODO
		const hours = now.getHours() % 12;
		const minutes = now.getMinutes();
		const seconds = parseFloat(now.getSeconds());
		const milliseconds = parseFloat(now.getMilliseconds());

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
}

// 设置拖动效果
function setDrag() {
	// 增加鼠标拖动功能
	const handContainer = document.getElementById('clock_hand');
	const clock = document.getElementById('clock');

	handContainer.addEventListener('mousedown', (event) => {
		const hand = event.target;
		console.log('down');

		switch (hand.id) {
			case 'hour-hand-drag':
				dragHand = 1;
				break;
			case 'minute-hand-drag':
				dragHand = 2;
				break;
			case 'second-hand-drag':
				dragHand = 3;
				break;
			default:
				dragHand = 0;
				break;
		}
	});

	clock.addEventListener('mousemove', (event) => {
		if (dragHand) {
			const hand = event.target;

			console.log('move');

			let dx = event.clientX - (clock.getBoundingClientRect().left + 250);
			let dy = event.clientY - (clock.getBoundingClientRect().top + 250);
			let deg = slopeToDeg(dx, dy);
			let ddeg = 0;
			// console.log(dx, dy, deg);

			let degs = [hourDeg, minuteDeg, secondDeg];

			ddeg = deg - degs[dragHand - 1];

			// 特殊情况处理，度过0
			let clockwise = 0;
			if (0 < deg && deg < 30 && 330 < degs[dragHand - 1] && degs[dragHand - 1] < 360) {
				console.log('zheng');
				clockwise = 1;
			} else if (330 < deg && deg < 360 && 0 < degs[dragHand - 1] && degs[dragHand - 1] < 30) {
				console.log('ni');
				clockwise = -1;
			}
			console.log(deg, degs[dragHand - 1], ddeg);

			let linkage = handLinkage(ddeg, dragHand, clockwise);
			hourDeg += linkage[0];
			minuteDeg += linkage[1];
			secondDeg += linkage[2];

			// 获取dom树节点
			const hourHand = document.getElementById('hour-hand');
			const minuteHand = document.getElementById('minute-hand');
			const secondHand = document.getElementById('second-hand');

			//更新时针指针角度
			hourHand.setAttribute('transform', `rotate(${hourDeg}, 250, 250)`);
			minuteHand.setAttribute('transform', `rotate(${minuteDeg}, 250, 250)`);
			secondHand.setAttribute('transform', `rotate(${secondDeg}, 250, 250)`);

			updateVtime();
			console.log(vtime.getSeconds());
		}
	});

	clock.addEventListener('mouseup', () => {
		console.log('up');
		if (dragHand) {
			dragHand = 0;
			realTime = false;

			// 更新虚拟时间
			updateVtime();
		}
	});
}

// 计算偏转角度
function slopeToDeg(dx, dy) {
	let slope = Math.atan(dy / dx);
	let deg = (slope * 180) / Math.PI + 90;
	return dx < 0 ? deg + 180 : deg;
}

// 指针联动
function handLinkage(ddeg, dragHand, clockwise) {
	if (!dragHand) {
		return;
	}
	res = [0, 0, 0];

	ddeg += 360 * clockwise;
	switch (dragHand) {
		case 1:
			res = [ddeg - 360 * clockwise, ddeg * 60, ddeg * 60 * 60];
			break;
		case 2:
			res = [ddeg / 60, ddeg - 360 * clockwise, ddeg * 60];
			break;
		case 3:
			res = [ddeg / 60 / 60, ddeg / 60, ddeg - 360 * clockwise];
			break;
		default:
			break;
	}
	return res;
}

// 根据钟表指针更新虚拟时间
function updateVtime() {
	let hours = hourDeg / 30 - minuteDeg / 360;
	let minute = minuteDeg / 6 - secondDeg / 360;
	let second = Math.floor(secondDeg / 6);
	let milliseconds = (secondDeg / 6 - second) * 1000;

	vtime = new vTime(hours, minute, second, milliseconds);
}
