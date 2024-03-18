let currentPhase = 0; // 현재 단계를 추적하는 변수
let timerInterval; // setInterval을 저장할 변수
let isPaused = false; // 타이머 일시정지 상태
let phases = []; // 타이머의 모든 단계 저장
let isWorkout = true;



document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('start-btn').addEventListener('click', function() {
      startTimer();
      this.style.display = 'none';
      document.getElementById('pause-btn').style.display = '';
  });

  document.getElementById('pause-btn').addEventListener('click', function() {
      togglePause(true);
  });

  document.getElementById('resume-btn').addEventListener('click', function() {
      togglePause(false);
  });
});


function startTimer() {
  isPaused = false; // 일시정지 상태 해제
  currentPhase = 0; // 현재 단계 초기화

  // 입력값 가져오기 및 phases 배열 초기화
  const prepareTime = parseInt(document.getElementById('prepare-time').value) || 0;
  const workTime = parseInt(document.getElementById('work-time').value) || 0;
  const restTime = parseInt(document.getElementById('rest-time').value) || 0;
  const totalRounds = parseInt(document.getElementById('rounds').value) || 0;
  const totalCycles = parseInt(document.getElementById('cycles').value) || 0;
  const restBetweenCycles = parseInt(document.getElementById('rest-between-cycles').value) || 0;
  const cooldownTime = parseInt(document.getElementById('cooldown-time').value) || 0;

  phases = buildPhases(prepareTime, workTime, restTime, totalRounds, totalCycles, restBetweenCycles, cooldownTime);
  createProgressBars(totalRounds, totalCycles);
  startPhase();
}

function buildPhases(prepareTime, workTime, restTime, totalRounds, totalCycles, restBetweenCycles, cooldownTime) {
  const tempPhases = [];
  tempPhases.push({ label: '준비', time: prepareTime, type: 'prepare' });
  for (let cycle = 0; cycle < totalCycles; cycle++) {
      for (let round = 0; round < totalRounds; round++) {
          tempPhases.push({ label: `운동🔥 ${cycle + 1}-${round + 1}`, time: workTime, type: 'work' });
          if (round < totalRounds - 1) {
              tempPhases.push({ label: '휴식😤', time: restTime, type: 'rest' });
          }
      }
      if (cycle < totalCycles - 1) {
          tempPhases.push({ label: '수분보충💧', time: restBetweenCycles, type: 'cycleRest' });
      }
  }
  tempPhases.push({ label: '쿨 다운', time: cooldownTime, type: 'cooldown' });

  return tempPhases;
}

function createProgressBars(rounds, cycles) {
  const container = document.getElementById('progress-bars-container');
  container.innerHTML = ''; // 이전 프로그레스 바들 제거

  const totalBars = cycles * rounds;
  let barWidth = container.offsetWidth / totalBars - 5; // 각 프로그레스 바 사이의 간격을 고려한 너비 계산

  // 전체 화면 크기에 따른 최소 프로그레스 바 너비 설정
  const minBarWidth = 50; // 최소 프로그레스 바 너비를 30px로 가정
  if (barWidth < minBarWidth) {
      barWidth = minBarWidth;
      // 컨테이너의 너비를 새롭게 계산된 전체 프로그레스 바 너비에 맞춰 조정
      container.style.width = `${(barWidth + 5) * totalBars}px`; // 프로그레스 바와 간격 고려
  }

  for (let cycle = 0; cycle < cycles; cycle++) {
      for (let round = 0; round < rounds; round++) {
          const progressBarContainer = document.createElement('div');
          progressBarContainer.className = 'progress-bar';
          progressBarContainer.style.width = `${barWidth}px`; // 동적으로 계산된 너비 적용
          const progressBar = document.createElement('div');
          progressBar.className = 'progress';
          progressBarContainer.appendChild(progressBar);
          container.appendChild(progressBarContainer);
      }

      // 사이클 간격 추가 - 사이클 사이에 작은 간격 추가 (옵션)
      if (cycle < cycles - 1) {
          const cycleGap = document.createElement('div');
          cycleGap.className = 'cycle-gap';
          container.appendChild(cycleGap);
      }
  }
}


function startPhase() {
  if (currentPhase >= phases.length) {
    clearInterval(timerInterval);
    alert('타이머 완료!');
    document.getElementById('start-btn').style.display = ''; // 시작 버튼 다시 보이기
    document.getElementById('pause-btn').style.display = 'none'; // 일시정지 버튼 숨기기
    document.getElementById('resume-btn').style.display = 'none'; // 재개 버튼 숨기기
    return;
  }

  const phase = phases[currentPhase];
  document.getElementById('timer-label').textContent = phase.label;
  let timeLeft = phase.time;
  updateTimerDisplay(timeLeft);

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!isPaused) {
      timeLeft--;
      updateTimerDisplay(timeLeft);

      if (phase.type === 'work') {
        const progressBarIndex = Math.floor((currentPhase - 1) / 2);
        const progressPercentage = ((phase.time - timeLeft) / phase.time) * 100;
        updateProgressBar(progressBarIndex, progressPercentage);
      }

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        currentPhase++;
        startPhase(); // 다음 단계로 이동
      }
    }
  }, 1000);

  // 운동 중, 휴식 중, 싸이클 휴식에 따라 배경색 변경
  if (phase.type === 'work') {
    isWorkout = true;
  } else if (phase.type === 'rest' || phase.type === 'cycleRest') {
    isWorkout = false;
  }

  changeBackgroundColor();
}

function togglePause(paused) {
  isPaused = paused;
  document.getElementById('pause-btn').style.display = paused ? 'none' : '';
  document.getElementById('resume-btn').style.display = paused ? '' : 'none';
}

function updateTimerDisplay(timeLeft) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('time-left').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateProgressBar(index, percentage) {
    const progressBar = document.getElementsByClassName('progress')[index];
    progressBar.style.width = `${percentage}%`;
}

function changeBackgroundColor() {
  if (isWorkout) {
    document.body.style.backgroundColor = '#39ff14'; // Workout background color: orange
  } else {
    document.body.style.backgroundColor = '#ff7f50'; // Rest background color: sky blue
  }
}

changeBackgroundColor();