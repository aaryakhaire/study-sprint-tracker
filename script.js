let seconds = 0;
let interval = null;

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

document.getElementById("stopBtn").onclick = () => {
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
};

function updateTimer() {
  let h = Math.floor(seconds / 3600);
  let m = Math.floor((seconds % 3600) / 60);
  let s = seconds % 60;

  timerDisplay.textContent =
    `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function pad(n) {
  return n.toString().padStart(2, "0");
}

function updateHistory() {
  historyList.innerHTML = "";
  sessions.slice(-5).reverse().forEach(session => {
    const li = document.createElement("li");
    li.textContent = `${session.date} - ${session.minutes} mins`;
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
