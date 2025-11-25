// ====================================
// 학생 행발(행동특성 및 종합의견) 자동 작성 Apps Script
// ====================================

// 사용 방법:
// 1. 스크립트 속성에 UPSTAGE_API_KEY를 미리 설정하세요
// 2. I열에 관찰 키워드 입력 (성격, 학습 태도, 행동 특성)
// 3. 메뉴에서 "행발 작성 시작하기"를 클릭하세요
// 4. J열에 자동으로 행발이 생성됩니다 (300자 이상, 명사형 종결)

// 주의: onOpen() 함수는 "메뉴설정.gs" 파일에만 있어야 합니다.
// 이 파일에는 onOpen()이 없습니다.

// 1. 프롬프트 템플릿
const HAENGBAL_PROMPT = `
당신은 대한민국 담임 교사로서 학생의 행동특성 및 종합의견을 작성하는 전문가입니다.

## 작성 목표
관찰 키워드를 기반으로 학생의 **전반적인 성격, 학습 태도, 행동 특성**을 종합하여 300자 이상의 생활기록부를 작성하세요.

**중요**: 관찰 키워드를 그대로 반복하거나 첫 문장에 그대로 사용하지 마세요. 
키워드의 의미를 파악하고, 이를 바탕으로 학생의 전반적인 특성을 **새롭게 재구성하여** 자연스럽게 서술하세요.

## 주요 작성 원칙
1. **키워드 재구성**: 입력된 키워드를 그대로 반복하지 말고, 의미를 해석하여 새로운 문장으로 재구성
2. **전반적인 특성 중심**: 학생의 일상적 행동, 성격, 태도를 종합적으로 서술
3. **성격, 학습 태도, 활동 포함**: 이 세 가지 영역을 균형있게 작성
4. **명사형 종결**: "~함", "~임", "~음"으로 문장 마무리
5. **주어 생략**: "학생은", "○○는" 등의 표현 절대 사용 금지
6. **300자 이상**: 관찰 키워드를 바탕으로 풍부하게 서술

## 키워드 재구성 방법

**잘못된 예시 (키워드 그대로 반복):**
- 키워드: "성실함, 적극적, 협력적"
- 나쁜 행발: "성실하고 적극적이며 협력적인 태도를 보임. ..."

**올바른 예시 (키워드를 재구성하여 자연스럽게 표현):**
- 키워드: "성실함, 적극적, 협력적"
- 좋은 행발: "맡은 바 책임을 다하며 꾸준히 노력하는 모습을 보임. 수업과 활동에 주도적으로 참여하고, 친구들과의 협력 과정에서 소통 능력을 발휘함. ..."

## 우수한 행발 예시

**예시 1:**
맡은 바 책임을 다하며 성실한 자세로 학교생활에 임함. 수업 시간에 집중력을 유지하고 과제를 꼼꼼히 수행하는 등 학습에 대한 열의가 높음. 친구들과의 관계에서 배려심을 발휘하며 어려움을 겪는 친구를 자연스럽게 도와주는 따뜻한 성품을 지님. 자신의 생각을 차분히 정리하여 표현하는 능력이 있으며, 타인의 의견도 경청하는 열린 태도를 보임. 학급 활동에 빠짐없이 참여하며 긍정적인 영향력을 발휘함.

**예시 2:**
차분하고 신중한 성격으로 모든 일에 계획적으로 접근하는 모습이 돋보임. 학습에 대한 관심이 많아 수업 내용을 깊이 있게 이해하려 노력하며, 궁금한 점은 질문을 통해 해결하는 자기주도적 학습 태도를 지님. 친구들과 안정적인 관계를 형성하고 있으며, 갈등 상황에서도 침착하게 대응하는 성숙함을 보임. 조용한 편이지만 필요한 순간에는 자신의 의견을 논리적으로 전달하는 능력이 있음. 성실하게 주어진 역할을 수행하며 주변의 신뢰를 받음.

**예시 3:**
밝고 긍정적인 성격으로 주변 사람들과 원만한 관계를 맺으며 학급 분위기에 활력을 불어넣음. 수업 참여도가 높으며 자신의 의견을 주저 없이 표현하는 적극성을 지님. 협력이 필요한 상황에서 팀원들과 효과적으로 소통하며 공동의 목표 달성을 위해 노력하는 태도를 보임. 가끔 성급한 면을 보이기도 하나, 스스로를 돌아보며 발전하려는 의지가 있음. 새로운 경험에 열려 있어 다양한 활동에 도전하는 진취적인 모습을 보임.

## 예시에서 배울 점
1. **키워드를 새롭게 표현**: "성실함" → "맡은 바 책임을 다하며", "꼼꼼히 수행"
2. **구체적으로 풀어쓰기**: "협력적" → "팀원들과 효과적으로 소통하며 공동의 목표 달성을 위해 노력"
3. **자연스러운 흐름**: 성격 → 학습 → 관계 → 활동으로 자연스럽게 연결
4. **다양한 표현**: 같은 의미를 여러 방식으로 표현

## 작성 구조 가이드
- 도입: 전반적인 태도나 성격 (키워드 의미를 재구성하여 표현)
- 학습 태도: 수업 참여, 과제 수행 방식
- 대인관계: 친구 관계, 소통 방식
- 마무리: 성장 가능성, 전체적 평가

## 절대 금지사항
- **입력된 키워드를 첫 문장에 그대로 반복하지 마세요**
- **키워드를 나열식으로 사용하지 마세요** (예: "성실하고 적극적이며 협력적임")
- "학생은", "○○는", "OO는" 등 주어 사용 금지
- 특정 활동이나 과제명 언급 금지
- 사교육 관련 내용 금지

## 중요: 키워드 활용 방법
1. 키워드의 **의미를 파악**하세요
2. 그 의미를 **다른 표현으로 재구성**하세요
3. **구체적인 행동으로 풀어쓰세요**
4. **자연스러운 문장으로 연결**하세요

예시:
- 키워드: "리더십" 
- 재구성: "학급 활동에서 솔선수범하며 친구들을 이끄는 모습을 보임"
- 키워드: "책임감"
- 재구성: "맡은 바 역할을 끝까지 완수하려는 성실한 자세를 지님"

---
<교사_관찰기록>
관찰 키워드:
{behavior_description}
</교사_관찰기록>
---

**최종 지시사항**
1. **절대 위의 관찰 키워드를 그대로 반복하지 마세요**
2. 키워드의 의미를 파악하고, 이를 새로운 문장으로 재구성하여 작성하세요
3. 학생의 전반적인 성격, 학습 태도, 행동 특성을 종합적으로 서술하세요
4. 명사형 종결어미 "~함", "~임", "~음"을 사용하세요
5. 주어는 절대 사용하지 마세요
6. 최종 결과는 반드시 300자 이상이어야 합니다
7. **줄바꿈 없이 하나의 문단으로 작성하세요.** (중간에 줄바꿈 절대 금지)
8. **마지막에 글자 수(예: 350자)를 표기하지 마세요.**
9. 행발 내용만 출력하세요. 다른 설명이나 주석은 포함하지 마세요
`;

// 2. Solar Pro 2 API 호출 함수 (Upstage)
function callOpenAIHaengbal(behaviorDescription, rowNumber, lengthInstruction) {
  // Upstage API Key 사용
  const apiKey = PropertiesService.getScriptProperties().getProperty('UPSTAGE_API_KEY');
  
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다.\n스크립트 속성에서 UPSTAGE_API_KEY를 설정해주세요.');
  }
  
  // 다양성을 위한 관점 배열
  const perspectives = [
    '특히 성격과 학습 태도를 중심으로',
    '특히 대인관계와 협력 능력을 중심으로',
    '특히 책임감과 성실성을 중심으로',
    '특히 의사소통과 표현 능력을 중심으로',
    '특히 성장 가능성과 개선 노력을 중심으로',
    '특히 학급 기여도와 리더십을 중심으로'
  ];
  
  // 행 번호를 기반으로 다양한 관점 선택
  const perspective = perspectives[(rowNumber || 0) % perspectives.length];
  
  // 기본 프롬프트 템플릿 사용
  let prompt = HAENGBAL_PROMPT.replace('{behavior_description}', behaviorDescription);
  
  // 글자 수 지침이 있으면 프롬프트 수정
  if (lengthInstruction) {
    // 기존 글자 수 제한 내용을 새로운 지침으로 대체하거나 추가
    prompt += '\n\n**중요: 글자 수 제한 변경**\n' + lengthInstruction;
    // 기존 300자 제한 무시하도록 강력한 지시 추가
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
        content: '당신은 대한민국 담임 교사로서 학생의 전반적인 행동특성 및 종합의견을 작성하는 전문가입니다. 특정 활동이 아닌 학생의 일상적인 성격, 학습 태도, 행동 특성을 종합적으로 서술해야 합니다. 명사형 종결어미(~함, ~임, ~음)를 사용하고, 주어는 절대 사용하지 마세요.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.9,  // 다양성을 위해 높은 값 사용
    max_tokens: 600
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
    
    // 후처리: 글자 수 표기 제거 (예: (350자), [350자], 350자 등)
    content = content.replace(/\s*[\(\[]?\d+자[\)\]]?$/g, '');
    
    // 후처리: 특수문자 및 마크다운 제거
    content = content.replace(/[\*#\[\]]/g, ''); // 마크다운 및 대괄호 제거
    content = content.replace(/^\s*[-•]\s*/gm, ''); // 글머리 기호 제거
    
    // 후처리: 줄바꿈 제거 (하나의 문단으로 병합)
    content = content.replace(/\n+/g, ' ');
    
    // 후처리: 마침표 보장 및 공백 강제
    if (!content.endsWith('.')) {
      content += '.';
    }
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

// 3. 선택한 행의 행발 작성
function generateHaengbalForSelectedRows() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  const startRow = range.getRow();
  const numRows = range.getNumRows();
  
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '행발 작성을 시작합니다',
    `선택한 ${numRows}명의 행발을 작성합니다.\n(전반적인 성격, 학습 태도, 행동 특성 종합)\n\n계속하시겠습니까?`,
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) {
    return;
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    const behaviorCell = sheet.getRange(row, 9); // I열 (기존 H열에서 이동)
    const haengbalCell = sheet.getRange(row, 10); // J열 (기존 I열에서 이동)
    
    const behaviorValue = behaviorCell.getValue();
    
    if (!behaviorValue || behaviorValue.toString().trim() === '') {
      continue;
    }
    
    try {
      haengbalCell.setValue('작성 중...');
      SpreadsheetApp.flush();
      
      const haengbalContent = callOpenAIHaengbal(behaviorValue.toString(), row);
      haengbalCell.setValue(haengbalContent);
      
      // 서식 자동 적용 (행 높이 및 정렬)
      applyAutoFormattingHaengbal(sheet, row);
      
      successCount++;
      Utilities.sleep(1000); // API 호출 간격 (Rate Limit 방지)
      
    } catch (error) {
      haengbalCell.setValue('오류: ' + error.message);
      errorCount++;
    }
  }
  
  ui.alert(`✅ 작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

// 4. I열에 데이터가 있고 J열이 비어있는 모든 행 처리
function generateHaengbalForAllEmpty() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('처리할 데이터가 없습니다.');
    return;
  }
  
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '행발 작성을 시작합니다',
    'I열의 관찰 키워드를 바탕으로 행발을 작성합니다.\n(전반적인 성격, 학습 태도, 행동 특성 종합)\n\n계속하시겠습니까?',
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) {
    return;
  }
  
  const behaviorRange = sheet.getRange(2, 9, lastRow - 1, 1); // I2부터
  const haengbalRange = sheet.getRange(2, 10, lastRow - 1, 1); // J2부터
  
  const behaviorValues = behaviorRange.getValues();
  const haengbalValues = haengbalRange.getValues();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < behaviorValues.length; i++) {
    const row = i + 2;
    const behaviorValue = behaviorValues[i][0];
    const haengbalValue = haengbalValues[i][0];
    
    // I열에 데이터가 있고 J열이 비어있는 경우만 처리
    if (behaviorValue && behaviorValue.toString().trim() !== '' && 
        (!haengbalValue || haengbalValue.toString().trim() === '')) {
      
      const haengbalCell = sheet.getRange(row, 10);
      
      try {
        haengbalCell.setValue('작성 중...');
        SpreadsheetApp.flush();
        
        const haengbalContent = callOpenAIHaengbal(behaviorValue.toString(), row);
        haengbalCell.setValue(haengbalContent);
        
        // 서식 자동 적용 (행 높이 및 정렬)
        applyAutoFormattingHaengbal(sheet, row);
        
        successCount++;
        Utilities.sleep(1000); // API 호출 간격
        
      } catch (error) {
        haengbalCell.setValue('오류: ' + error.message);
        errorCount++;
      }
    }
  }
  
  ui.alert(`✅ 작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

// 5. 사용자로부터 바이트 수 입력받기 (공통 함수가 없으므로 여기에도 추가)
function promptForByteLimitHaengbal() {
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

// 6. 서식 자동 적용 함수
function applyAutoFormattingHaengbal(sheet, row) {
  // J열 (행발) 자동 줄바꿈 및 세로 가운데 정렬
  const cell = sheet.getRange(row, 10);
  cell.setWrap(true)
    .setVerticalAlignment('middle');
  
  // 행 높이 자동 조절
  sheet.autoResizeRows(row, 1);
  
  // I열 가운데 정렬
  sheet.getRange(row, 9)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
}