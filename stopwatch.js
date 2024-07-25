var update; //更新时间函数对应的定时器ID
function handleStart() {
	const start = document.getElementById('start-button');
	stopWatchTime = JSON.parse(sessionStorage.getItem('stopWatchTime'));
	var vtime = new vTime(stopWatchTime[0], stopWatchTime[1], stopWatchTime[2], stopWatchTime[3]);
	update = setInterval(updateClock, interval, vtime);
	start.textContent = '暂停';
	start.removeEventListener('click', handleStart); // 移除事件监听器
	start.addEventListener('click', handlePause); // 添加事件监听器
}
function handlePause() {
	const start = document.getElementById('start-button');
	start.textContent = '开始';
	clearInterval(update);
	start.removeEventListener('click', handlePause); // 移除事件监听器
	start.addEventListener('click', handleStart); // 添加事件监听器
}

window.addEventListener('DOMContentLoaded', () => {
	var stopWatchTime = [0, 0, 0, 0];
	sessionStorage.setItem('stopWatchTime', JSON.stringify(stopWatchTime));

	// 点击开始按钮更新钟表
	const start = document.getElementById('start-button');
	start.addEventListener('click', handleStart);
	// 为返回按钮添加点击事件
	document.getElementById('back').addEventListener('click', function () {
		window.location.href = './main.html';
	});
	// 点击重置按钮重置钟表
	const reset = document.getElementById('reset-button');
	reset.addEventListener('click', function handleReset() {
		handlePause();
		sessionStorage.setItem('stopWatchTime', JSON.stringify([0, 0, 0, 0]));
		const minuteHand = document.getElementById('minute-hand');
		const secondHand = document.getElementById('second-hand');
		minuteHand.setAttribute('transform', `rotate(${0}, 250, 170)`);
		secondHand.setAttribute('transform', `rotate(${0}, 250, 250)`);
		//数字归零
		const timeNum = document.getElementById('time');
		timeNum.textContent = `00:00.00`;
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
	sessionStorage.setItem('stopWatchTime', JSON.stringify([hours, minutes, seconds, milliseconds]));
	// 获取dom树节点
	const minuteHand = document.getElementById('minute-hand');
	const secondHand = document.getElementById('second-hand');

	// 获取时钟指针角度
	hourDeg = (360 / 12) * (hours + minutes / 60 + seconds / 3600 + milliseconds / 3600000);
	minuteDeg = (360 / 60) * (minutes + seconds / 60 + milliseconds / 60000);
	secondDeg = (360 / 60) * (seconds + milliseconds / 1000);

	//更新时针指针角度
	minuteHand.setAttribute('transform', `rotate(${minuteDeg}, 250, 170)`);
	secondHand.setAttribute('transform', `rotate(${secondDeg}, 250, 250)`);
}
