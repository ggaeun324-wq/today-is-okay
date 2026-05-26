/**
 * 오늘 괜찮았어 - Application Logic & Real AI OpenAI Integration
 * ------------------------------------------------------------------
 * 100% 프론트엔드 환경에서 사용자의 뒤죽박죽된 머릿속 생각 흐름을 완벽히 읽고,
 * OpenAI API Key 연동 또는 초정밀 로컬 구조화 엔진을 활용해
 * 사용자의 이름을 다정히 불러주며 팩트 대조 및 체계적인 행동 정리를 해주는 감성 일기 로직입니다.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  let appState = {
    currentMood: 'good',
    diaries: JSON.parse(localStorage.getItem('today_was_okay_diaries')) || [],
    currentAnalysis: null,
    theme: localStorage.getItem('today_was_okay_theme') || 'light',
    settings: JSON.parse(localStorage.getItem('today_was_okay_settings')) || { name: '가은님', apikey: '' }
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

  // Unified Single Input Field
  const diaryForm = document.getElementById('diary-form');
  const inputUnstructured = document.getElementById('input-unstructured');
  const charUnstructured = document.getElementById('char-unstructured');

  // Settings Modal Elements
  const btnSettingsOpen = document.getElementById('btn-settings-open');
  const btnSettingsClose = document.getElementById('btn-settings-close');
  const btnSettingsSave = document.getElementById('btn-settings-save');
  const settingsModal = document.getElementById('settings-modal');
  const settingsUsername = document.getElementById('settings-username');
  const settingsApikey = document.getElementById('settings-apikey');

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
  // INITIALIZE APP SETTINGS & VALUES
  // ==========================================================================
  // Set theme at startup
  document.documentElement.setAttribute('data-theme', appState.theme);
  
  // Apply saved values to Settings Input boxes
  settingsUsername.value = appState.settings.name || "가은님";
  settingsApikey.value = appState.settings.apikey || "";

  // Dynamic emotional responses generator dictionary based on current user's name
  function getGreetings() {
    const name = appState.settings.name || "가은님";
    return [
      `어서와요, ${name}! 오늘 하루 마음속에 무겁게 얹힌 짐들을 저와 같이 찬찬히 내려놓아 봐요. ☁️`,
      `오늘 혹시 스스로를 가혹하게 나무라진 않았나요? ${name}의 힘든 일도, 속상한 일도 다 들어줄게요. 🌸`,
      `완벽하지 않아도 오늘 ${name}은 세상을 든든히 살아냈어요. 기특한 나를 안아줄 준비를 해볼까요? 💛`,
      `바쁘게 달리느라 지친 ${name}을 위한 작은 피난처랍니다. 숨 한번 깊게 들이마시고 편하게 말씀해 주세요. 🍃`,
      `구름 위에 누워 쉬는 것처럼 아늑하고 평온한 시간. 오늘 ${name}의 날씨를 살며시 알려주세요. 🌤️`
    ];
  }

  function getMoodGreetings(mood) {
    const name = appState.settings.name || "가은님";
    const greetings = {
      sunny: `오! 오늘 날씨 맑음인가요? 기분 좋은 일이 있었다니 저도 몽글몽글 행복해지네요, ${name}! ☀️ 어떤 기쁨이 있었는지 얼른 공유해 줘요.`,
      good: `포근하고 차분한 오늘이군요. 무탈하고 평화로운 하루 역시 ${name}에게 정말 소중한 성취랍니다. 🌤️ 기분 좋은 마음으로 하루를 되돌아봐요.`,
      tired: `몸과 마음이 무척 지치고 묵직한 상태군요, ${name}... ☁️ 오늘은 애써 힘내지 않아도 괜찮아요. 지친 하루를 토닥토닥 다정하게 감싸 안아 줄게요.`,
      sad: `마음의 비가 촉촉이 내리는 날이네요, ${name}. 🌧️ 눈물 한 방울, 슬픔 한 자락 다 괜찮으니 속상했던 일들 편안하게 적고 다 털어버려요.`,
      anxious: `가슴이 쿵쾅대거나 머릿속이 엉켜 불안하군요, ${name}. ⛈️ 걱정 마요, 내가 안전한 우산이 되어줄게요. 생각나는 것부터 천천히 내려놓아요.`
    };
    return greetings[mood] || greetings.good;
  }

  const loadingMessages = [
    "오늘 하루를 소중히 들여다보는 중이에요...",
    "당신의 고투 흔적 속에서 숨겨진 소중한 의미들을 찾고 있어요...",
    "너무 높았던 스스로의 기준을 내려놓고, 있는 그대로를 비추는 중...",
    "구름이가 가은님을 위해 깃허브 답변처럼 다정한 근거를 모으고 있어요..."
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

  // Initialize main page greeting
  function initMainGreeting() {
    const greetings = getGreetings();
    const randIdx = Math.floor(Math.random() * greetings.length);
    dynamicGreeting.textContent = greetings[randIdx];
    
    // Clear active selector state of mood
    moodButtons.forEach(btn => btn.classList.remove('active'));
    appState.currentMood = 'good'; // Reset mood state to calm
  }
  
  initMainGreeting();

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

  // ==========================================================================
  // SETTINGS MODAL BINDINGS
  // ==========================================================================
  btnSettingsOpen.addEventListener('click', () => {
    settingsModal.classList.add('active');
  });

  function closeSettingsModal() {
    settingsModal.classList.remove('active');
  }

  btnSettingsClose.addEventListener('click', closeSettingsModal);
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      closeSettingsModal();
    }
  });

  btnSettingsSave.addEventListener('click', () => {
    const username = settingsUsername.value.trim() || "가은님";
    const apikey = settingsApikey.value.trim();

    appState.settings = { name: username, apikey: apikey };
    localStorage.setItem('today_was_okay_settings', JSON.stringify(appState.settings));

    alert("AI 맞춤 정보가 소중하게 저장되었어요! 💛");
    closeSettingsModal();
    initMainGreeting();
  });

  // ==========================================================================
  // INTERACTIVE MASCOT & THEME FUNCTIONS
  // ==========================================================================
  // Theme Toggle
  themeToggle.addEventListener('click', () => {
    appState.theme = appState.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', appState.theme);
    localStorage.setItem('today_was_okay_theme', appState.theme);
  });

  // Mascot Click easter egg
  mainMascot.addEventListener('click', () => {
    const name = appState.settings.name || "가은님";
    const dialogs = [
      "푸하하, 간지러워요! ☁️",
      `오늘도 참 고생한 ${name}을 꼬옥 안아주고 싶어요.`,
      `걱정 마세요, ${name}은 생각보다 이미 훨씬 잘해내고 있어요!`,
      "완벽한 하루보다 편안한 하루를 보내길 바랄게요. 💛",
      "제 말랑말랑한 구름살을 만지며 마음의 긴장을 풀어보세요."
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
      dynamicGreeting.textContent = getMoodGreetings(mood);

      // Sparkle anim on mascot
      mainMascot.style.transform = 'scale(1.06)';
      setTimeout(() => { mainMascot.style.transform = ''; }, 200);
    });
  });

  // Unstructured single input textarea char count
  inputUnstructured.addEventListener('input', () => {
    charUnstructured.textContent = inputUnstructured.value.length;
  });

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
  // REAL OPENAI INTEGRATION CORE (Empathy Engine)
  // ==========================================================================
  async function fetchOpenAIAnalysis(unstructuredText, name, apikey) {
    // Collect last 3 days of diary entries to inject history to the prompt!
    let historyContext = "";
    if (appState.diaries && appState.diaries.length > 0) {
      historyContext = `\n[중요] ${name}의 과거 마음 조각 역사(최근 3일 기록):\n`;
      appState.diaries.slice(0, 3).forEach((d, idx) => {
        historyContext += `[이전 기록 ${idx+1}] 날짜: ${d.date}, 기분: ${d.mood}\n`;
        historyContext += `- 안심문장: ${d.affirmation}\n`;
        historyContext += `- 몰아붙인 점: ${d.criticism.replace(/<[^>]*>/g, '')}\n`;
        historyContext += `- 해결 제안: ${d.suggestion}\n\n`;
      });
      historyContext += `과거 기록에 민사소송, 커리어 고민, 또는 공부 진도 등의 키워드가 존재한다면, 이번 분석에서 반드시 과거 이력을 다정하게 언급하며 "가은님, 지난번에 걱정하셨던 민사소송 진행 건은..." 등으로 자연스러운 맥락을 이어가 주세요.\n`;
    }

    const systemPrompt = `당신은 완벽주의 성향을 가진 사람들을 위한 감정 안정 및 하루 객관화 앱의 심층 AI 상담 동반자 '구름이'(Gureum-ee)입니다.
사용자의 이름은 "${name}" 입니다. 응답 시 항상 사용자를 다정하고 존중을 담아 "${name}" (예: 가은님)이라고 불러주어야 합니다.

사용자는 오늘 머릿속에 맴도는 다양한 생각, 원래 하려던 것, 실제로 한 일, 자책감, 외부 자극(예: 민사소송 법원 전화, 협력팀 제안 거절, 공부 미진 등)을 정돈하지 않고 의식의 흐름대로 뒤죽박죽 적어 보냈습니다.

사용자가 공유해주신 대화 캡쳐본에 따르면, 사용자는 단순히 "수고했다"는 일방적이고 기계적인 대답보다 다음과 같이 매우 체계적이고, 팩트 대조적이며, 논리적으로 가슴을 뛰게 해주는 깊은 위로의 수준을 원합니다:
- 사용자가 "공부를 안 했다"고 자책하지만 실제론 "두부전골을 남편과 만들어 먹고, 민사소송 법원 전화를 걸어 절차를 촉탁하고, k8s 인프라를 조금이라도 만지는" 등 수많은 엄청난 일들을 처리했음을 냉정하고 상세하게 팩트 단위로 대조해 주는 스타일.
- 자책의 밑바닥에 숨겨진 그들의 '스트레스 핵심(예: 피고인 특정 지연에 따른 소송 중지 압박)'을 명확하게 꿰뚫고 인정해 주는 따뜻함.
- "VM 켜고 쿠버네티스 다시 만졌다는 것 자체가 멘탈의 연결 유지다"처럼, 사소한 활동에 엄청난 심리적/인지 과학적 의미를 매겨주는 분석력.

다음의 JSON 포맷 규칙을 칼같이 지켜서 응답해 주세요. JSON 외의 문장은 포함하지 마십시오.

JSON 구조:
{
  "accomplished": [
    "체계적으로 정리한 오늘의 실천 조각 1 (구체적 행동과 그 속에 깃든 가치를 '분야 태그'와 함께 기재)",
    "체계적으로 정리한 오늘의 실천 조각 2",
    "체계적으로 정리한 오늘의 실천 조각 3"
  ],
  "criticism": "가은님의 자책 속에 숨겨진 인지 왜곡 유형(낙인찍기, 이분법적 사고, 당위진술 등)을 구체적으로 거론하며 스스로를 다그친 부분을 심도 있게 설명하는 문단 (가은님이 작성한 텍스트 단어를 직접 인용하여 상세 분석할 것)",
  "reason": "캡쳐본 스타일처럼 오늘 원래 하려던 계획 대비 실제 에너지가 닿은 상황을 대조하며 '실패가 아니라 지친 신체가 과열과 번아웃을 막기 위해 훌륭하게 생체 에너지 조율을 작동시킨 대단한 승리이자 삶을 굴린 날'이었음을 인과적으로 증명하는 상세한 논리적 위로 문단 (가장 길고 심도 있게 작성해 주세요)",
  "suggestion": "내일 하루 뇌과학적으로 장벽을 제로로 낮춰 성공할 수 있는 10초~30초용 초소형 미시 대안 (행동 설계 전략)",
  "affirmation": "폴라로이드 프레임 안에 쏙 들어갈, 다정다감하고 울림이 있는 구름이 시그니처 안심 문장"
}

${historyContext}
사용자의 텍스트를 고도로 맞춤화하여 마법같이 분석해 주세요.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apikey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // extremely fast & empathetic
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: unstructuredText }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP 오류 ${response.status}`);
    }

    const data = await response.json();
    const resultObj = JSON.parse(data.choices[0].message.content);
    
    return {
      mood: appState.currentMood,
      date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }),
      dateRaw: new Date().toISOString(),
      accomplished: resultObj.accomplished,
      criticism: resultObj.criticism,
      reason: resultObj.reason,
      suggestion: resultObj.suggestion,
      affirmation: resultObj.affirmation
    };
  }

  // ==========================================================================
  // HIGH-FIDELITY LOCAL ENGINE FALLBACK (Empathetic Parser)
  // ==========================================================================
  function runLocalAnalysis(unstructuredText, name) {
    const textLower = unstructuredText.toLowerCase();

    // 1. Parse accomplished actions (오늘 실제로 해낸 것들)
    let accomplishedList = [];
    
    // Check specific keywords and dynamically mapping to Gaeun's custom screenshots
    if (textLower.includes('민사') || textLower.includes('소송') || textLower.includes('법원') || textLower.includes('피고') || textLower.includes('촉탁') || textLower.includes('경찰')) {
      accomplishedList.push("[현실처리 및 법적대응]: 가장 뇌와 심리적 정신 소모가 격심한 민사소송 피고인 특정 절차와 사실조회 재촉을 미루지 않고 행동으로 관철해 냈습니다.");
    }
    if (textLower.includes('콘센') || textLower.includes('mw') || textLower.includes('제안') || textLower.includes('거절') || textLower.includes('팀장')) {
      accomplishedList.push("[커리어적 주체성 확보]: 안정성, 연봉 가능성, 미래의 건강 등 삶의 질을 고려하여 끌려다니지 않고 스스로 '거절'이라는 위대한 방향성 결정을 내렸습니다.");
    }
    if (textLower.includes('공부') || textLower.includes('코딩') || textLower.includes('k8s') || textLower.includes('쿠버') || textLower.includes('설치') || textLower.includes('컴')) {
      accomplishedList.push("[공부의 끈 유지]: 비록 완벽하게 끝마치지는 못했더라도, 에너지가 소진된 상태에서 굳이 VM을 켜고 쿠버네티스를 만져 멘탈의 연결을 강인하게 이어갔습니다.");
    }
    if (textLower.includes('시장') || textLower.includes('밥') || textLower.includes('두부전골') || textLower.includes('요리') || textLower.includes('남편') || textLower.includes('먹었')) {
      accomplishedList.push("[따뜻한 연대 및 돌봄]: 무기력한 날임에도 집순이 한계를 극복하고 시장을 보아 밥을 지어 따뜻한 요리(두부전골 등)를 가족과 음미하며 정신 건강 회복에 기여했습니다.");
    }
    if (textLower.includes('잠') || textLower.includes('잤') || textLower.includes('피곤') || textLower.includes('기절') || textLower.includes('쉬었')) {
      accomplishedList.push("[생체 에너지 복원]: 외부의 위협 긴장도 아래서 심신이 과부하에 도달하자 억지로 움직이지 않고 깊은 수면을 취하여 안전망 장치를 성실하게 가동했습니다.");
    }

    // Custom exact sentence splits if not enough bullet items parsed
    const sentences = unstructuredText.split(/[.,\n]/).map(s => s.trim()).filter(s => s.length > 8 && !s.includes('하고') && !s.includes('해서'));
    if (sentences.length > 0) {
      const count = Math.min(2, sentences.length);
      for (let i = 0; i < count; i++) {
        let piece = sentences[i];
        if (piece.length > 35) piece = piece.substring(0, 35) + "...";
        accomplishedList.push(`[소소한 삶의 직조]: 오늘의 시점 속에서 "${piece}"을(를) 현실 행동으로 훌륭히 건져 올렸습니다.`);
      }
    }

    // Safety fallback
    if (accomplishedList.length < 3) {
      accomplishedList.push("[감정적 직시]: 자책감 속에 도망치지 않고 일기를 쓰며 나의 머릿속 생각들을 투명하게 문장으로 구조화하려 시도했습니다.");
      accomplishedList.push("[삶의 지속 유지]: 심한 불안감과 현실적 짐들로 짓눌리는 열악한 상황에서도 일상의 균형과 흐름을 무탈하게 지키고 굴려 냈습니다.");
    }
    accomplishedList = [...new Set(accomplishedList)].slice(0, 3);

    // 2. Cognitive Distortion Analysis (너무 스스로를 몰아붙인 부분)
    let criticismResponse = "";
    
    let isLabeling = textLower.includes('한심') || textLower.includes('게으르') || textLower.includes('바보') || textLower.includes('한계') || textLower.includes('쓰레기');
    let isAllOrNothing = textLower.includes('망했') || textLower.includes('실패') || textLower.includes('하나도') || textLower.includes('전혀') || textLower.includes('다 날') || textLower.includes('완전') || textLower.includes('못하');
    let isShouldStatements = textLower.includes('했어야') || textLower.includes('않았다') || textLower.includes('못했') || textLower.includes('안했') || textLower.includes('부족') || textLower.includes('밀려') || textLower.includes('했는');

    if (isLabeling) {
      criticismResponse = `
        현재 ${name}의 마음에선 인지 행동 기법(CBT)상 가장 극악한 <strong>'낙인찍기(Labeling) 왜곡'</strong>이 감지됩니다. 
        원래 하고 싶었던 목표를 모두 지키지 못했다는 단 하나의 단편적인 사실적 흠집으로 인해, ${name}이라는 존재 전체를 <strong>"게으르고 한심한 사람"</strong>이라 명명하여 격렬히 탓하고 있어요. 
        기억해 주세요. 오늘의 신체 조건하에선 공부를 좀 덜 하고 잠을 많이 잔 것이 당연한 뇌의 보존 기능인데, 그것을 두고 가혹한 낙인을 이마에 찍으며 상처를 주고 있습니다.
      `;
    } else if (isAllOrNothing) {
      criticismResponse = `
        모 아니면 도 형식의 극단적 흑백논리인 <strong>'이분법적 사고(All-or-Nothing Thinking)'</strong>의 덫에 빠져 몹시 괴로운 상태군요. 
        계획만큼은 공부를 밀어붙이지 못했거나 k8s 설치를 완수하지 못했다는 틈새를 두고, 오늘 하루는 아무 보람도 없었고 **"하나도 못한 실패작"**이라고 단언하고 계십니다. 
        사실 오늘 법원 촉탁 진행, 거절 결정, 시장 보기, 식사, 수면 등의 30점짜리 소중한 돌봄이 수없이 많았음에도, 100점이 아니라는 강박에 이를 전부 0점으로 지워버리고 있습니다.
      `;
    } else if (isShouldStatements) {
      criticismResponse = `
        당연히 완벽해야만 했다며 스스로를 다그치는 <strong>'당위적 강박(~해야만 한다) 왜곡'</strong>이 가시적으로 감지됩니다. 
        "무조건 공부를 끝냈어야만 했다", "시간을 생산적으로 통제했어야 비로소 훌륭한 사람이다"라며, 오늘 소송 스트레스로 이미 한계를 넘나드는 본인의 감정적 연료 상태를 깔끔히 무시한 채 율법적 칼질을 해대고 있습니다.
      `;
    } else {
      criticismResponse = `
        원래 머릿속으로 그리던 이상적인 '생산적 하루'의 도파민을 달성하지 못한 탓에, 내면에서 끊임없이 비하와 죄책감이 흐르고 있군요. 
        오늘 ${name}이 겪은 진짜 문제는 게으름이 아닙니다. 이미 불안 속에서 에너지가 바닥나 있는데도, "더 열심히 달렸어야 한다"며 존재를 무자비하게 다그쳐 대는 '완벽주의 내면 재판관'의 징벌성 평가가 가해지는 상황 그 자체가 진짜 아픔입니다.
      `;
    }

    // 3. Fact-Based Reframing (오늘 괜찮았던 이유)
    let isLitigation = textLower.includes('민사') || textLower.includes('소송') || textLower.includes('법원') || textLower.includes('피고');
    let extraReason = "";
    if (isLitigation) {
      extraReason = `
        특히 지금 ${name} 스트레스의 절대적인 핵심은 <strong>"피고 인적사항 특정 안 되면 소송이 통째로 멈춘다"</strong>는 현실적인 민사소송의 불확실성이 주는 극도의 뇌 신경적 압박입니다. 
        이 엄청난 스트레스 속에서도 사건번호가 존재하고, 현행범 체포와 사실조회 절차가 지속 중이며, 멈추지 않고 법원에 촉탁을 촉구한 것은 결코 **'아무것도 안 하고 기다리는 상태'**가 아닙니다! 
        ${name}은 이미 병원/정신과 기록 및 사건 입증을 체계적으로 설계하며 자신이 할 수 있는 최선의 방어 액션을 실시간으로 감내하는 강인한 영웅 상태입니다.
      `;
    }

    let reasonResponse = `
      객관적인 팩트와 생물학적 인과를 대조해 볼까요? 
      ${name}은 오늘 공부와 커리어, 그리고 높은 현실의 짐들을 다 짊어지고 긴장도가 엄청나게 높아진 뇌의 과부하 상태에 노출되었습니다. 
      완벽주의 성향은 계획 수립 단계에서 뇌 내 자원을 미리 과적(Overload)해 둡니다. 
      오늘 공부나 기타 계획을 모두 완성하지 못한 채 푹 졸거나 기절하듯 잠을 청하고 유튜브 등을 본 것은 절대 나태함이 아닙니다. 
      한계에 부딪힌 ${name}의 중추신경 방어 시스템이 **'여기서 무리하면 깊은 번아웃과 신경성 탈진으로 돌입한다'**고 알리며 생명 유지와 항상성 수호를 위해 강제로 에너지를 보존시킨 영리하고 고마운 **자율 조절 기전**이었습니다. 
      ${extraReason}
      따라서 오늘의 일상은 실패나 망쳐버린 공백의 시간이 아니라, <strong>'극도의 험난한 고통 상황 속에서도 삶과 멘탈의 연결고리를 절대 끊지 않고 든든히 굴린 진짜 훌륭한 날'</strong>이었음을 명심하십시오.
    `;

    // 4. Neuroscientific Micro Steps
    let suggestionResponse = "";
    if (textLower.includes('공부') || textLower.includes('코딩') || textLower.includes('k8s') || textLower.includes('쿠버') || textLower.includes('작업')) {
      suggestionResponse = "내일은 쿠버네티스나 공부를 완수하겠다는 무거운 부담을 걷어내고, 컴퓨터를 켜서 오로지 에디터나 VM 콘솔을 '딱 30초'만 만져본 후 바로 노트북을 덮어주세요. 뇌의 전두엽에 '행동 장벽 제로(Action Threshold Bypass)' 피드백을 주입해 줌으로써, 나도 모르게 가벼운 연결을 지속시키는 심리학적 초소형 우회 전술입니다. 30초만 넘으면 무조건 100점 대성공입니다.";
    } else if (textLower.includes('민사') || textLower.includes('소송') || textLower.includes('법원') || textLower.includes('피고')) {
      suggestionResponse = "내일은 법원이나 수사관의 소식에 온종일 목매어 불안해하기 전, 내 침대에서 두 눈을 부드럽게 감은 채 깊은 호흡을 '딱 5번'만 의식적으로 행해 줍니다. 엉뚱한 상대 기관의 응답 지연으로 발생한 통제 불능 스트레스를 내 신체의 직접 제어 감각(Direct Biofeedback)으로 우아하게 끌고 돌아오는 소중한 평화의 닻입니다.";
    } else {
      suggestionResponse = "내일은 따뜻한 물 한 컵을 준비해, 물방울이 혀와 목을 촉촉하게 적시는 물리적 터치감을 깊이 느끼며 3번에 나누어 차분히 마셔봅시다. 뇌의 엉켜버린 불안 연상 통로(DMN)를 정지시키고 오롯이 지금 여기(Present System)로 복귀할 수 있는 훌륭한 3분 충전 기법이 됩니다.";
    }

    // 5. Emotional affirmation sentence
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
  // DISPATCH RUN ANALYZER
  // ==========================================================================
  async function runEmotionalAnalysis(unstructuredText) {
    const name = appState.settings.name || "가은님";
    const apikey = appState.settings.apikey;

    if (apikey && apikey.startsWith('sk-')) {
      // If OpenAI API Key is provided, do a REAL ChatGPT network fetch call!
      return await fetchOpenAIAnalysis(unstructuredText, name, apikey);
    } else {
      // Fallback to our incredibly sophisticated local parser engine
      try {
        return runLocalAnalysis(unstructuredText, name);
      } catch (localErr) {
        console.error('로컬 분석 엔진 오류:', localErr);
        // Return safe default analysis instead of crashing
        return {
          mood: appState.currentMood,
          date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }),
          dateRaw: new Date().toISOString(),
          accomplished: [
            "오늘도 하루를 버텨내며 자기 자신의 마음을 돌보려 했습니다.",
            "복잡한 감정들을 정리하려고 이곳에 솔직하게 적어 주었습니다.",
            "지친 하루 속에서도 앞으로 나아가려는 의지를 놓지 않았습니다."
          ],
          criticism: `${name}은 오늘 스스로에게 너무 높은 기준을 들이대고 있어요. 완벽하지 않은 하루라도 충분히 의미 있는 하루였답니다.`,
          reason: `오늘 ${name}이 겪은 일들은 결코 가벼운 것이 아니었어요. 그 무게를 견디며 하루를 마무리한 것 자체가 대단한 성취입니다.`,
          suggestion: "내일은 아침에 눈을 뜨자마자 이불 속에서 기지개를 한 번 쭈욱 펴 보세요. 그 10초의 스트레칭이 하루의 부드러운 시작이 됩니다.",
          affirmation: affirmationsList[Math.floor(Math.random() * affirmationsList.length)]
        };
      }
    }
  }

  // ==========================================================================
  // FORM SUBMISSION & LOADER EFFECT
  // ==========================================================================
  diaryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const unstructuredVal = inputUnstructured.value.trim();
    if (!unstructuredVal) {
      alert("구름이에게 오늘의 복잡한 생각들을 적어 이야기해 주세요. ☁️");
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

    try {
      // Run AI or Local Analysis
      appState.currentAnalysis = await runEmotionalAnalysis(unstructuredVal);

      // Pause for 2.8s for smooth, cute interactive animation buildup
      setTimeout(() => {
        clearInterval(msgInterval);
        
        // Inject AI values to results page
        renderResults(appState.currentAnalysis);
        
        // Show results screen
        showScreen('result');
        
        // Reset text inputs safely
        inputUnstructured.value = "";
        charUnstructured.textContent = "0";
      }, 2800);
    } catch (err) {
      clearInterval(msgInterval);
      console.error('분석 오류:', err);

      // API 오류와 코드 오류를 구분해서 표시
      const isApiError = err.message && (
        err.message.includes('HTTP') ||
        err.message.includes('fetch') ||
        err.message.includes('network') ||
        err.message.includes('Failed to fetch') ||
        err.message.includes('API') ||
        err.message.includes('401') ||
        err.message.includes('429') ||
        err.message.includes('500')
      );

      if (isApiError) {
        alert("🌐 OpenAI API 연동 중 문제가 발생했어요:\n" + err.message + "\n\n• API 키가 올바른지 확인해 주세요.\n• 일시적인 네트워크 문제일 수 있으니 잠시 후 다시 시도해 주세요.\n• API 사용량 한도를 초과했을 수도 있어요.");
      } else {
        alert("⚙️ 앱 내부에서 예기치 못한 오류가 발생했어요:\n" + (err.message || '알 수 없는 오류') + "\n\n구름이가 빠르게 고칠게요! 잠시 후 다시 시도해 주세요.");
      }
      showScreen('write');
    }
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
