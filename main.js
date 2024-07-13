function updateClock() {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const hourHand = document.getElementById('hour-hand');
    const minuteHand = document.getElementById('minute-hand');
    const secondHand = document.getElementById('second-hand');

    const hourDeg = (360 / 12) * hours + (360 / 12) * (minutes / 60);
    const minuteDeg = (360 / 60) * minutes;
    const secondDeg = (360 / 60) * seconds;

    hourHand.setAttribute('transform', `rotate(${hourDeg}, 250, 250)`);
    minuteHand.setAttribute('transform', `rotate(${minuteDeg}, 250, 250)`);
    secondHand.setAttribute('transform', `rotate(${secondDeg}, 250, 250)`);

  
  }

  setInterval(updateClock, 1000); // 每秒更新一次时钟
  updateClock(); // 初始加载时钟