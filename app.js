/**
 * 오늘 괜찮았어 - Application Logic & Emotional AI Parser Engine
 * ------------------------------------------------------------------
 * 100% 클라이언트 환경에서 포근하고 정교한 사용자 인터페이스와,
 * 사용자의 입력(자책 단어, 한 일)을 완벽히 읽고 다정한 논리로 맞춤 재해석해 주는
 * 감성 텍스트 분석 엔진을 포함하고 있습니다.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  let appState = {
    currentMood: 'good', // default
    diaries: JSON.parse(localStorage.getItem('today_was_okay_diaries')) || [],
    currentAnalysis: null,
    theme: localStorage.getItem('today_was_okay_theme') || 'light'
  };

  // ==========================================================================
  // DOM ELEMENTS
  // ==========================================================================
  const screens = {
    main: document.getElementById('screen-main'),
    write: document.getElementById('screen-write'),
    loading: document.getElementById('screen-loading'),
    result: document.getElementById('screen-result'),
    history: document.getElementById('screen-history')
  };

  const themeToggle = document.getElementById('theme-toggle');
  const mainMascot = document.getElementById('main-mascot');
  const dynamicGreeting = document.getElementById('dynamic-greeting');
  const moodButtons = document.querySelectorAll('.mood-btn');
  
  // Navigation Buttons
  const btnGoWrite = document.getElementById('btn-go-write');
  const btnGoHistory = document.getElementById('btn-go-history');
  const btnWriteBack = document.getElementById('btn-write-back');
  const btnHistoryBack = document.getElementById('btn-history-back');
  const btnResultHome = document.getElementById('btn-result-home');
  const btnSaveDiary = document.getElementById('btn-save-diary');
  const btnHistoryFirstWrite = document.getElementById('btn-history-first-write');

  // Diary Input Form
  const diaryForm = document.getElementById('diary-form');
  const inputPlan = document.getElementById('input-plan');
  const inputActual = document.getElementById('input-actual');
  const inputRegret = document.getElementById('input-regret');
  
  // Character character limits
  const charPlan = document.getElementById('char-plan');
  const charActual = document.getElementById('char-actual');
  const charRegret = document.getElementById('char-regret');

  // Loading Screen Elements
  const loadingMsg = document.getElementById('loading-msg');

  // Results Screen Elements
  const resAccomplished = document.getElementById('res-accomplished');
  const resCriticism = document.getElementById('res-criticism');
  const resReason = document.getElementById('res-reason');
  const resSuggestion = document.getElementById('res-suggestion');
  const resAffirmation = document.getElementById('res-affirmation');

  // History Screen Elements
  const historyContainer = document.getElementById('history-items-container');
  const statsTotalCount = document.getElementById('stats-total-count');
  
  // Chart fill bars
  const bars = {
    sunny: document.getElementById('bar-sunny'),
    good: document.getElementById('bar-good'),
    tired: document.getElementById('bar-tired'),
    sad: document.getElementById('bar-sad'),
    anxious: document.getElementById('bar-anxious')
  };
  const barTxts = {
    sunny: document.getElementById('bar-txt-sunny'),
    good: document.getElementById('bar-txt-good'),
    tired: document.getElementById('bar-txt-tired'),
    sad: document.getElementById('bar-txt-sad'),
    anxious: document.getElementById('bar-txt-anxious')
  };

  // Modal View Elements
  const historyModal = document.getElementById('history-modal');
  const btnModalClose = document.getElementById('btn-modal-close');
  const btnModalDelete = document.getElementById('btn-modal-delete');
  const modalMoodEmoji = document.getElementById('modal-mood-emoji');
  const modalDateString = document.getElementById('modal-date-string');
  const modalAccomplished = document.getElementById('modal-accomplished');
  const modalCriticism = document.getElementById('modal-criticism');
  const modalReason = document.getElementById('modal-reason');
  const modalSuggestion = document.getElementById('modal-suggestion');
  const modalAffirmation = document.getElementById('modal-affirmation');

  let activeModalId = null;

  // ==========================================================================
  // DATA DICTIONARIES (Warm Emotional Copywriting)
  // ==========================================================================
  const randomGreetings = [
    "어서와요! 오늘 하루 마음속에 무겁게 얹힌 짐들을 저와 같이 찬찬히 내려놓아 봐요. ☁️",
    "오늘 혹시 스스로를 가혹하게 나무라진 않았나요? 힘든 일도, 속상한 일도 다 들어줄게요. 🌸",
    "완벽하지 않아도 오늘 당신은 세상을 든든히 살아냈어요. 기특한 나를 안아줄 준비를 해볼까요? 💛",
    "바쁘게 달리느라 지친 당신을 위한 작은 피난처랍니다. 숨 한번 깊게 들이마시고 편하게 말씀해 주세요. 🍃",
    "구름 위에 누워 쉬는 것처럼 아늑하고 평온한 시간. 오늘 당신의 날씨를 살며시 알려주세요. 🌤️"
  ];

  const moodGreetings = {
    sunny: "오! 오늘 날씨 맑음인가요? 기분 좋은 일이 있었다니 저도 몽글몽글 행복해지네요! ☀️ 어떤 기쁨이 있었는지 얼른 공유해 줘요.",
    good: "포근하고 차분한 오늘이군요. 무탈하고 평화로운 하루 역시 정말 소중한 성취랍니다. 🌤️ 기분 좋은 마음으로 하루를 되돌아봐요.",
    tired: "몸과 마음이 무척 지치고 묵직한 상태군요... ☁️ 오늘은 애써 힘내지 않아도 괜찮아요. 지친 하루를 토닥토닥 다정하게 감싸 안아 줄게요.",
    sad: "마음의 비가 촉촉이 내리는 날이네요. 🌧️ 눈물 한 방울, 슬픔 한 자락 다 괜찮으니 속상했던 일들 편안하게 적고 다 털어버려요.",
    anxious: "가슴이 쿵쾅대거나 머릿속이 엉켜 불안하군요. ⛈️ 걱정 마요, 내가 안전한 우산이 되어줄게요. 생각나는 것부터 천천히 내려놓아요."
  };

  const loadingMessages = [
    "오늘 하루를 소중히 들여다보는 중이에요...",
    "당신이 지키려 애쓴 흔적 속에서 숨겨진 보석들을 찾고 있어요...",
    "너무 높았던 스스로의 기준을 내려놓고, 있는 그대로를 비추는 중...",
    "구름이가 당신의 오늘을 위해 가장 다정한 위로의 근거를 모으고 있어요..."
  ];

  const affirmationsList = [
    "완벽하지 않아도 하루는 충분히 의미 있어. 이미 너는 최선을 다해 버텨냈으니까. 🌸",
    "오늘 모든 계획을 이루지 못했다고 해서 내일까지 지칠 필요는 없어. 하루의 빈틈은 쉼표란다.",
    "조금 느려도 괜찮아. 꽃은 피어나는 계절이 저마다 다를 뿐, 모두 저마다 아름다우니까. 🍃",
    "생산적이지 않은 날조차, 지친 내 몸에 따뜻한 안식을 선물한 멋진 순간이었음을 잊지 마.",
    "어떤 날이든 너는 항상 충분히 빛나고 있어. 스스로를 향한 엄격함을 오늘은 내려두자. 💛",
    "아무것도 해내지 못했다는 착각 속에 갇히지 말아줘. 밥을 먹고, 숨을 쉬고, 견뎌낸 것 자체가 시작이야.",
    "네가 계획한 세상보다, 네가 살아내고 있는 실제 세상이 훨씬 소중하고 훌륭해."
  ];

  // ==========================================================================
  // SPA SCREEN ROUTER
  // ==========================================================================
  function showScreen(screenId) {
    Object.values(screens).forEach(screen => {
      screen.classList.remove('active');
    });
    screens[screenId].classList.add('active');
    screens[screenId].scrollTop = 0;
  }

  // Set theme at startup
  document.documentElement.setAttribute('data-theme', appState.theme);

  // Initialize main page greeting
  function initMainGreeting() {
    const randIdx = Math.floor(Math.random() * randomGreetings.length);
    dynamicGreeting.textContent = randomGreetings[randIdx];
    
    // Clear active selector state of mood
    moodButtons.forEach(btn => btn.classList.remove('active'));
    appState.currentMood = 'good'; // Reset mood state to calm
  }
  
  initMainGreeting();

  // ==========================================================================
  // INTERACTIVE MASCOT & THEME FUNCTIONS
  // ==========================================================================
  // Theme Toggle
  themeToggle.addEventListener('click', () => {
    appState.theme = appState.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', appState.theme);
    localStorage.setItem('today_was_okay_theme', appState.theme);
  });

  // Mascot Hover / Click Dialogue Easter Egg
  mainMascot.addEventListener('click', () => {
    const dialogs = [
      "푸하하, 간지러워요! ☁️",
      "오늘도 수고한 당신을 꼬옥 안아주고 싶어요.",
      "걱정 마세요, 당신은 생각보다 이미 훨씬 잘하고 있어요!",
      "완벽한 하루보다 편안한 하루를 보내길 바랄게요. 💛",
      "제 말랑말랑한 볼을 만지며 마음의 긴장을 풀어보세요."
    ];
    const rand = Math.floor(Math.random() * dialogs.length);
    dynamicGreeting.innerHTML = `<strong>구름이:</strong> ${dialogs[rand]}`;
    
    // Play a quick jump micro-animation
    mainMascot.style.transform = 'translateY(-15px) scale(1.05)';
    setTimeout(() => {
      mainMascot.style.transform = '';
    }, 300);
  });

  // Mood click handlers
  moodButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      moodButtons.forEach(b => b.classList.remove('active'));
      const clickedBtn = e.currentTarget;
      clickedBtn.classList.add('active');
      
      const mood = clickedBtn.dataset.mood;
      appState.currentMood = mood;
      
      // Update greeting message based on selected mood
      dynamicGreeting.textContent = moodGreetings[mood];

      // Sparkle anim on mascot
      mainMascot.style.transform = 'scale(1.06)';
      setTimeout(() => { mainMascot.style.transform = ''; }, 200);
    });
  });

  // Textarea char count
  function setupCharCounter(textarea, counterSpan) {
    textarea.addEventListener('input', () => {
      counterSpan.textContent = textarea.value.length;
    });
  }
  setupCharCounter(inputPlan, charPlan);
  setupCharCounter(inputActual, charActual);
  setupCharCounter(inputRegret, charRegret);

  // NAVIGATION ROUTING LINKS
  btnGoWrite.addEventListener('click', () => showScreen('write'));
  btnGoHistory.addEventListener('click', () => {
    renderHistory();
    showScreen('history');
  });
  
  btnWriteBack.addEventListener('click', () => {
    initMainGreeting();
    showScreen('main');
  });
  btnHistoryBack.addEventListener('click', () => {
    initMainGreeting();
    showScreen('main');
  });
  btnResultHome.addEventListener('click', () => {
    initMainGreeting();
    showScreen('main');
  });
  btnHistoryFirstWrite.addEventListener('click', () => showScreen('write'));

  // ==========================================================================
  // EMOTIONAL AI TEXT PARSER ENGINE (Client-side dynamic reframing)
  // ==========================================================================
  function runEmotionalAnalysis(planText, actualText, regretText) {
    const planLower = planText.toLowerCase();
    const actualLower = actualText.toLowerCase();
    const regretLower = regretText.toLowerCase();

    // 1. Parse accomplished actions (오늘 실제로 해낸 것들)
    // Extract actions from actualText and map them to deeply empathetic, evidence-based micro-accomplishments.
    let accomplishedList = [];
    
    // Core physical/biological functions
    if (actualLower.includes('밥') || actualLower.includes('먹었') || actualLower.includes('식사') || actualLower.includes('식단') || actualLower.includes('점심') || actualLower.includes('저녁') || actualLower.includes('아침')) {
      accomplishedList.push("끼니 돌봄: 생명 유지와 두뇌 활동의 핵심인 식사를 외면하지 않고 온전히 챙겨 먹으며 소중한 신체 기관들과 활발히 상호작용했습니다.");
    }
    if (actualLower.includes('잠') || actualLower.includes('잤') || actualLower.includes('휴식') || actualLower.includes('쉬었') || actualLower.includes('누워') || actualLower.includes('낮잠') || actualLower.includes('멍때')) {
      accomplishedList.push("에너지 복원: 뇌에 누적된 피로 물질을 정화하고 번아웃을 방어하기 위해 꼭 필요했던 고품격 수면/휴식을 내 지친 몸에 적극 허락했습니다.");
    }
    
    // Core intellectual/developmental functions
    if (actualLower.includes('공부') || actualLower.includes('공부했') || actualLower.includes('코딩') || actualLower.includes('책') || actualLower.includes('인강') || actualLower.includes('독서') || actualLower.includes('학습')) {
      accomplishedList.push("지적 주도성: 완벽주의적 스트레스와 자기비판 속에서도 회피 충동을 이겨내고 고도의 인지 자원이 소모되는 학습적 몰입을 훌륭히 완수했습니다.");
    }
    if (actualLower.includes('일') || actualLower.includes('일했') || actualLower.includes('근무') || actualLower.includes('알바') || actualLower.includes('작업') || actualLower.includes('회의') || actualLower.includes('과제')) {
      accomplishedList.push("사회적 책임: 심리적 무기력이 발을 붙잡는 상황에서도 높은 프로페셔널리즘과 책임감을 가동하여 주어진 일과 직무를 훌륭하게 수행했습니다.");
    }
    
    // Core space/physical care functions
    if (actualLower.includes('청소') || actualLower.includes('정리') || actualLower.includes('빨래') || actualLower.includes('설거지') || actualLower.includes('환기') || actualLower.includes('이불') || actualLower.includes('씻') || actualLower.includes('샤워')) {
      accomplishedList.push("공간 및 환경 가꾸기: 무질서해진 주거 환경을 정돈하고 몸을 정결히 함으로써 맑은 도파민 분비를 유도하고 일상의 항상성을 안정되게 수호했습니다.");
    }
    if (actualLower.includes('산책') || actualLower.includes('걷기') || actualLower.includes('걸었') || actualLower.includes('운동') || actualLower.includes('헬스') || actualLower.includes('요가') || actualLower.includes('스트레칭') || actualLower.includes('피트')) {
      accomplishedList.push("신체 활성화: 근육의 긴장을 해소하고 뇌의 신경가소성을 유도하는 유산소/근력 활동을 실행하여 항불안 세로토닌 합성 기전을 성공적으로 촉발했습니다.");
    }
    if (actualLower.includes('친구') || actualLower.includes('가족') || actualLower.includes('엄마') || actualLower.includes('아빠') || actualLower.includes('애인') || actualLower.includes('톡') || actualLower.includes('대화') || actualLower.includes('전화') || actualLower.includes('만났') || actualLower.includes('위로')) {
      accomplishedList.push("관계적 온기 교감: 단절적 소외에서 벗어나 믿을 수 있는 타인과 일상의 파편을 나누며, 사랑과 공감이라는 신경 화학적 치유 옥시토신을 교류했습니다.");
    }
    
    // Custom exact phrase extraction to shock them with specificity
    const rawSentences = actualText.split(/[.,\n]/).map(s => s.trim()).filter(s => s.length > 6 && !s.includes('하고') && !s.includes('해서'));
    if (rawSentences.length > 0) {
      const count = Math.min(2, rawSentences.length);
      for (let i = 0; i < count; i++) {
        let textPiece = rawSentences[i];
        if (textPiece.length > 35) textPiece = textPiece.substring(0, 35) + "...";
        accomplishedList.push(`실제적 경험 직조: 자칫 사소한 행동으로 치부될 수 있는 **"${textPiece}"**을(를) 삶의 시간 위에 또렷이 그려넣으며 적극적인 주체성을 입증했습니다.`);
      }
    }
    
    // Secure minimum list counts
    if (accomplishedList.length < 3) {
      accomplishedList.push("자아 수용 실천: 자책감이 목 끝까지 차올라도 회피하거나 마음을 닫는 대신, 다이어리를 켜고 내 감정을 직시하며 극복하고자 한 행동 자체가 엄청난 주체적 성취입니다.");
      accomplishedList.push("생존 방어막 유지: 혹독한 조건과 고갈된 에너지를 마주했음에도 지쳐 꺾이지 않고 오늘 하루를 끝까지 견디며 무탈하게 나를 방어해 냈습니다.");
    }
    
    accomplishedList = [...new Set(accomplishedList)].slice(0, 3);

    // 2. Parse self-push (너무 스스로를 몰아붙인 부분) - Cognitive Distortion Analysis
    let criticismResponse = "";
    
    let isLabeling = regretLower.includes('한심') || regretLower.includes('게으르') || regretLower.includes('바보') || regretLower.includes('한계') || regretLower.includes('쓰레기');
    let isAllOrNothing = regretLower.includes('망했') || regretLower.includes('실패') || regretLower.includes('하나도') || regretLower.includes('전혀') || regretLower.includes('다 날') || regretLower.includes('완전');
    let isShouldStatements = regretLower.includes('했어야') || regretLower.includes('않았다') || regretLower.includes('못했') || regretLower.includes('안했') || regretLower.includes('부족') || regretLower.includes('밀려');

    if (isLabeling) {
      criticismResponse = `
        심리치료 기법(CBT)에서 다루는 가장 치명적인 오류 중 하나인 <strong>'낙인찍기(Labeling) 왜곡'</strong>이 매우 강하게 작동하고 있어요. 
        원래 세웠던 계획들을 전부 완수하지 못했다는 <em>'단편적인 일시적 사실'</em> 하나만을 증거 삼아, '나'라는 우주적 존재 전체를 <strong>"한심하고 게으른 사람"</strong>으로 손쉽게 규정하며 극심한 징벌성 혐오를 부과하고 있습니다. 
        행동의 누수가 존재의 결함을 의미하지 않습니다. 당신의 뇌는 오늘 단지 휴식이 필요했을 뿐인데, 완벽주의적 내면 재판관이 과격한 유죄 판결을 내리고 있는 꼴이랍니다.
      `;
    } else if (isAllOrNothing) {
      criticismResponse = `
        모든 성과를 100점 아니면 0점으로 재단하는 <strong>'이분법적 사고(All-or-Nothing Thinking)'</strong>의 감옥에 갇혀 마음이 몹시 불안한 상태군요. 
        오늘 계획했던 이상적인 목표에 닿지 않았다고 해서 오늘의 노력이 완전히 무가치하고 **"다 망해버린 실패한 하루"**라고 극단적으로 귀결짓고 계십니다. 
        사실 오늘 이미 수많은 생각과 충전, 소소한 돌봄이라는 30점, 50점의 소중한 중간층 성과들이 존재했는데도, 오직 '100점이 아니다'라는 이유로 그 모든 의미 있는 행동 파편들을 스스로 무자비하게 폐기하고 있습니다.
      `;
    } else if (isShouldStatements) {
      criticismResponse = `
        내면에 높은 절대기준의 율법을 세워두고 지키지 못하면 가차 없이 채찍질을 가하는 <strong>'당위적 진술(~해야만 한다) 왜곡'</strong>이 감지됩니다. 
        "무조건 일찍 일어났어야만 했다", "계획을 전부 끝냈어야 비로소 칭찬받을 가치가 있다"며 몸과 마음의 생물학적 한계 상태를 깡그리 무시한 채 억압적으로 채찍을 휘두르고 있네요. 
        '~해야만 한다'는 강박은 에너지를 더 끌어올리기는커녕 뇌에 위협 신호를 보내며 무기력과 회피적 피로감을 심화시킬 뿐입니다.
      `;
    } else {
      criticismResponse = `
        원래 하고 싶었던 목표치에 도달하지 못한 실망감 때문에 가슴 밑바닥에서 무의식적인 죄책감과 피로감이 소용돌이치고 있군요. 
        완벽주의적 잣대는 오늘 하루 속에 존재했던 당신의 소소한 조율들과 마음 돌봄을 모두 **'생산성'**이라는 단 하나의 지표로만 평가절하하게 유도합니다. 
        당신의 하루를 가득 메운 고투의 과정들을 있는 그대로 따뜻이 인정해 주기보단, 늘 빈자리와 부족한 틈새만 현미경처럼 찾아서 고통받는 자책 패턴을 반복하고 계십니다.
      `;
    }

    // 3. Parse why today was actually okay (오늘 괜찮았던 이유) - Fact-Based Psychological Validation
    let plannedKeywords = planText.split(/[,\s.]/).map(w => w.trim()).filter(w => w.length >= 2 && !['오늘', '내일', '하기', '하는', '에서', '하고', '원래', '진짜'].includes(w)).slice(0, 2);
    let plannedTextRef = plannedKeywords.join(', ') || '생산적인 과업들';

    let actualKeywords = actualText.split(/[,\s.]/).map(w => w.trim()).filter(w => w.length >= 2 && !['했다', '오늘', '진짜', '너무', '하고', '해서', '근데', '그냥'].includes(w)).slice(0, 2);
    let actualTextRef = actualKeywords.join(', ') || '나만의 소중한 활동들';

    let reasonResponse = `
      객관적인 팩트와 심리적 메커니즘을 들어 하루를 냉정하게 입증해 볼까요? 
      당신은 오늘 당초 <strong>'${plannedTextRef}'</strong> 등 신체적 자원을 어마어마하게 과적(Overload)해야 하는 이상적인 계획을 가슴속에 품고 출발했습니다. 
      완벽주의자는 흔히 에너지가 고갈된 상태에서도 무의식적으로 120%의 에너지를 계획 단계에 밀어 넣어 스스로를 혹사하려는 편향이 있습니다. 
      오늘 원래 계획을 다 달성하지 못한 채 <strong>'${actualTextRef}'</strong> 등을 수행하며 보낸 것은 **결코 실패가 아닙니다.** 
      오히려 한계에 도달한 당신의 신체 방어 메커니즘이 **'여기서 에너지를 강제로 보존하지 않으면 번아웃으로 진입한다'**고 자율신경계를 통해 강력한 긴급 정지 제동을 걸어준 대단히 지혜로운 생물학적 자기조절(Self-Regulation)의 순간이었습니다. 
      지쳐 쓰러지기 전 멈추고 쉴 수 있었던 오늘의 무의식적 조율력이야말로, 스스로의 건강한 한계를 보호하고 내일의 지속성을 확보한 아주 성숙하고 유연한 대처였던 확실한 과학적 증거입니다.
    `;

    // 4. Micro proposal (내일은 이렇게 해보자) - Neuroscientific baby steps
    let suggestionResponse = "";
    if (regretLower.includes('공부') || regretLower.includes('코딩') || regretLower.includes('작업') || regretLower.includes('업무')) {
      suggestionResponse = "내일은 목표 달성을 잊고 딱 '30초'만 컴퓨터를 켜서 텍스트 파일 하나만 열어보거나 한 문장만 끄적여 본 뒤 즉각 종료하기로 해요. 일의 규모를 제로에 수렴하게 깎아냄으로써 뇌의 변연계가 가질 위협 반응을 우회하고, 자연스럽게 작업 흥미(Task Initiation) 기전을 슬며시 자극하는 뇌과학적 전략입니다. 30초만 넘기면 더 이상 아무것도 안 하고 푹 쉬셔도 무조건 대성공입니다.";
    } else if (regretLower.includes('운동') || regretLower.includes('헬스') || regretLower.includes('산책') || regretLower.includes('청소')) {
      suggestionResponse = "내일은 대단한 움직임 대신 아침 기상 직후 이불 속에서 양 팔을 길게 뻗고 딱 '10초 동안 온 힘을 다해 기지개 켜기'를 실천해요. 몸의 가벼운 물리적 수축과 이완을 통해 뇌에 '나는 안전한 장소에서 오늘을 열어내고 있다'는 신체화 감각 피드백을 직접 전송하여, 무력감에 젖기 전 상쾌한 작은 성취감을 머리에 주입해 줄 것입니다.";
    } else if (regretLower.includes('늦잠') || regretLower.includes('기상') || regretLower.includes('시간') || regretLower.includes('유튜브') || regretLower.includes('폰') || regretLower.includes('시간낭비')) {
      suggestionResponse = "내일 아침 눈을 떴을 때는 바로 스마트폰의 화면을 켜서 타인의 정돈된 일상(자책감 유발제)을 확인하는 습관을 차단합시다. 그 대신 눈을 감은 채 내 들숨과 날숨을 '딱 5번'만 가만히 귀를 기울여 음미해 주는 거예요. 스마트폰에 신경망을 납치당하기 전, 내 생명 활동의 감각을 가장 먼저 내가 환대해 주는 일상의 주도권 확보 기법입니다.";
    } else {
      suggestionResponse = "내일은 오롯이 3분 동안 '나만을 위해 다정한 온도의 미온수 한 컵을 아주 천천히 한 모금씩 삼켜보기'를 약속해요. 물이 목을 타고 내려가는 아늑한 체성적 감각에 온 신경을 집중하는 동안, 머릿속에서 폭주하는 온갖 자책 회로(Default Mode Network)가 일시 정지되고 현실의 안정적 닻을 내리는 훌륭한 마음 챙김 훈련이 완료됩니다.";
    }

    // 5. Emotional affirmation sentence (오늘의 안심 문장)
    const randAffIdx = Math.floor(Math.random() * affirmationsList.length);
    const affirmationSentence = affirmationsList[randAffIdx];

    return {
      mood: appState.currentMood,
      date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }),
      dateRaw: new Date().toISOString(),
      accomplished: accomplishedList,
      criticism: criticismResponse,
      reason: reasonResponse,
      suggestion: suggestionResponse,
      affirmation: affirmationSentence
    };
  }

  // ==========================================================================
  // FORM SUBMISSION & LOADER EFFECT
  // ==========================================================================
  diaryForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Check if both textareas are filled
    const planVal = inputPlan.value.trim();
    const actualVal = inputActual.value.trim();
    const regretVal = inputRegret.value.trim();

    if (!planVal || !actualVal || !regretVal) {
      alert("구름이에게 오늘의 세 가지 빈칸을 모두 채워 이야기해 주세요. ☁️");
      return;
    }

    // Go to loading screen
    showScreen('loading');
    
    // Cycle warm loading messages
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length;
      loadingMsg.textContent = loadingMessages[msgIdx];
    }, 900);

    // Run custom smart parsing algorithm in background
    appState.currentAnalysis = runEmotionalAnalysis(planVal, actualVal, regretVal);

    // Pause for 2.8s for smooth, cute interactive animation buildup
    setTimeout(() => {
      clearInterval(msgInterval);
      
      // Inject AI values to results page
      renderResults(appState.currentAnalysis);
      
      // Show results screen
      showScreen('result');
      
      // Reset text inputs safely
      inputPlan.value = "";
      inputActual.value = "";
      inputRegret.value = "";
      charPlan.textContent = "0";
      charActual.textContent = "0";
      charRegret.textContent = "0";
    }, 2800);
  });

  function renderResults(data) {
    // Fill accomplished
    resAccomplished.innerHTML = "";
    data.accomplished.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      resAccomplished.appendChild(li);
    });

    // Fill other text cards
    resCriticism.innerHTML = data.criticism;
    resReason.innerHTML = data.reason;
    resSuggestion.textContent = data.suggestion;
    resAffirmation.textContent = data.affirmation;
  }

  // ==========================================================================
  // LOCALSTORAGE SAVE & HISTORY RENDER
  // ==========================================================================
  btnSaveDiary.addEventListener('click', () => {
    if (!appState.currentAnalysis) return;

    // Generate unique ID
    const entryId = 'diary_' + Date.now();
    const recordToSave = {
      id: entryId,
      ...appState.currentAnalysis
    };

    // Save to list
    appState.diaries.unshift(recordToSave); // push to top
    localStorage.setItem('today_was_okay_diaries', JSON.stringify(appState.diaries));

    // Little warm popup feedback (Non-intrusive beautiful toast or alert)
    alert("오늘의 안심 마음 조각이 다이어리에 차곡차곡 소중히 보관되었어요! 📂");

    // Clear active analysis state and redirect to history directly to see entries
    appState.currentAnalysis = null;
    renderHistory();
    showScreen('history');
  });

  function renderHistory() {
    const list = appState.diaries;
    
    // Total count update
    statsTotalCount.textContent = list.length;

    // Check empty state
    const emptyState = document.getElementById('empty-history');
    
    // Clear dynamic cards
    const existingCards = historyContainer.querySelectorAll('.history-item-card');
    existingCards.forEach(c => c.remove());

    if (list.length === 0) {
      emptyState.style.display = 'flex';
      updateCharts({ sunny: 0, good: 0, tired: 0, sad: 0, anxious: 0 });
      return;
    }

    emptyState.style.display = 'none';

    // Emotion count object
    const emotionCounts = { sunny: 0, good: 0, tired: 0, sad: 0, anxious: 0 };

    // Render list
    list.forEach(entry => {
      // Accumulate statistics
      if (emotionCounts.hasOwnProperty(entry.mood)) {
        emotionCounts[entry.mood]++;
      }

      const card = document.createElement('div');
      card.className = 'history-item-card';
      card.dataset.id = entry.id;

      // Extract neat mood details
      const emojiMap = { sunny: '☀️', good: '🌤️', tired: '☁️', sad: '🌧️', anxious: '⛈' };
      const currentEmoji = emojiMap[entry.mood] || '🌤️';

      // Safe slice of the affirmation
      let shortQuote = entry.affirmation;
      if (shortQuote.length > 22) shortQuote = shortQuote.substring(0, 22) + "...";

      card.innerHTML = `
        <div class="h-card-left">
          <div class="h-mood-badge">${currentEmoji}</div>
          <div class="h-details">
            <span class="h-date">${entry.date}</span>
            <span class="h-quote">"${shortQuote}"</span>
          </div>
        </div>
        <div class="h-card-right">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      `;

      // Modal open click event
      card.addEventListener('click', () => {
        openDetailModal(entry.id);
      });

      historyContainer.appendChild(card);
    });

    // Update charts based on dynamic calculations
    updateCharts(emotionCounts);
  }

  function updateCharts(counts) {
    const total = appState.diaries.length;
    if (total === 0) {
      Object.keys(bars).forEach(key => {
        bars[key].style.width = '0%';
        barTxts[key].textContent = '0%';
      });
      return;
    }

    Object.keys(counts).forEach(key => {
      const pct = Math.round((counts[key] / total) * 100);
      bars[key].style.width = `${pct}%`;
      barTxts[key].textContent = `${pct}%`;
    });
  }

  // ==========================================================================
  // MODAL RECORD DETAILED VIEW
  // ==========================================================================
  function openDetailModal(id) {
    const entry = appState.diaries.find(d => d.id === id);
    if (!entry) return;

    activeModalId = id;

    // Mood Emoji map
    const emojiMap = { sunny: '☀️ 맑음', good: '🌤️ 포근함', tired: '☁️ 지침', sad: '🌧️ 속상함', anxious: '⛈ 불안함' };
    modalMoodEmoji.textContent = emojiMap[entry.mood] || '🌤️ 오늘';
    modalDateString.textContent = entry.date;

    // Accomplished lists
    modalAccomplished.innerHTML = "";
    entry.accomplished.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      modalAccomplished.appendChild(li);
    });

    // Paragraph blocks
    modalCriticism.innerHTML = entry.criticism;
    modalReason.innerHTML = entry.reason;
    modalSuggestion.textContent = entry.suggestion;
    modalAffirmation.textContent = entry.affirmation;

    // Display modal
    historyModal.classList.add('active');
  }

  function closeModal() {
    historyModal.classList.remove('active');
    activeModalId = null;
  }

  btnModalClose.addEventListener('click', closeModal);
  
  // Close modal when clicking backdrop area
  historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
      closeModal();
    }
  });

  // Delete Diary Entry
  btnModalDelete.addEventListener('click', () => {
    if (!activeModalId) return;

    const proceed = confirm("소중하게 보관해 둔 안심 마음 조각을 정말로 보따리에서 꺼내 지우시겠어요? ☁️");
    if (!proceed) return;

    // Filter array
    appState.diaries = appState.diaries.filter(d => d.id !== activeModalId);
    localStorage.setItem('today_was_okay_diaries', JSON.stringify(appState.diaries));

    // Close and refresh
    closeModal();
    renderHistory();
  });

});
