//添加闹钟到本地存储,参数为小时，分钟，闹钟名
function addAlarm(h, m, n) {
	alarms = JSON.parse(localStorage.getItem('alarmClocks'));
	if (!alarms) alarms = [];

	let new_alarm = { hour: h, minute: m, name: n };
	alarms.push(new_alarm);
	// 按小时和分钟对闹钟数组进行排序
	alarms.sort(function (a, b) {
		if (parseInt(a.hour, 10) > parseInt(b.hour, 10)) {
			return 1;
		}
		if (parseInt(a.hour, 10) < parseInt(b.hour, 10)) {
			return -1;
		}
		if (parseInt(a.minute, 10) > parseInt(b.minute, 10)) {
			return 1;
		}
		if (parseInt(a.minute, 10) < parseInt(b.minute, 10)) {
			return -1;
		}

		return 0;
	});
	localStorage.setItem('alarmClocks', JSON.stringify(alarms));
}

//格式化时间
function formatTime(hours, minutes) {
	// 格式化小时、分钟
	hours = hours < 10 ? '0' + hours : hours;
	minutes = minutes < 10 ? '0' + minutes : minutes;

	// 返回格式化后的时间字符串
	return hours + ':' + minutes;
}

//展示闹钟
function displayAlarms() {
	alarms = JSON.parse(localStorage.getItem('alarmClocks'));
	let alarm_list = document.getElementById('alarm-list');
	if (alarm_list.innerHTML) alarm_list.innerHTML = '';
	// 遍历闹钟数组，创建闹钟元素
	if (alarms) {
		alarms.forEach(function (alarm) {
			// 创建闹钟元素,显示小时和分钟
			let alarm_item = document.createElement('div');
			alarm_item.setAttribute('class', 'alarm-item');
			alarm_item.innerHTML = formatTime(alarm.hour, alarm.minute);
			alarm_list.appendChild(alarm_item);
			// 创建闹钟名、删除按钮和添加按钮
			let alarm_name = document.createElement('p');
			alarm_name.setAttribute('class', 'alarm-name');
			alarm_name.innerHTML = alarm.name;
			alarm_item.appendChild(alarm_name);
			let alarm_delete = document.createElement('button');
			alarm_delete.setAttribute('class', 'delete-button');
			alarm_delete.innerHTML = '删除';
			alarm_item.appendChild(alarm_delete);
			// 删除按钮的点击事件
			alarm_delete.addEventListener('click', function () {
				alarms = alarms.filter(function (a) {
					return a.hour != alarm.hour || a.minute != alarm.minute;
				});
				localStorage.setItem('alarmClocks', JSON.stringify(alarms));
				displayAlarms();
			});
		});
	}
}

window.onload = function () {
	// 为添加闹钟按钮添加点击事件
	document.getElementById('add-button').addEventListener('click', function () {
		let hour = parseInt(document.getElementById('hour').value, 10);
		let minute = parseInt(document.getElementById('minute').value, 10);
		let name = document.getElementById('name').value;
		//检查输入的时间是否已有闹钟
		alarms = JSON.parse(localStorage.getItem('alarmClocks'));
		if (
			alarms &&
			alarms.some(function (alarm) {
				return alarm.hour == hour && alarm.minute == minute;
			})
		) {
			showNonBlockingAlert('该时间已有闹钟');
			return;
		}
		// 检查输入是否为空
		if (!hour || !minute || !name) {
			showNonBlockingAlert('请输入时间和闹钟名称');
			return;
		}
		addAlarm(hour, minute, name);
		displayAlarms();
	});
	// 初始化闹钟界面
	displayAlarms();
	// 为返回按钮添加点击事件
	document.getElementById('back').addEventListener('click', function () {
		window.location.href = './main.html';
	});
	// 为输入框添加输入事件
	const inputHour = document.getElementById('hour');
	const inputMinute = document.getElementById('minute');
	inputHour.addEventListener('input', function (e) {
		if (e.target.value < 0) {
			e.target.value = 0;
		} else if (e.target.value > 23) {
			e.target.value = 23;
		}
	});
	inputMinute.addEventListener('input', function (e) {
		if (e.target.value < 0) {
			e.target.value = 0;
		} else if (e.target.value > 59) {
			e.target.value = 59;
		}
	});
};
