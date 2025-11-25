// ====================================
// 학생 세특(세부능력 및 특기사항) 자동 작성 Apps Script
// ====================================

// 사용 방법:
// 1. 스크립트 속성에 GEMINI_API_KEY를 미리 설정하세요
// 2. E열에 과목명 입력 (예: 국어, 수학, 영어)
// 3. F열에 활동 내용 입력 (구체적인 활동, 독서, 프로젝트 등)
// 4. G열에 등급 입력 (A, B, C)
// 5. 메뉴에서 "세특 작성 시작하기"를 클릭하세요
// 6. H열에 자동으로 세특이 생성됩니다 (등급별 차등 적용)

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
4. **난이도 및 어조 (매우 중요)**:
   - **일반적인 고등학생 수준**에 맞춰 작성하세요.
   - **너무 전문적인 학술 용어, 논문 투, 대학원 수준의 어려운 표현은 절대 사용하지 마세요.**
5. **사실성 및 내용 제한 (최우선 준수)**:
   - **입력된 활동 내용에 없는 구체적인 사건, 실험 결과, 특정 도서명(입력되지 않은 경우), 구체적인 제안 내용 등을 절대 지어내지 마세요.**
   - **입력된 키워드와 관련된 '일반적인 활동 과정'과 '학생의 태도/역량' 위주로 서술하세요.**
   - 예: "독서 감상문" -> 책을 읽고 깊이 있게 생각하는 과정, 비판적 사고력 등을 일반적인 수준에서 서술.
   - 예: "지속가능한 발전 토의" -> 토의에 적극적으로 참여하는 태도, 타인의 의견을 경청하고 자신의 주장을 논리적으로 펼치는 모습 등을 서술 (구체적으로 어떤 주장을 했는지는 입력 없으면 지어내지 말 것).

**절대 분석 내용이나 검증 포인트를 출력하지 마세요. 오직 세특 본문만 출력하세요.**
`;

// A등급 프롬프트
const GRADE_A_PROMPT = COMMON_HEADER_PROMPT + `

# 등급: A (탁월함)
이 학생은 학업 역량과 자기주도성이 매우 뛰어난 학생입니다.
활동의 깊이와 수준이 높으며, 심화된 탐구와 융합적 사고가 잘 드러나도록 작성하세요.

# 중요 글자 제한: 반드시 490자 이상 500자 미만
**최종 세특은 반드시 490자 이상 500자 미만이어야 합니다.**
**490자 미만이나 500자 이상은 절대 불가능합니다. 정확히 490-499자 범위에서 작성하세요.**

# 활동 내용:
{activity_description}
`;

// B등급 프롬프트
const GRADE_B_PROMPT = COMMON_HEADER_PROMPT + `

# 등급: B (우수함)
이 학생은 주어진 과제를 성실히 수행하고 우수한 학업 역량을 보여주는 학생입니다.
A등급보다는 최상급 표현(탁월함, 매우 뛰어남 등)을 줄이고, 과제를 잘 완수하고 성실히 참여했다는 점을 중심으로 작성하세요.

# 중요 글자 제한: 반드시 400자 이상 450자 미만
**최종 세특은 반드시 400자 이상 450자 미만이어야 합니다.**

# 활동 내용:
{activity_description}
`;

// C등급 프롬프트
const GRADE_C_PROMPT = COMMON_HEADER_PROMPT + `

# 등급: C (노력요함/발전가능성)
이 학생은 전반적으로 다소 부족한 면이 있으나, 수업에 참여하려고 노력하며 발전 가능성이 있는 학생입니다.
부족한 점을 직접적으로 지적하기보다는, 참여한 활동을 중심으로 긍정적인 변화와 노력하는 모습을 격려하는 어조로 작성하세요.

# 중요 글자 제한: 반드시 300자 이상 350자 미만
**최종 세특은 반드시 300자 이상 350자 미만이어야 합니다.**

# 활동 내용:
{activity_description}
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

// 2. Gemini Native API 호출 함수
function callOpenAI(activityDescription, rowNumber, grade, subjectName, lengthInstruction) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다.\nGoogle AI Studio (aistudio.google.com)에서 API 키를 발급받아\n스크립트 속성에서 GEMINI_API_KEY를 설정해주세요.');
  }

  const shuffledActivity = shuffleActivities(activityDescription);
  
  // 등급에 따른 프롬프트 선택
  let promptTemplate;
  const normalizedGrade = (grade || 'A').toString().toUpperCase().trim();
  
  if (normalizedGrade === 'B') {
    promptTemplate = GRADE_B_PROMPT;
  } else if (normalizedGrade === 'C') {
    promptTemplate = GRADE_C_PROMPT;
  } else {
    promptTemplate = GRADE_A_PROMPT;
  }
  
  let fullPrompt = promptTemplate.replace('{activity_description}', shuffledActivity);
  
  // 사용자 지정 글자수가 있으면 추가
  if (lengthInstruction) {
    fullPrompt += `\n\n**중요: 글자 수 제한 변경**\n${lengthInstruction}\n**이전의 모든 글자 수 제한 지시를 무시하고, 위 지시에 따르세요.**`;
  }
  
  // Gemini Native API Endpoint - API 키를 URL에 직접 포함
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [
      {
        parts: [
          {
            text: fullPrompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 1000
    }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode !== 200) {
      throw new Error(`Gemini API 오류 (코드: ${responseCode})\n응답: ${responseText}`);
    }
    
    const responseData = JSON.parse(responseText);
    
    // Gemini 네이티브 API 응답 구조 검증
    if (!responseData.candidates || !responseData.candidates[0] || 
        !responseData.candidates[0].content || !responseData.candidates[0].content.parts ||
        !responseData.candidates[0].content.parts[0] || !responseData.candidates[0].content.parts[0].text) {
      throw new Error('Gemini API 응답 형식 오류: 예상하지 못한 응답 구조\n응답: ' + responseText.substring(0, 200));
    }
    
    let content = responseData.candidates[0].content.parts[0].text.trim();
    
    // 후처리
    content = content.replace(/\s*[\(\[]?\d+자[\)\]]?$/g, '');
    content = content.replace(/^[\(\[]?\d+자[\)\]]?\s*[-–—]*\s*(검증|강조|분석|포인트).*$/gm, '');
    content = content.replace(/^(검증|강조|분석|포인트).*$/gm, '');
    
    // 특수문자 제거 (따옴표, 대괄호, 별표, 샵 등)
    content = content.replace(/[''""]/g, ''); // 특수 따옴표 제거
    content = content.replace(/[\*#\[\]]/g, '');
    content = content.replace(/^\s*[-•]\s*/gm, '');
    content = content.replace(/\n+/g, ' ');
    
    if (!content.endsWith('.')) {
      content += '.';
    }
    content = content.replace(/\.(?!\s|$)/g, '. ');
    content = content.replace(/\s+/g, ' ');
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
    const subjectCell = sheet.getRange(row, 5);
    const activityCell = sheet.getRange(row, 6);
    const gradeCell = sheet.getRange(row, 7);
    const setukCell = sheet.getRange(row, 8);
    
    const activityValue = activityCell.getValue();
    const gradeValue = gradeCell.getValue();
    const subjectValue = subjectCell.getValue();
    
    if (!activityValue || activityValue.toString().trim() === '') {
      continue;
    }
    
    try {
      setukCell.setValue('작성 중...');
      SpreadsheetApp.flush();
      
      const setukContent = callOpenAI(activityValue.toString(), row, gradeValue, subjectValue);
      setukCell.setValue(setukContent);
      
      setukCell.setWrap(true).setVerticalAlignment('middle');
      sheet.autoResizeRows(row, 1);
      
      successCount++;
      Utilities.sleep(1500);
      
    } catch (error) {
      setukCell.setValue('오류: ' + error.message);
      errorCount++;
    }
  }
  
  ui.alert(`작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

// 4. 비어있는 모든 행 처리
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
    'F열에 활동 내용이 있는 모든 학생의 세특을 작성합니다.\n계속하시겠습니까?',
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) {
    return;
  }
  
  const activityRange = sheet.getRange(2, 6, lastRow - 1, 1);
  const gradeRange = sheet.getRange(2, 7, lastRow - 1, 1);
  const setukRange = sheet.getRange(2, 8, lastRow - 1, 1);
  
  const activityValues = activityRange.getValues();
  const gradeValues = gradeRange.getValues();
  const setukValues = setukRange.getValues();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < activityValues.length; i++) {
    const row = i + 2;
    const activityValue = activityValues[i][0];
    const gradeValue = gradeValues[i][0];
    const setukValue = setukValues[i][0];
    
    if (activityValue && activityValue.toString().trim() !== '' && 
        (!setukValue || setukValue.toString().trim() === '')) {
      
      const setukCell = sheet.getRange(row, 8);
      
      try {
        setukCell.setValue('작성 중...');
        SpreadsheetApp.flush();
        
        const setukContent = callOpenAI(activityValue.toString(), row, gradeValue);
        setukCell.setValue(setukContent);
        
        setukCell.setWrap(true).setVerticalAlignment('middle');
        sheet.autoResizeRows(row, 1);
        
        successCount++;
        Utilities.sleep(1500);
        
      } catch (error) {
        setukCell.setValue('오류: ' + error.message);
        errorCount++;
      }
    }
  }
  
  ui.alert(`작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

// 5. 글자수 지정 함수들
function promptForByteLimit() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    '글자 수 지정 (Byte)',
    '작성할 내용의 목표 바이트(Byte) 수를 입력하세요.\n(예: 1500Byte ≈ 500자, 3Byte = 한글 1자)',
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

function generateSetukCustomLengthForAll() {
  const bytes = promptForByteLimit();
  if (!bytes) return;
  
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('처리할 데이터가 없습니다.');
    return;
  }
  
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '세특 작성을 시작합니다',
    `F열에 활동 내용이 있는 모든 학생의 세특을 작성합니다.\n(글자수: 약 ${Math.round(bytes/3)}자)\n계속하시겠습니까?`,
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) return;
  
  const lengthInstruction = `분량: 공백 포함 약 ${Math.round(bytes/3)}자 (${bytes}바이트) 내외로 작성하세요.`;
  
  const activityRange = sheet.getRange(2, 6, lastRow - 1, 1);
  const gradeRange = sheet.getRange(2, 7, lastRow - 1, 1);
  const setukRange = sheet.getRange(2, 8, lastRow - 1, 1);
  
  const activityValues = activityRange.getValues();
  const gradeValues = gradeRange.getValues();
  const setukValues = setukRange.getValues();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < activityValues.length; i++) {
    const row = i + 2;
    const activityValue = activityValues[i][0];
    const gradeValue = gradeValues[i][0];
    const setukValue = setukValues[i][0];
    
    if (activityValue && activityValue.toString().trim() !== '' && 
        (!setukValue || setukValue.toString().trim() === '')) {
      
      const setukCell = sheet.getRange(row, 8);
      
      try {
        setukCell.setValue('작성 중...');
        SpreadsheetApp.flush();
        
        const setukContent = callOpenAI(activityValue.toString(), row, gradeValue, null, lengthInstruction);
        setukCell.setValue(setukContent);
        
        setukCell.setWrap(true).setVerticalAlignment('middle');
        sheet.autoResizeRows(row, 1);
        
        successCount++;
        Utilities.sleep(1500);
        
      } catch (error) {
        setukCell.setValue('오류: ' + error.message);
        errorCount++;
      }
    }
  }
  
  ui.alert(`작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

function generateSetukCustomLengthForSelected() {
  const bytes = promptForByteLimit();
  if (!bytes) return;
  
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  const startRow = range.getRow();
  const numRows = range.getNumRows();
  
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '세특 작성을 시작합니다',
    `선택한 ${numRows}명의 세특을 작성합니다.\n(글자수: 약 ${Math.round(bytes/3)}자)\n계속하시겠습니까?`,
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) return;
  
  const lengthInstruction = `분량: 공백 포함 약 ${Math.round(bytes/3)}자 (${bytes}바이트) 내외로 작성하세요.`;
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    const activityCell = sheet.getRange(row, 6);
    const gradeCell = sheet.getRange(row, 7);
    const setukCell = sheet.getRange(row, 8);
    
    const activityValue = activityCell.getValue();
    const gradeValue = gradeCell.getValue();
    
    if (!activityValue || activityValue.toString().trim() === '') {
      continue;
    }
    
    try {
      setukCell.setValue('작성 중...');
      SpreadsheetApp.flush();
      
      const setukContent = callOpenAI(activityValue.toString(), row, gradeValue, null, lengthInstruction);
      setukCell.setValue(setukContent);
      
      setukCell.setWrap(true).setVerticalAlignment('middle');
      sheet.autoResizeRows(row, 1);
      
      successCount++;
      Utilities.sleep(1500);
      
    } catch (error) {
      setukCell.setValue('오류: ' + error.message);
      errorCount++;
    }
  }
  
  ui.alert(`작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

function autoResizeRowsSetuk() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('처리할 데이터가 없습니다.');
    return;
  }
  
  sheet.autoResizeRows(2, lastRow - 1);
  SpreadsheetApp.getUi().alert('셀 높이 자동 조절 완료!');
}