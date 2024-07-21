window.addEventListener('DOMContentLoaded', () => {
	// 设置拖动效果
	setDrag();
	// 更新钟表
	setInterval(updateClock, interval); // 每10毫秒更新一次时钟，因此时钟显示为100帧
});

//test

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

		//更新数字时间显示
		// const hoursNum=hours.
		const timeString = `${String(hours.toFixed(0)).padStart(2, '0')} : ${String(minutes.toFixed(0)).padStart(2, '0')} : ${String(
			seconds.toFixed(0)
		).padStart(2, '0')}`;
		document.getElementById('time-display').textContent = timeString;

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

			// 判断是否点击到了旋炳
			if (
				(dragHand == 1 && hand.id != 'hour-hand-drag') ||
				(dragHand == 2 && hand.id != 'minute-hand-drag') ||
				(dragHand == 3 && hand.id != 'second-hand-drag')
			) {
				return;
			}

			let dx = event.clientX - (clock.getBoundingClientRect().left + 250);
			let dy = event.clientY - (clock.getBoundingClientRect().top + 250);
			let deg = slopeToDeg(dx, dy);
			console.log(dx, dy, deg);

			// 改变当前角度
			switch (dragHand) {
				case 1:
					hourDeg = deg;
					break;
				case 2:
					minuteDeg = deg;
					break;
				case 3:
					secondDeg = deg;
					break;
				default:
					break;
			}

			hand.parentElement.setAttribute('transform', `rotate(${deg}, 250, 250)`);
			updateVtime();
			console.log(vtime.getSeconds());
		}
	});

	handContainer.addEventListener('mouseup', () => {
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

// 根据钟表指针更新虚拟时间
function updateVtime() {
	let hours = hourDeg / 30 - minuteDeg / 360;
	let minute = minuteDeg / 6 - secondDeg / 360;
	let second = Math.floor(secondDeg / 6);
	let milliseconds = (secondDeg / 6 - second) * 1000;

	vtime = new vTime(hours, minute, second, milliseconds);
}

//根据选择启用不同功能
window.onload = function () {
	var clockFunction = document.getElementById('clock-functions');
	if (clockFunction) {
		clockFunction.addEventListener('change', (event) => {
			const selectedFunction = event.target.value;
			const timeInputHour = document.getElementById('time-input-hour');
			const timeInputMinute = document.getElementById('time-input-minute');
			const timeInputSecond = document.getElementById('time-input-second');
			const timeInputButton = document.getElementById('time-input-button');

			if (selectedFunction === 'setTime') {
				timeInputHour.disabled = false;
				timeInputMinute.disabled = false;
				timeInputSecond.disabled = false;
				timeInputHour.style.display = 'block';
				timeInputMinute.style.display = 'block';
				timeInputSecond.style.display = 'block';
				timeInputButton.style.display = 'block';
			} else if (selectedFunction === 'alarm') {
				location.href = 'alarm.html';
			} else if (selectedFunction === 'stopwatch') {
				location.href = 'stopwatch.html';
			} else {
				timeInputHour.disabled = true;
				timeInputMinute.disabled = true;
				timeInputSecond.disabled = true;
				timeInputHour.style.display = 'none';
				timeInputMinute.style.display = 'none';
				timeInputSecond.style.display = 'none';
				timeInputButton.style.display = 'none';
			}
		});
	}

	//通过时间输入框实现时分秒设置
	function setTimeFromInput() {
		const hours = parseInt(document.getElementById('time-input-hour').value, 10);
		const minutes = parseInt(document.getElementById('time-input-minute').value, 10);
		const seconds = parseInt(document.getElementById('time-input-second').value, 10);

		realTime = false;
		vtime = new vTime(hours, minutes, seconds, 0);
	}
	document.getElementById('time-input-button').addEventListener('click', setTimeFromInput);
};
