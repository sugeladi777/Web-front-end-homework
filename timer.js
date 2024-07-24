let update;

function handleStart() {
	//禁止输入
	document.getElementById('hour').disabled = true;
	document.getElementById('minute').disabled = true;
	document.getElementById('second').disabled = true;

	const start = document.getElementById('start-button');

	var timerTime = JSON.parse(localStorage.getItem('timerTime'));
	if (timerTime) timerTime = new vTime(timerTime[0], timerTime[1], timerTime[2], timerTime[3]);
	var pauseTime = JSON.parse(localStorage.getItem('pauseTime'));
	if (pauseTime) pauseTime = new vTime(pauseTime[0], pauseTime[1], pauseTime[2], pauseTime[3]);

	const hour = parseInt(document.getElementById('hour').value);
	const minute = parseInt(document.getElementById('minute').value);
	const second = parseInt(document.getElementById('second').value);
	let millisecond = 0;

	if (pauseTime && (pauseTime.getHours() > 0 || pauseTime.getMinutes() > 0 || pauseTime.getSeconds() > 0 || pauseTime.getMilliseconds() > 0)) {
		millisecond = pauseTime.getMilliseconds();
		timerTime = pauseTime;
		localStorage.removeItem('pauseTime');
	}
	if (hour <= 0 && minute <= 0 && second <= 0) {
		alert('请输入大于零的正确时间');
		return;
	}
	var timerTime = new vTime(hour, minute, second, millisecond);
	localStorage.setItem('timerTime', JSON.stringify([hour, minute, second, millisecond]));
	localStorage.removeItem('pauseTime');
	// 获取输入的时间,并将其存储到本地
	if (!timerTime || (hour == 0 && minute == 0 && second == 0)) {
	}
	update = setInterval(updateClock, interval, timerTime);
	// 改变按钮文字，移除事件监听器
	start.textContent = '暂停';
	start.removeEventListener('click', handleStart);
	start.addEventListener('click', handlePause);

	if (!pauseTime && timerTime) {
		//储存倒计时总时间
		localStorage.setItem(
			'sumTime',
			timerTime.getHours() * 3600 + timerTime.getMinutes() * 60 + timerTime.getSeconds() + timerTime.getMilliseconds() / 1000
		);
	}
}

function handlePause() {
	const start = document.getElementById('start-button');

	var timerTime = JSON.parse(localStorage.getItem('timerTime'));
	if (timerTime) {
		timerTime = new vTime(timerTime[0], timerTime[1], timerTime[2], timerTime[3]);
		localStorage.setItem(
			'pauseTime',
			JSON.stringify([timerTime.getHours(), timerTime.getMinutes(), timerTime.getSeconds(), timerTime.getMilliseconds()])
		);
	}

	start.textContent = '开始计时';
	localStorage.removeItem('timerTime');

	clearInterval(update);
	start.removeEventListener('click', handlePause); // 移除事件监听器
	start.addEventListener('click', handleStart); // 添加事件监听器
}

function handleReset() {
	//启用输入
	document.getElementById('hour').disabled = false;
	document.getElementById('minute').disabled = false;
	document.getElementById('second').disabled = false;

	handlePause();
	localStorage.removeItem('timerTime');
	localStorage.removeItem('pauseTime');
	localStorage.removeItem('sumTime');
	location.reload();
}

// 定义虚拟时间
// 与Date()具有一些相同的接口
window.addEventListener('DOMContentLoaded', () => {
	// 初始化定时器
	var timerTime = JSON.parse(localStorage.getItem('timerTime'));
	if (timerTime) timerTime = new vTime(timerTime[0], timerTime[1], timerTime[2], timerTime[3]);
	var pauseTime = JSON.parse(localStorage.getItem('pauseTime'));
	if (pauseTime) pauseTime = new vTime(pauseTime[0], pauseTime[1], pauseTime[2], pauseTime[3]);

	//如果存在先前暂停时间，或者计时器时间为0，则显示开始按钮
	if (
		pauseTime ||
		!timerTime ||
		(timerTime.getHours() == 0 && timerTime.getMinutes() == 0 && timerTime.getSeconds() == 0 && timerTime.getMilliseconds() == 0)
	) {
		if (pauseTime) {
			document.getElementById('hour').value = pauseTime.getHours();
			document.getElementById('minute').value = pauseTime.getMinutes();
			document.getElementById('second').value = pauseTime.getSeconds();
			// 更新表盘画面
			pauseTime.addMilliseconds(10);
			updateClock(pauseTime);
		}
		const start = document.getElementById('start-button');
		start.addEventListener('click', handleStart);
	} else {
		const pause = document.getElementById('start-button');
		pause.textContent = '暂停';

		document.getElementById('hour').value = timerTime.getHours();
		document.getElementById('minute').value = timerTime.getMinutes();
		document.getElementById('second').value = timerTime.getSeconds();
		update = setInterval(updateClock, interval, timerTime);

		pause.addEventListener('click', handlePause);
	}

	// 点击按钮跳转网页
	document.getElementById('back').addEventListener('click', function () {
		window.location.href = './main.html';
	});

	// 点击重置按钮重置钟表
	const reset = document.getElementById('reset-button');
	reset.addEventListener('click', handleReset);
	// 为输入框添加输入事件
	const inputHour = document.getElementById('hour');
	const inputMinute = document.getElementById('minute');
	const inputSecond = document.getElementById('second');
	inputHour.addEventListener('input', function (e) {
		if (e.target.value < 0) {
			e.target.value = 0;
		} else if (e.target.value > 99) {
			e.target.value = 99;
		}
	});
	inputMinute.addEventListener('input', function (e) {
		if (e.target.value < 0) {
			e.target.value = 0;
		} else if (e.target.value > 59) {
			e.target.value = 59;
		}
	});
	inputSecond.addEventListener('input', function (e) {
		if (e.target.value < 0) {
			e.target.value = 0;
		}

		// TODO: 点击跳转网页
	});
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

	time.decreaseMilliseconds(interval);
	localStorage.setItem('timerTime', JSON.stringify([time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds()]));
	//倒计时结束
	if (time.getHours() == 0 && time.getMinutes() == 0 && time.getSeconds() == 0 && time.getMilliseconds() == 0) {
		handleReset();
	}

	// 获取当前时间
	const now = time;
	const hours = now.getHours();
	const minutes = now.getMinutes();
	const seconds = parseFloat(now.getSeconds());
	const milliseconds = parseFloat(now.getMilliseconds());

	//更新数字显示
	document.getElementById('hour').value = hours;
	document.getElementById('minute').value = minutes;
	document.getElementById('second').value = seconds;

	// 获取dom树节点
	// const hourHand = document.getElementById('hour-hand');
	// const minuteHand = document.getElementById('minute-hand');
	const secondHand = document.getElementById('second-hand');
	const curTime = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;

	// 获取时钟指针角度
	sumTime = parseFloat(localStorage.getItem('sumTime'));
	secondDeg = 360 * (curTime / sumTime);

	//更新时针指针角度
	// hourHand.setAttribute('transform', `rotate(${hourDeg}, 250, 250)`);
	// minuteHand.setAttribute('transform', `rotate(${minuteDeg}, 250, 250)`);
	secondHand.setAttribute('transform', `rotate(${secondDeg}, 250, 250)`);
}
