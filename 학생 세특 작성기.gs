// ====================================
// 학생 세특 자동 작성 Apps Script (OpenAI API)
// 초보자용 간편 버전
// ====================================

// 사용 방법:
// 1. 스크립트 속성에 OPENAI_API_KEY를 미리 설정하세요
// 2. E열에 학생 활동 내용을 입력하세요
// 3. 메뉴에서 "세특 작성 시작하기"를 클릭하세요
// 4. F열에 자동으로 세특이 생성됩니다

// 1. API 키 관리 함수들 (관리자용 - 필요시 사용)
// 일반 사용자는 스크립트 속성에 직접 API 키를 입력하면 됩니다.
/*
function setApiKey() {
  const ui = SpreadsheetApp.getUi();
  const currentKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  
  let message = 'OpenAI API 키를 입력하세요:';
  if (currentKey) {
    const maskedKey = currentKey.substring(0, 10) + '...' + currentKey.substring(currentKey.length - 4);
    message = '현재 저장된 키: ' + maskedKey + '\n\n새 API 키를 입력하세요 (취소하면 기존 키 유지):';
  }
  
  const response = ui.prompt('OpenAI API 키 설정', message, ui.ButtonSet.OK_CANCEL);
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const apiKey = response.getResponseText().trim();
    if (apiKey) {
      PropertiesService.getScriptProperties().setProperty('OPENAI_API_KEY', apiKey);
      ui.alert('API 키가 저장되었습니다.');
    } else {
      ui.alert('API 키가 입력되지 않았습니다.');
    }
  }
}

function checkApiKey() {
  const ui = SpreadsheetApp.getUi();
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  
  if (apiKey) {
    const maskedKey = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4);
    ui.alert('API 키 확인', '현재 저장된 API 키:\n' + maskedKey, ui.ButtonSet.OK);
  } else {
    ui.alert('API 키 확인', 'API 키가 설정되지 않았습니다.\n\n스크립트 속성에 직접 입력해주세요.', ui.ButtonSet.OK);
  }
}

function deleteApiKey() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    'API 키 삭제',
    '저장된 API 키를 삭제하시겠습니까?',
    ui.ButtonSet.YES_NO
  );
  
  if (result === ui.Button.YES) {
    PropertiesService.getScriptProperties().deleteProperty('OPENAI_API_KEY');
    ui.alert('API 키가 삭제되었습니다.');
  }
}
*/

// 2. 메뉴 추가 (초보자용 단순 버전)
//function onOpen() {
  //const ui = SpreadsheetApp.getUi();
  //ui.createMenu('📋 세특 작성')
    //.addItem('✨ 세특 작성 시작하기', 'generateSetukForAllEmpty')
    //.addItem('✍️ 선택한 행만 작성하기', 'generateSetukForSelectedRows')
    //.addSeparator()
    //.addItem('📏 셀 높이 자동 조절', 'autoResizeRows')
    //.addToUi();
//}

// 3. 프롬프트 템플릿
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
1. 글자수 제한: 과목별 특기사항 및 종합의견은 반드시 490자 이상 500자 미만으로 작성
2. 서술 형식 (문체): 개별적 관찰 기록 형태로 작성하며, 명사형 종결어미 사용 (~함, ~보임, ~드러남)
3. 금지 사항: 
   - 특정 성명, 기관명, 상호명, 강사명 등은 기재 불가
   - "학생은", "○○는", "OO는", "학습자는", "그는", "그녀는" 등 개인을 특정하는 표현 절대 사용 금지
   - 이름이나 성별을 암시하는 모든 표현 금지
   - 대신 "수업 중", "활동에서", "과제 수행 시", "토론 과정에서" 등 상황 중심으로 서술
4. 내용 구체성: 수업(무엇을 하는지) → 과정(어떻게 하는지) → 결과(무엇을 배웠고 성장하는지)의 순서로 구성함
`;

const SETUK_PROMPT_TEMPLATE = COMMON_HEADER_PROMPT + `

# 작성 예시 (반드시 참고할 것)
다음은 우수한 세특 작성 예시입니다. 이 예시의 문체, 구조, 표현 방식을 참고하여 작성하세요:

"""
독서감상문 작성 활동에서 다양한 관점으로 작품을 분석하고, 이를 바탕으로 창의적인 감상문을 작성하는 과정에서 깊이 있는 사고력과 표현력이 드러남. 나만의 문자 창제하기 과제 수행 시, 언어의 구조와 원리를 탐구하며 독창적인 문자 체계를 설계하고, 이를 설명하는 발표를 통해 논리적 사고와 창의성을 발휘함. 지속가능한 발전 방안 토의 과정에서 팀원들과 협력하여 다양한 아이디어를 제시하고, 이를 종합하여 실현 가능한 방안을 도출하는 데 기여함. 이러한 과정을 통해 문제 해결 능력과 협업 능력이 크게 향상됨. 전반적으로 자기주도적 학습 태도를 바탕으로 다양한 활동에 적극 참여하며, 학업 역량과 진로 역량을 동시에 발전시키는 모습이 관찰됨.
"""

# 예시에서 배울 점
1. "~에서", "~시", "~과정에서" 등으로 시작하는 상황 중심 서술
2. "~함", "~드러남", "~발휘함", "~기여함", "~향상됨", "~관찰됨" 등 명사형 종결
3. 활동 → 과정 → 결과/성장의 자연스러운 흐름
4. 개인 특정 표현 완전 배제
5. 자기주도성, 창의성, 협업능력 구체적 서술

# 중요: 다양성과 창의성 확보
**같은 활동명이라도 매번 다른 관점과 표현으로 작성해야 합니다.**

다양성 확보 방법:
1. 강조점 변화: 같은 활동이라도 매번 다른 역량을 부각 (학업역량/진로역량/공동체역량 중 선택)
2. 서술 순서 변화: 활동→과정→결과 / 태도→활동→성장 / 과정→결과→의미 등 다양하게
3. 표현 다양화: 동일한 의미라도 다른 표현 사용
   - "드러남" → "나타남", "확인됨", "보임"
   - "향상됨" → "발전함", "성장함", "제고됨"
   - "분석하고" → "탐구하고", "고찰하고", "검토하고"
4. 구체성 차별화: 어떤 세특은 과정 중심, 어떤 세특은 결과 중심으로 서술
5. 측면 다양화: 
   - 인지적 측면: 사고력, 분석력, 문제해결력
   - 정의적 측면: 태도, 열정, 끈기, 자기주도성
   - 사회적 측면: 협업, 소통, 리더십, 배려
   - 매번 다른 측면을 강조하여 작성

# 중요 글자 제한: 최종 결과물은 반드시 490자 이상 500자 미만
**입력되는 활동 사례가 1개든 10개든 상관없이, 최종 세특은 반드시 490자 이상 500자 미만이어야 합니다.**
**490자 미만이나 500자 이상은 절대 불가능합니다. 정확히 490-499자 범위에서 작성하세요.**

# 사례가 많을 때 처리 방법
1. 모든 사례를 나열하려고 하지 마세요
2. 가장 중요한 2-3개 사례만 선택하세요 
3. 선택한 사례들을 간결하게 요약하세요
4. 최종 결과가 490-499자가 되도록 조절하세요

# 절대 금지사항
- 사례를 모두 나열하는 것
- 500자를 넘기는 것
- "여러 활동을 통해..." 같은 형식적 표현으로 모든 사례를 언급하는 것
- "학생은", "○○는", "OO는", "학습자는" 등 개인 특정 표현 절대 금지
- 이름이나 성별을 암시하는 모든 표현 금지

# 작성 지침
**입력 사례가 많을 때**: 핵심 사례 2-3개만 선택 후 간결하게 통합 서술 후 500자 이하 완성
**입력 사례가 적을 때**: 사례를 상세히 서술하되 500자 이하 준수

# 강제 글자수 제한 구조 (절대 준수)
- 전체: 490-499자(반드시 이 범위 내에서 작성)
- 도입부: 활동 참여 태도 (80-100자)
- 본문 1: 핵심 활동 사례 1 (150-180자)
- 본문 2: 핵심 활동 사례 2 (선택적, 120-150자)
- 과정/결과: 성장과 변화 (80-100자)
- 마무리: 종합적 역량 평가 (60-80자)
- 금지어: "학생은", "○○는", "OO는", "학습자는", "그는", "그녀는" 등 개인 특정 표현 절대 사용 금지

---
<교사_관찰기록>
학생 활동 내용:
{activity_description}
</교사_관찰기록>
---

**최종 지시사항**
1. 위 예시문의 문체와 구조를 반드시 참고하세요
2. **같은 활동명이라도 매번 완전히 다른 관점과 표현으로 작성하세요**
3. 매번 다른 역량(학업/진로/공동체)을 강조하고, 다른 서술 구조를 사용하세요
4. 동일한 표현의 반복을 피하고 창의적인 표현을 사용하세요
5. 활동 중에서 핵심적인 것만 선택하여 통합하고, 반드시 490자 이상 500자 미만으로 작성하세요
6. "~에서", "~시", "~과정에서" 등으로 시작하는 상황 중심 서술을 사용하세요
7. "학생은", "○○는", "OO는", "학습자는", "그는", "그녀는" 등 개인을 특정하는 표현은 절대 사용하지 마세요
8. 490자 미만이나 500자 이상은 절대 안됩니다
9. 세특 내용만 출력하세요. 다른 설명이나 주석은 포함하지 마세요
`;

// 4. OpenAI API 호출 함수
function callOpenAI(activityDescription, rowNumber, lengthInstruction) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다.\n관리자에게 문의하세요.');
  }
  
  // 다양성을 위한 관점 배열
  const perspectives = [
    '특히 학업 역량과 자기주도성을 중심으로',
    '특히 진로 탐색과 전문성 개발 측면에서',
    '특히 협업 능력과 공동체 의식을 중심으로',
    '특히 창의적 문제해결 능력을 중심으로',
    '특히 비판적 사고와 분석력을 중심으로',
    '특히 의사소통 능력과 표현력을 중심으로'
  ];
  
  // 행 번호를 기반으로 다양한 관점 선택
  const perspective = perspectives[(rowNumber || 0) % perspectives.length];
  
  // 기본 프롬프트 템플릿 사용
  let prompt = SETUK_PROMPT_TEMPLATE.replace('{activity_description}', activityDescription);
  
  // 글자 수 지침이 있으면 프롬프트 수정
  if (lengthInstruction) {
    // 기존 글자 수 제한 내용을 새로운 지침으로 대체하거나 추가
    prompt += '\n\n**중요: 글자 수 제한 변경**\n' + lengthInstruction;
    // 기존 500자 제한 무시하도록 강력한 지시 추가
    prompt += '\n**이전의 모든 글자 수 제한 지시를 무시하고, 위 "중요: 글자 수 제한 변경"에 따르세요.**';
  }
  
  prompt += '\n\n**추가 지시: ' + perspective + ' 서술하되, 매번 다른 표현과 구조를 사용하세요.**';
  
  const url = 'https://api.openai.com/v1/chat/completions';
  const payload = {
    model: 'gpt-4o',  // gpt-4o, gpt-4, gpt-3.5-turbo 등 선택 가능
    messages: [
      {
        role: 'system',
        content: '당신은 학생 세특(세부능력 및 특기사항)을 작성하는 전문 교사입니다. 같은 활동이라도 매번 다른 관점과 표현으로 창의적이고 다채롭게 작성해야 합니다.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.9,  // 다양성을 위해 높은 값 사용
    max_tokens: 2000
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
        throw new Error('API 오류: ' + responseData.error.message);
      } else {
        throw new Error('API 오류: 응답 코드 ' + responseCode);
      }
    }
    
    return responseData.choices[0].message.content.trim();
  } catch (error) {
    throw new Error('API 호출 실패: ' + error.message);
  }
}

// 5. 선택한 행의 세특 작성
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
    const activityCell = sheet.getRange(row, 5); // E열
    const setukCell = sheet.getRange(row, 6); // F열
    
    const activityValue = activityCell.getValue();
    
    if (!activityValue || activityValue.toString().trim() === '') {
      continue;
    }
    
    try {
      setukCell.setValue('작성 중...');
      SpreadsheetApp.flush();
      
      const setukContent = callOpenAI(activityValue.toString(), row);
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

// 6. E열에 데이터가 있고 F열이 비어있는 모든 행 처리
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
    'E열에 활동 내용이 있는 모든 학생의 세특을 작성합니다.\n계속하시겠습니까?',
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) {
    return;
  }
  
  const activityRange = sheet.getRange(2, 5, lastRow - 1, 1); // E2부터
  const setukRange = sheet.getRange(2, 6, lastRow - 1, 1); // F2부터
  
  const activityValues = activityRange.getValues();
  const setukValues = setukRange.getValues();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < activityValues.length; i++) {
    const row = i + 2;
    const activityValue = activityValues[i][0];
    const setukValue = setukValues[i][0];
    
    // E열에 데이터가 있고 F열이 비어있는 경우만 처리
    if (activityValue && activityValue.toString().trim() !== '' && 
        (!setukValue || setukValue.toString().trim() === '')) {
      
      const setukCell = sheet.getRange(row, 6);
      
      try {
        setukCell.setValue('작성 중...');
        SpreadsheetApp.flush();
        
        const setukContent = callOpenAI(activityValue.toString(), row);
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

// 8. 글자 수 지정 - 선택한 행 작성
function generateSetukCustomLengthForSelected() {
  const bytes = promptForByteLimit();
  if (!bytes) return;
  
  const charCount = Math.round(bytes / 3);
  const lengthInstruction = `작성 분량: 약 ${bytes}바이트 (한글 기준 약 ${charCount}자) 내외로 작성하세요.`;
  
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  const startRow = range.getRow();
  const numRows = range.getNumRows();
  
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '세특 작성을 시작합니다',
    `선택한 ${numRows}명의 세특을 작성합니다.\n목표 분량: ${bytes}Byte (약 ${charCount}자)\n계속하시겠습니까?`,
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) {
    return;
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    const activityCell = sheet.getRange(row, 5); // E열
    const setukCell = sheet.getRange(row, 6); // F열
    
    const activityValue = activityCell.getValue();
    
    if (!activityValue || activityValue.toString().trim() === '') {
      continue;
    }
    
    try {
      setukCell.setValue('작성 중...');
      SpreadsheetApp.flush();
      
      const setukContent = callOpenAI(activityValue.toString(), row, lengthInstruction);
      setukCell.setValue(setukContent);
      
      applyAutoFormatting(sheet, row);
      
      successCount++;
      Utilities.sleep(1000);
      
    } catch (error) {
      setukCell.setValue('오류: ' + error.message);
      errorCount++;
    }
  }
  
  ui.alert(`✅ 작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

// 9. 글자 수 지정 - 전체 작성
function generateSetukCustomLengthForAll() {
  const bytes = promptForByteLimit();
  if (!bytes) return;
  
  const charCount = Math.round(bytes / 3);
  const lengthInstruction = `작성 분량: 약 ${bytes}바이트 (한글 기준 약 ${charCount}자) 내외로 작성하세요.`;
  
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('처리할 데이터가 없습니다.');
    return;
  }
  
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '세특 작성을 시작합니다',
    `E열에 활동 내용이 있는 모든 학생의 세특을 작성합니다.\n목표 분량: ${bytes}Byte (약 ${charCount}자)\n계속하시겠습니까?`,
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) {
    return;
  }
  
  const activityRange = sheet.getRange(2, 5, lastRow - 1, 1);
  const setukRange = sheet.getRange(2, 6, lastRow - 1, 1);
  
  const activityValues = activityRange.getValues();
  const setukValues = setukRange.getValues();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < activityValues.length; i++) {
    const row = i + 2;
    const activityValue = activityValues[i][0];
    const setukValue = setukValues[i][0];
    
    if (activityValue && activityValue.toString().trim() !== '' && 
        (!setukValue || setukValue.toString().trim() === '')) {
      
      const setukCell = sheet.getRange(row, 6);
      
      try {
        setukCell.setValue('작성 중...');
        SpreadsheetApp.flush();
        
        const setukContent = callOpenAI(activityValue.toString(), row, lengthInstruction);
        setukCell.setValue(setukContent);
        
        applyAutoFormatting(sheet, row);
        
        successCount++;
        Utilities.sleep(1000);
        
      } catch (error) {
        setukCell.setValue('오류: ' + error.message);
        errorCount++;
      }
    }
  }
  
  ui.alert(`✅ 작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

// 10. 서식 자동 적용 (행 높이 및 정렬)
function autoResizeRowsSetuk() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    return;
  }
  
  // 전체 행에 대해 서식 적용
  for (let row = 2; row <= lastRow; row++) {
    applyAutoFormatting(sheet, row);
  }
  
  SpreadsheetApp.getUi().alert('✅ 서식(행 높이, 정렬)이 자동으로 적용되었습니다.');
}

// 단일 행에 대한 서식 적용 함수
function applyAutoFormatting(sheet, row) {
  // 1. F열(세특) 자동 줄바꿈 및 세로 가운데 정렬 설정
  const setukCell = sheet.getRange(row, 6);
  setukCell.setWrap(true)
    .setVerticalAlignment('middle');
  
  // 2. 행 높이 자동 조절
  sheet.autoResizeRows(row, 1);
  
  // 3. 특정 열 가운데 정렬 (A~D, E, G, I)
  // A~D열 (1~4열)
  sheet.getRange(row, 1, 1, 4)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
    
  // E열 (5열)
  sheet.getRange(row, 5)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
    
  // G열 (7열)
  sheet.getRange(row, 7)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
    
  // I열 (9열)
  sheet.getRange(row, 9)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
}

// 11. E열 편집 시 자동 실행 (선택사항 - 주석 해제하여 사용)
/*
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  
  // E열이 편집되었는지 확인
  if (range.getColumn() !== 5) {
    return;
  }
  
  const row = range.getRow();
  
  // 헤더 행 제외
  if (row < 2) {
    return;
  }
  
  const activityValue = range.getValue();
  const setukCell = sheet.getRange(row, 6);
  
  // E열에 값이 있고 F열이 비어있을 때만 자동 실행
  if (activityValue && activityValue.toString().trim() !== '' && 
      (!setukCell.getValue() || setukCell.getValue().toString().trim() === '')) {
    
    try {
      setukCell.setValue('작성 중...');
      SpreadsheetApp.flush();
      
      const setukContent = callOpenAI(activityValue.toString(), row);
      setukCell.setValue(setukContent);
      
      // 서식 자동 적용
      applyAutoFormatting(sheet, row);
      
    } catch (error) {
      setukCell.setValue('오류: ' + error.message);
    }
  }
}
*/