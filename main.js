window.addEventListener('DOMContentLoaded', () => {
	// 返回主页面时保持之前设置的时间;
	var curTime = JSON.parse(sessionStorage.getItem('now'));
	if (curTime) {
		console.log(curTime);
		vtime = new vTime(parseInt(curTime[0]), parseInt(curTime[1]), parseInt(curTime[2]), parseInt(curTime[3]));
		realTime = false;
		pm = curTime[0] >= 12 ? 1 : 0;
	}
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

// 定义是否是p.m
let pm = 0;

var vtime = new vTime(0, 0, 0, 0);

// 更新时钟
function updateClock() {
	// 当没有拖动时执行
	if (!dragHand) {
		// 更新虚拟时间
		if (realTime) {
			vtime.copyFrom(new Date());
			pm = vtime.getHours() >= 12 ? 1 : 0;
		} else {
			// 注意更新是否是pm
			let h1 = vtime.getHours();
			vtime.addMilliseconds(interval);
			let h2 = vtime.getHours();
			if (h1 + h2 == 23) {
				pm = 1 - pm;
			}
		}
		// 获取当前时间
		const now = realTime ? new Date() : vtime; // TODO
		const hours = now.getHours() % 12;
		const minutes = now.getMinutes();
		const seconds = parseFloat(now.getSeconds());
		const milliseconds = parseFloat(now.getMilliseconds());

		sessionStorage.setItem('now', JSON.stringify([hours + pm * 12, minutes, seconds, milliseconds]));

		//更新数字时间显示
		updateDigit('digit-hour', hours + pm * 12);
		updateDigit('digit-minute', minutes);
		updateDigit('digit-second', seconds);

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
	}
}

//设置数字变化的动画效果
function updateDigit(id, value) {
	const digit = document.getElementById(id);
	const newValue = String(value).padStart(2, '0');
	if (digit.textContent !== newValue) {
		digit.classList.add('change');
		setTimeout(() => digit.classList.remove('change'), 500);
		digit.textContent = newValue;
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
			console.log('move');

			let dx = event.clientX - (clock.getBoundingClientRect().left + 250);
			let dy = event.clientY - (clock.getBoundingClientRect().top + 250);
			let deg = slopeToDeg(dx, dy);
			let ddeg = 0;

			let degs = [hourDeg, minuteDeg, secondDeg];

			ddeg = deg - degs[dragHand - 1];

			// 特殊情况处理，度过0
			let clockwise = 0;
			if (0 <= deg && deg < 30 && 330 < degs[dragHand - 1] && degs[dragHand - 1] < 360) {
				clockwise = 1;
			} else if (330 < deg && deg < 360 && 0 <= degs[dragHand - 1] && degs[dragHand - 1] < 30) {
				clockwise = -1;
			}

			let linkage = handLinkage(ddeg, dragHand, clockwise);

			for (let i = 0; i < 3; i++) {
				degs[i] += linkage[i];
				degs[i] = mod(degs[i], 360);
			}
			hourDeg = degs[0];
			minuteDeg = degs[1];
			secondDeg = degs[2];

			// 获取dom树节点
			const hourHand = document.getElementById('hour-hand');
			const minuteHand = document.getElementById('minute-hand');
			const secondHand = document.getElementById('second-hand');

			//更新时针指针角度
			hourHand.setAttribute('transform', `rotate(${hourDeg}, 250, 250)`);
			minuteHand.setAttribute('transform', `rotate(${minuteDeg}, 250, 250)`);
			secondHand.setAttribute('transform', `rotate(${secondDeg}, 250, 250)`);

			updateVtime();
		}
	});

	clock.addEventListener('mouseup', () => {
		console.log('up');
		if (dragHand) {
			dragHand = 0;
			realTime = false;
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
			res = [ddeg - 360 * clockwise, mod(ddeg * 12, 360), mod(ddeg * 12 * 60, 360)];
			break;
		case 2:
			res = [ddeg / 12, ddeg - 360 * clockwise, mod(ddeg * 60, 360)];
			break;
		case 3:
			res = [ddeg / 12 / 60, ddeg / 60, ddeg - 360 * clockwise];
			break;
		default:
			break;
	}
	return res;
}

// 根据钟表指针更新虚拟时间
function updateVtime() {
	let h1 = vtime.getHours();

	let hours = Math.floor(hourDeg / 30);
	let minute = Math.floor(minuteDeg / 6);
	let second = Math.floor(secondDeg / 6);
	let milliseconds = Math.round((secondDeg / 6 - second) * 1000);

	// 边界情况处理
	if ((h1 == 1 || h1 == 13) && vtime.getMinutes() == 0 && vtime.getSeconds() == 0 && vtime.getMilliseconds() == 0) {
		h1 -= 1;
	}

	if ((h1 % 12) + hours == 11 && Math.max(h1 % 12, hours) == 11) {
		// 更新pm
		pm = 1 - pm;
	}

	vtime = new vTime(hours + pm * 12, minute, second, milliseconds);
	vtime.addMilliseconds(0);
}

function mod(n, m) {
	return ((n % m) + m) % m;
}

//根据选择启用不同功能
window.onload = function () {
	// var curTime = JSON.parse(localStorage.getItem('now'));
	// if (curTime) {
	// 	vtime = new vTime(parseInt(curTime[0]), parseInt(curTime[1]), parseInt(curTime[2]), parseInt(curTime[3]));
	// 	realTime = false;
	// }
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
			} else if (selectedFunction === 'timer') {
				location.href = 'timer.html';
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
		// const selectedFunction = event.target.value;
		const timeInputHour = document.getElementById('time-input-hour');
		const timeInputMinute = document.getElementById('time-input-minute');
		const timeInputSecond = document.getElementById('time-input-second');
		// const timeInputButton = document.getElementById('time-input-button');

		timeInputHour.addEventListener('input', function (e) {
			console.log('inputhour');
			if (e.target.value < 0) {
				e.target.value = 0;
			} else if (e.target.value > 23) {
				e.target.value = 23;
			}
		});

		timeInputMinute.addEventListener('input', function (e) {
			if (e.target.value < 0) {
				e.target.value = 0;
			} else if (e.target.value > 59) {
				e.target.value = 59;
			}
		});

		timeInputSecond.addEventListener('input', function (e) {
			if (e.target.value < 0) {
				e.target.value = 0;
			} else if (e.target.value > 59) {
				e.target.value = 59;
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

		// 同时更改pm
		pm = hours >= 12 ? 1 : 0;
		//存储当前时间
		sessionStorage.setItem('now', JSON.stringify([hours, minutes, seconds, 0]));
	}
	document.getElementById('time-input-button').addEventListener('click', setTimeFromInput);
};
