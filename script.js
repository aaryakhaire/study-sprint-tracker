let seconds = 0;
let interval = null;
let pomodoroMax = 1500;

const beep = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");

const timerDisplay = document.getElementById("timer");
const historyList = document.getElementById("history");
const totalDisplay = document.getElementById("total");
const streakDisplay = document.getElementById("streak");

let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
let streak = JSON.parse(localStorage.getItem("streak")) || 0;

updateHistory();
updateStats();

document.getElementById("startBtn").onclick = () => {
  if (interval) return;
  interval = setInterval(() => {
    seconds++;
    updateTimer();
  }, 1000);
};

document.getElementById("stopBtn").onclick = stopSession;

document.getElementById("resetBtn").onclick = () => {
  clearInterval(interval);
  interval = null;
  seconds = 0;
  updateTimer();
};

document.getElementById("pomodoroBtn").onclick = () => {
  clearInterval(interval);
  seconds = pomodoroMax;
  interval = setInterval(() => {
    seconds--;
    updateTimer();

    if (seconds <= 0) {
      clearInterval(interval);
      interval = null;
      beep.play();
      alert("Pomodoro complete!");
    }
  }, 1000);
};

document.getElementById("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "study-data.json";
  a.click();
};

function stopSession() {
  if (!interval) return;
  clearInterval(interval);
  interval = null;

  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) {
    sessions.push({
      date: new Date().toDateString(),
      minutes
    });

    localStorage.setItem("sessions", JSON.stringify(sessions));
    updateStreak();
    updateHistory();
    updateStats();
  }

  seconds = 0;
  updateTimer();
}

function updateTimer() {
  let h = Math.floor(seconds / 3600);
  let m = Math.floor((seconds % 3600) / 60);
  let s = seconds % 60;

  timerDisplay.textContent =
    `${pad(h)}:${pad(m)}:${pad(s)}`;

  let percent = ((pomodoroMax - seconds) / pomodoroMax) * 100;
  document.getElementById("bar").style.width = percent + "%";
}

function pad(n) {
  return n.toString().padStart(2, "0");
}

function updateHistory() {
  historyList.innerHTML = "";

  sessions.slice(-5).reverse().forEach((session, index) => {
    const li = document.createElement("li");
    li.textContent = `${session.date} - ${session.minutes} mins`;

    const del = document.createElement("button");
    del.textContent = "X";
    del.onclick = () => {
      sessions.splice(sessions.length - 1 - index, 1);
      localStorage.setItem("sessions", JSON.stringify(sessions));
      updateHistory();
      updateStats();
    };

    li.appendChild(del);
    historyList.appendChild(li);
  });
}

function updateStats() {
  const today = new Date().toDateString();

  const totalToday = sessions
    .filter(s => s.date === today)
    .reduce((sum, s) => sum + s.minutes, 0);

  totalDisplay.textContent = totalToday;
  streakDisplay.textContent = streak;
}

function updateStreak() {
  const today = new Date().toDateString();
  const lastSession = sessions[sessions.length - 2];

  if (!lastSession) {
    streak = 1;
  } else {
    const lastDate = new Date(lastSession.date);
    const diff =
      (new Date(today) - lastDate) / (1000 * 60 * 60 * 24);

    if (diff === 1) streak++;
    else if (diff > 1) streak = 1;
  }

  localStorage.setItem("streak", JSON.stringify(streak));
}
