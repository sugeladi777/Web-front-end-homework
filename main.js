function updateClock() {
  // 获取当前时间
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = parseFloat(now.getSeconds());
  const milliseconds = parseFloat(now.getMilliseconds());

  // 获取dom树节点
  const hourHand = document.getElementById("hour-hand");
  const minuteHand = document.getElementById("minute-hand");
  const secondHand = document.getElementById("second-hand");

  //获取时钟指针角度
  const hourDeg =
    (360 / 12) *
    (hours + minutes / 60 + seconds / 3600 + milliseconds / 3600000);
  const minuteDeg =
    (360 / 60) * (minutes + seconds / 60 + milliseconds / 60000);
  const secondDeg = (360 / 60) * (seconds + milliseconds / 1000);

  //更新时针指针角度
  hourHand.setAttribute("transform", `rotate(${hourDeg}, 250, 250)`);
  minuteHand.setAttribute("transform", `rotate(${minuteDeg}, 250, 250)`);
  secondHand.setAttribute("transform", `rotate(${secondDeg}, 250, 250)`);

  //检查闹钟是否响起
  alarms = JSON.parse(localStorage.getItem("alarmClocks"));
  if (alarms) {
    alarms.forEach(function (alarm) {
      if (
        alarm.hour == now.getHours() &&
        alarm.minute == minutes &&
        seconds.toFixed(0) == 0
      ) {
        alert("闹钟响了:" + alarm.name);
      }
    });
  }
}

setInterval(updateClock, 10); // 每10毫秒更新一次时钟，因此时钟显示为100帧
updateClock(); // 初始加载时钟
