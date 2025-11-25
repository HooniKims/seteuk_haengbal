// ====================================
// 학생 세특(세부능력 및 특기사항) 자동 작성 Apps Script
// ====================================

// 사용 방법:
// 1. 스크립트 속성에 UPSTAGE_API_KEY를 미리 설정하세요
// 2. E열에 과목명 입력 (예: 국어, 수학, 영어)
// 3. F열에 활동 내용 입력 (구체적인 활동, 독서, 프로젝트 등)
// 4. G열에 등급 입력 (A, B, C)
// 5. 메뉴에서 "세특 작성 시작하기"를 클릭하세요
// 6. H열에 자동으로 세특이 생성됩니다 (등급별 차등 적용)

// 주의: onOpen() 함수는 "메뉴설정.gs" 파일에만 있어야 합니다.
// 이 파일에는 onOpen()이 없습니다.

// 1. 프롬프트 템플릿

// 공통 헤더
const COMMON_HEADER_PROMPT = `
당신은 이제 최고 수준의 교육학 전문관 및 진로 교사입니다. 그들의 목표는 교사가 입력한 학생 활동 내용을 분석하여, 학생의 학업 역량, 진로 역량, 공동체 역량을 명확하게 드러내도록 교육부 기재 요령과 학교의 특색 기준에 맞춘 세특을 작성하는 것입니다.

최우선 목표:
1. 자기주도성(Self-Directedness): 모든 활동 기록에서 학생이 스스로 문제를 발견하고, 해결 방법을 모색하며, 지식을 확장해 나가는 자발적인 학습 태도와 성장 과정을 가장 중요하게 드러내야 합니다.
2. 심화 및 융합 역량: 단순한 활동 나열이나 교과의 요약이 아닌, 특정 주제에 대한 깊이 있는 역량(Depth)과 여러 교과의 학생 사고력과의 융합(Fusion)을 통해 학생의 지적 호기심과 문제 해결 능력을 향상시켜야 합니다.
3. 과정 중심 서술: 결과보다 결과에 이르기까지의 노력, 시행착오, 성장의 변화를 구체적이고 개별적인 관찰 기록 형태로 서술합니다.

역량 평가 기준:
- 학업 역량: 학업 태도(성실한 수업, 목표 설정, 자발적 학습 태도), 역량(지적 호기심과 문제 해결 능력), 학업 성취
- 진로 역량: 희망(계열) 관련 교과 이수 능력 및 성취와 진로 탐색 활동과 경험
- 공동체 역량: 협업/소통, 배려/나눔, 성실한 규칙준수와 리더십

작성 주의사항:
1. 서술 형식 (문체): 개별적 관찰 기록 형태로 작성하며, 명사형 종결어미 사용 (~함, ~보임, ~드러남)
2. 금지 사항: 
   - 특정 성명, 기관명, 상호명, 강사명 등은 기재 불가
   - "학생은", "○○는", "OO는", "학습자는", "그는", "그녀는" 등 개인을 특정하는 표현 절대 사용 금지
   - 이름이나 성별을 암시하는 모든 표현 금지
   - 대신 "수업 중", "활동에서", "과제 수행 시", "토론 과정에서" 등 상황 중심으로 서술
3. 내용 구체성: 수업(무엇을 하는지) → 과정(어떻게 하는지) → 결과(무엇을 배웠고 성장하는지)의 순서로 구성함

# 절대 금지사항 (매우 중요)
- **출력물에 분석 내용, 검증 포인트, 글자 수, 설명 등을 절대 포함하지 마세요.**
- **오직 세특 내용(본문)만 출력하세요.**
- "(499자) -- 검증 포인트..." 같은 텍스트가 보이면 실패한 것으로 간주합니다.
- 순수한 생활기록부 문장만 작성하세요.
- **과목명을 직접 언급하지 마세요.** (예: "국어 수업 중", "수학 과제에서" 등 금지)
- 대신 "수업 중", "교과 활동 중", "학습 과정에서" 등 일반적인 표현을 사용하세요.
`;

// A등급 프롬프트 (기존과 동일 - 탁월함, 심화)
const GRADE_A_PROMPT = COMMON_HEADER_PROMPT + `

# 등급: A (탁월함)
이 학생은 학업 역량과 자기주도성이 매우 뛰어난 학생입니다.
활동의 깊이와 수준이 높으며, 심화된 탐구와 융합적 사고가 잘 드러나도록 작성하세요.

# 작성 예시 (반드시 참고할 것)
"""
독서감상문 작성 활동에서 다양한 관점으로 작품을 분석하고, 이를 바탕으로 창의적인 감상문을 작성하는 과정에서 깊이 있는 사고력과 표현력이 드러남. 나만의 문자 창제하기 과제 수행 시, 언어의 구조와 원리를 탐구하며 독창적인 문자 체계를 설계하고, 이를 설명하는 발표를 통해 논리적 사고와 창의성을 발휘함. 지속가능한 발전 방안 토의 과정에서 팀원들과 협력하여 다양한 아이디어를 제시하고, 이를 종합하여 실현 가능한 방안을 도출하는 데 기여함. 이러한 과정을 통해 문제 해결 능력과 협업 능력이 크게 향상됨. 전반적으로 자기주도적 학습 태도를 바탕으로 다양한 활동에 적극 참여하며, 학업 역량과 진로 역량을 동시에 발전시키는 모습이 관찰됨.
"""

# 중요 글자 제한: 반드시 490자 이상 500자 미만
**최종 세특은 반드시 490자 이상 500자 미만이어야 합니다.**
**490자 미만이나 500자 이상은 절대 불가능합니다. 정확히 490-499자 범위에서 작성하세요.**

# 강제 글자수 제한 구조 (절대 준수)
- 전체: 490-499자
- 도입부: 활동 참여 태도 (80-100자)
- 본문 1: 핵심 활동 사례 1 (150-180자)
- 본문 2: 핵심 활동 사례 2 (선택적, 120-150자)
- 과정/결과: 성장과 변화 (80-100자)
- 마무리: 종합적 역량 평가 (60-80자)
`;

// B등급 프롬프트 (우수함 - 칭찬 다소 축소, 잘 해내었다는 느낌)
const GRADE_B_PROMPT = COMMON_HEADER_PROMPT + `

# 등급: B (우수함)
이 학생은 주어진 과제를 성실히 수행하고 우수한 학업 역량을 보여주는 학생입니다.
A등급보다는 최상급 표현(탁월함, 매우 뛰어남 등)을 줄이고, 과제를 잘 완수하고 성실히 참여했다는 점을 중심으로 작성하세요.

# 작성 방향
1. 과제 수행의 성실함과 정확성을 강조
2. 수업 참여도와 노력하는 자세를 서술
3. "탁월함"보다는 "우수함", "성실함", "잘 수행함" 정도의 표현 사용

# 중요 글자 제한: 반드시 400자 이상 450자 미만
**최종 세특은 반드시 400자 이상 450자 미만이어야 합니다.**

# 강제 글자수 제한 구조 (절대 준수)
- 전체: 400-449자
- 도입부: 활동 참여 태도 (60-80자)
- 본문: 핵심 활동 사례 (200-250자)
- 마무리: 성장과 배움 (80-100자)
`;

// C등급 프롬프트 (노력함 - 부족하지만 발전 가능성)
const GRADE_C_PROMPT = COMMON_HEADER_PROMPT + `

# 등급: C (노력요함/발전가능성)
이 학생은 전반적으로 다소 부족한 면이 있으나, 수업에 참여하려고 노력하며 발전 가능성이 있는 학생입니다.
부족한 점을 직접적으로 지적하기보다는, 참여한 활동을 중심으로 긍정적인 변화와 노력하는 모습을 격려하는 어조로 작성하세요.

# 작성 방향
1. 결과보다는 참여 과정과 노력을 강조
2. 작은 성취라도 긍정적으로 서술하여 자신감을 북돋아줌
3. "부족함"이라는 단어보다는 "노력이 돋보임", "관심을 가짐", "참여함" 등으로 표현

# 중요 글자 제한: 반드시 300자 이상 350자 미만
**최종 세특은 반드시 300자 이상 350자 미만이어야 합니다.**

# 강제 글자수 제한 구조 (절대 준수)
- 전체: 300-349자
- 도입부: 수업 참여 태도 (50-70자)
- 본문: 활동 참여 내용 (150-200자)
- 마무리: 긍정적 변화와 기대 (50-80자)
`;

// 활동 섞기 함수 (다양성 확보)
function shuffleActivities(activityDescription) {
  if (!activityDescription || activityDescription.trim() === '') {
    return activityDescription;
  }
  
  let activities = [];
  let delimiter = null;
  
  // 쉼표가 2개 이상 있으면 쉼표로 분리
  if ((activityDescription.match(/,/g) || []).length >= 2) {
    activities = activityDescription.split(',').map(s => s.trim()).filter(s => s !== '');
    delimiter = ', ';
  }
  // 마침표가 2개 이상 있으면 마침표로 분리
  else if ((activityDescription.match(/\./g) || []).length >= 2) {
    activities = activityDescription.split('.').map(s => s.trim()).filter(s => s !== '');
    delimiter = '. ';
  }
  // 줄바꿈이 있으면 줄바꿈으로 분리
  else if (activityDescription.includes('\n')) {
    activities = activityDescription.split('\n').map(s => s.trim()).filter(s => s !== '');
    delimiter = '\n';
  }
  
  // 분리할 수 없으면 원본 반환
  if (activities.length < 2) {
    return activityDescription;
  }
  
  // 피셔-예이츠 셔플 알고리즘
  for (let i = activities.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [activities[i], activities[j]] = [activities[j], activities[i]];
  }
  
  // 마침표로 구분된 경우 마지막에만 마침표 추가
  if (delimiter === '. ') {
    return activities.join(delimiter) + '.';
  }
  
  return activities.join(delimiter);
}

// 2. Solar Pro 2 API 호출 함수 (Upstage)
function callOpenAI(activityDescription, rowNumber, grade, subjectName, lengthInstruction) {
  // Upstage API Key 사용
  const apiKey = PropertiesService.getScriptProperties().getProperty('UPSTAGE_API_KEY');
  
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다.\n스크립트 속성에서 UPSTAGE_API_KEY를 설정해주세요.');
  }

  // 활동 내용 섞기 (다양성 확보)
  const shuffledActivity = shuffleActivities(activityDescription);
  
  // 등급에 따른 프롬프트 선택
  let promptTemplate;
  let gradeInstruction = '';
  
  // 등급 정규화 (대소문자 무시, 공백 제거)
  const normalizedGrade = (grade || 'A').toString().toUpperCase().trim();
  
  if (normalizedGrade === 'B') {
    promptTemplate = GRADE_B_PROMPT;
    gradeInstruction = '등급: B (우수함, 성실한 과제 수행 중심, 400-450자)';
  } else if (normalizedGrade === 'C') {
    promptTemplate = GRADE_C_PROMPT;
    gradeInstruction = '등급: C (노력요함, 발전 가능성 중심, 300-350자)';
  } else {
    // 기본값 A
    promptTemplate = GRADE_A_PROMPT;
    gradeInstruction = '등급: A (탁월함, 심화 역량 중심, 490-500자)';
  }
  
  // 다양성을 위한 관점 배열
  const perspectives = [
    '특히 학업 역량과 탐구 능력을 중심으로',
    '특히 진로 역량과 전공 적합성을 중심으로',
    '특히 공동체 역량과 협업 능력을 중심으로',
    '특히 문제 해결 능력과 창의성을 중심으로',
    '특히 자기주도적 학습 태도를 중심으로',
    '특히 융합적 사고와 응용 능력을 중심으로'
  ];
  
  // 행 번호를 기반으로 다양한 관점 선택
  const perspective = perspectives[(rowNumber || 0) % perspectives.length];
  
  // 기본 프롬프트 템플릿 사용
  let prompt = promptTemplate.replace('{activity_description}', shuffledActivity);
  
  // 과목명 추가 (컨텍스트 제공용, 출력 금지 지시 포함)
  if (subjectName) {
    prompt += `\n\n**참고 과목명: ${subjectName}**\n(주의: 위 과목명을 문장에 직접 쓰지 마세요. "수업 시간에", "교과 활동 중" 등으로 표현하세요.)`;
  }
  
  // 글자 수 지침이 있으면 프롬프트 수정 (사용자 지정이 우선)
  if (lengthInstruction) {
    prompt += '\n\n**중요: 글자 수 제한 변경**\n' + lengthInstruction;
    prompt += '\n**이전의 모든 글자 수 제한 지시를 무시하고, 위 "중요: 글자 수 제한 변경"에 따르세요.**';
  }
  
  prompt += '\n\n**추가 지시: ' + perspective + ' 서술하되, 매번 다른 표현과 구조를 사용하세요.**';
  
  // Upstage Solar API Endpoint
  const url = 'https://api.upstage.ai/v1/chat/completions';
  const payload = {
    model: 'solar-pro2',
    messages: [
      {
        role: 'system',
        content: `당신은 대한민국 고등학교 교사로서 학생의 학교생활기록부 세부능력 및 특기사항(세특)을 작성하는 전문가입니다. 현재 작성 대상 학생의 등급은 [${gradeInstruction}]입니다. 이에 맞는 수준과 분량으로 작성하세요. 명사형 종결어미(~함, ~임, ~음)를 사용하고, 주어는 절대 사용하지 마세요. **절대 분석 내용이나 검증 포인트를 출력하지 마세요. 오직 세특 본문만 출력하세요.**`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.9,
    max_tokens: 1000
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseData = JSON.parse(response.getContentText());
    
    if (responseCode !== 200) {
      if (responseData.error) {
        throw new Error('Solar API 오류: ' + responseData.error.message);
      } else {
        throw new Error('Solar API 오류: 응답 코드 ' + responseCode);
      }
    }
    
    let content = responseData.choices[0].message.content.trim();
    
    // 후처리: 글자 수 표기 제거 (예: (498자), [498자], 498자 등)
    content = content.replace(/\s*[\(\[]?\d+자[\)\]]?$/g, '');
    
    // 후처리: 검증 포인트 및 분석 내용 제거 (강력한 정규식)
    // 예: (499자) -- 검증 포인트... 또는 [검증 포인트]...
    content = content.replace(/^[\(\[]?\d+자[\)\]]?\s*[-–—]*\s*(검증|강조|분석|포인트).*$/gm, '');
    content = content.replace(/^(검증|강조|분석|포인트).*$/gm, '');
    
    // 후처리: 특수문자 및 마크다운 제거 (괄호, 대괄호, 별표, 샵 등)
    content = content.replace(/[\*#\[\]]/g, ''); // 마크다운 및 대괄호 제거
    content = content.replace(/^\s*[-•]\s*/gm, ''); // 글머리 기호 제거
    
    // 후처리: 줄바꿈 제거 (하나의 문단으로 병합)
    content = content.replace(/\n+/g, ' ');
    
    // 후처리: 마침표 뒤 공백 강제 (마지막 마침표 제외)
    // 1. 모든 마침표 뒤에 공백이 없으면 공백 추가
    content = content.replace(/\.(?!\s|$)/g, '. ');
    // 2. 다중 공백 제거
    content = content.replace(/\s+/g, ' ');
    // 3. 마지막 마침표 뒤 공백 제거
    content = content.trim();
    
    return content;
  } catch (error) {
    throw new Error('API 호출 실패: ' + error.message);
  }
}

// 3. 선택한 행의 세특 작성
function generateSetukForSelectedRows() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  const startRow = range.getRow();
  const numRows = range.getNumRows();
  
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '세특 작성을 시작합니다',
    `선택한 ${numRows}명의 세특을 작성합니다.\n계속하시겠습니까?`,
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) {
    return;
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    const subjectCell = sheet.getRange(row, 5);  // E열 (과목명)
    const activityCell = sheet.getRange(row, 6); // F열 (활동 내용)
    const gradeCell = sheet.getRange(row, 7);    // G열 (등급)
    const setukCell = sheet.getRange(row, 8);    // H열 (결과)
    
    const subjectValue = subjectCell.getValue();
    const activityValue = activityCell.getValue();
    const gradeValue = gradeCell.getValue();
    
    if (!activityValue || activityValue.toString().trim() === '') {
      continue;
    }
    
    try {
      setukCell.setValue('작성 중...');
      SpreadsheetApp.flush();
      
      const setukContent = callOpenAI(activityValue.toString(), row, gradeValue, subjectValue);
      setukCell.setValue(setukContent);
      
      // 서식 자동 적용 (행 높이 및 정렬)
      applyAutoFormatting(sheet, row);
      
      successCount++;
      Utilities.sleep(1000); // API 호출 간격 (Rate Limit 방지)
      
    } catch (error) {
      setukCell.setValue('오류: ' + error.message);
      errorCount++;
    }
  }
  
  ui.alert(`✅ 작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

// 6. F열에 데이터가 있고 H열이 비어있는 모든 행 처리
function generateSetukForAllEmpty() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('처리할 데이터가 없습니다.');
    return;
  }
  
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '세특 작성을 시작합니다',
    'F열에 활동 내용이 있는 모든 학생의 세특을 작성합니다.\n(E열 과목명, G열 등급 반영)\n계속하시겠습니까?',
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) {
    return;
  }
  
  const subjectRange = sheet.getRange(2, 5, lastRow - 1, 1);  // E2부터
  const activityRange = sheet.getRange(2, 6, lastRow - 1, 1); // F2부터
  const gradeRange = sheet.getRange(2, 7, lastRow - 1, 1);    // G2부터
  const setukRange = sheet.getRange(2, 8, lastRow - 1, 1);    // H2부터
  
  const subjectValues = subjectRange.getValues();
  const activityValues = activityRange.getValues();
  const gradeValues = gradeRange.getValues();
  const setukValues = setukRange.getValues();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < activityValues.length; i++) {
    const row = i + 2;
    const subjectValue = subjectValues[i][0];
    const activityValue = activityValues[i][0];
    const gradeValue = gradeValues[i][0];
    const setukValue = setukValues[i][0];
    
    // F열에 데이터가 있고 H열이 비어있는 경우만 처리
    if (activityValue && activityValue.toString().trim() !== '' && 
        (!setukValue || setukValue.toString().trim() === '')) {
      
      const setukCell = sheet.getRange(row, 8);
      
      try {
        setukCell.setValue('작성 중...');
        SpreadsheetApp.flush();
        
        const setukContent = callOpenAI(activityValue.toString(), row, gradeValue, subjectValue);
        setukCell.setValue(setukContent);
        
        // 서식 자동 적용 (행 높이 및 정렬)
        applyAutoFormatting(sheet, row);
        
        successCount++;
        Utilities.sleep(1000); // API 호출 간격
        
      } catch (error) {
        setukCell.setValue('오류: ' + error.message);
        errorCount++;
      }
    }
  }
  
  ui.alert(`✅ 작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

// 7. 사용자로부터 바이트 수 입력받기
function promptForByteLimit() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    '글자 수 지정 (Byte)',
    '작성할 내용의 목표 바이트(Byte) 수를 입력하세요.\n(예: 1500Byte ≈ 500자, 3Byte = 한글 1자)\n*주의: 등급별 기본 제한보다 이 설정이 우선됩니다.',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() == ui.Button.OK) {
    const input = result.getResponseText().trim();
    const bytes = parseInt(input);
    
    if (isNaN(bytes) || bytes <= 0) {
      ui.alert('올바른 숫자를 입력해주세요.');
      return null;
    }
    return bytes;
  }
  return null;
}

// 8. 서식 자동 적용 함수
function applyAutoFormatting(sheet, row) {
  // H열 (세특) 자동 줄바꿈 및 세로 가운데 정렬
  const cell = sheet.getRange(row, 8);
  cell.setWrap(true)
    .setVerticalAlignment('middle');
  
  // 행 높이 자동 조절
  sheet.autoResizeRows(row, 1);
  
  // E, F, G열 가운데 정렬
  sheet.getRange(row, 5)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.getRange(row, 6)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.getRange(row, 7)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
}