// ====================================
// 학기말 가정통신문 자동 작성 Apps Script
// ====================================

// 사용 방법:
// 1. I열에 키워드를 입력하세요 (예: 학업, 건강, 친구 관계)
// 2. 메뉴에서 "가통문 작성" > "여름방학" 또는 "겨울방학"을 선택하세요
// 3. J열에 자동으로 가정통신문이 생성됩니다 (기본 1000Byte)

// 1. 프롬프트 템플릿

// 여름방학용 프롬프트
const SUMMER_PROMPT_TEMPLATE = `
당신은 학생들을 진심으로 아끼는 담임 교사입니다. 학부모님께 보내는 여름방학 가정통신문을 작성해주세요.

## 작성 목표
입력된 키워드를 바탕으로 한 학기 동안의 학생의 성장과 노력을 칭찬하고, 여름방학 동안 가정에서 지도해주셨으면 하는 내용을 따뜻하고 정중한 어조로 작성하세요.

## 입력된 키워드
{keywords}

## 작성 가이드
1. **인사말**: 무더운 여름 건강 유의하시라는 인사로 시작
2. **본문 (키워드 활용)**: 
   - 입력된 키워드({keywords})를 자연스럽게 문장에 녹여내세요.
   - 키워드 순서는 매번 자연스럽게 섞어서 서술하세요.
   - 학생의 구체적인 성장과 노력을 칭찬하는 내용을 포함하세요.
3. **당부의 말**: 방학 동안 가정에서의 지도와 격려 부탁
4. **맺음말**: 가정의 평안과 행복 기원

## 중요: 다양성 확보
- **키워드 순서를 매번 다르게 배치하세요.**
- **문장 구조와 표현을 매번 다르게 하세요.** (비슷한 내용이라도 표현을 다채롭게)
- 학생마다 내용이 똑같지 않도록 창의적으로 작성하세요.

## 글자 수 제한
- **{length_instruction}**

## 어조
- 정중하고 따뜻하며, 신뢰감을 주는 교사의 어조

## 절대 금지사항
- **마지막에 "담임교사 드림", "[교사 이름] 드림", "담임 드림" 등의 서명 문구를 절대 포함하지 마세요**
- 가정의 평안과 행복을 기원하는 맺음말로 자연스럽게 마무리하세요
- 가통문 내용만 출력하고, 서명이나 추가 인사말은 포함하지 마세요
`;

// 겨울방학용 프롬프트
const WINTER_PROMPT_TEMPLATE = `
당신은 학생들을 진심으로 아끼는 담임 교사입니다. 학부모님께 보내는 겨울방학(학년말) 가정통신문을 작성해주세요.

## 작성 목표
입력된 키워드를 바탕으로 일년 동안의 학생의 성장과 노력을 격려하고, 겨울방학 및 새 학기 준비를 위한 당부 말씀을 따뜻하고 정중한 어조로 작성하세요.

## 입력된 키워드
{keywords}

## 작성 가이드
1. **인사말**: 한 해를 마무리하는 감사 인사와 새해 복 기원
2. **본문 (키워드 활용)**: 
   - 입력된 키워드({keywords})를 자연스럽게 문장에 녹여내세요.
   - 키워드 순서는 매번 자연스럽게 섞어서 서술하세요.
   - 일년 동안의 성취와 성장을 구체적으로 칭찬하세요.
3. **당부의 말**: 겨울방학 동안의 건강 관리와 새 학기 준비 격려
4. **맺음말**: 새해 덕담과 가정의 평안 기원

## 중요: 다양성 확보
- **키워드 순서를 매번 다르게 배치하세요.**
- **문장 구조와 표현을 매번 다르게 하세요.** (비슷한 내용이라도 표현을 다채롭게)
- 학생마다 내용이 똑같지 않도록 창의적으로 작성하세요.

## 글자 수 제한
- **{length_instruction}**

## 어조
- 정중하고 따뜻하며, 신뢰감을 주는 교사의 어조

## 절대 금지사항
- **마지막에 "담임교사 드림", "[교사 이름] 드림", "담임 드림" 등의 서명 문구를 절대 포함하지 마세요**
- 새해 덕담과 가정의 평안을 기원하는 맺음말로 자연스럽게 마무리하세요
- 가통문 내용만 출력하고, 서명이나 추가 인사말은 포함하지 마세요
`;

// 2. OpenAI API 호출 함수
function callOpenAICorrespondence(keywords, type, rowNumber, customLengthBytes) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다.\n관리자에게 문의하세요.');
  }

  // 키워드 섞기 (다양성 확보)
  const shuffledKeywords = shuffleKeywords(keywords);
  
  // 기본 1000Byte (약 330자) 또는 사용자 지정
  const targetBytes = customLengthBytes || 1000;
  const targetChars = Math.round(targetBytes / 3);
  const lengthInstruction = `분량: 약 ${targetBytes}바이트 (한글 기준 약 ${targetChars}자) 내외로 작성하세요.`;

  let promptTemplate = type === 'SUMMER' ? SUMMER_PROMPT_TEMPLATE : WINTER_PROMPT_TEMPLATE;
  
  let prompt = promptTemplate
    .replace('{keywords}', shuffledKeywords)
    .replace('{length_instruction}', lengthInstruction);

  // 다양성을 위한 추가 지시 (행 번호 기반)
  const styles = [
    '감성적이고 부드러운 어조로',
    '신뢰감 있고 차분한 어조로',
    '희망차고 격려하는 어조로',
    '구체적이고 진정성 있는 어조로'
  ];
  const style = styles[(rowNumber || 0) % styles.length];
  prompt += `\n\n**추가 지시: ${style} 작성하고, 다른 학생과 차별화된 표현을 사용하세요.**`;

  const url = 'https://api.openai.com/v1/chat/completions';
  const payload = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: '당신은 베테랑 교사입니다. 학부모님께 보내는 가정통신문을 작성합니다. 따뜻하고 정중한 문체를 사용하세요.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 1.0, // 다양성을 위해 높음
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

// 키워드 섞기 함수
function shuffleKeywords(keywordString) {
  if (!keywordString) return '';
  
  // 쉼표로 분리
  let parts = keywordString.split(',').map(s => s.trim()).filter(s => s !== '');
  
  // 피셔-예이츠 셔플
  for (let i = parts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }
  
  return parts.join(', ');
}

// 3. 메인 실행 함수들

// 여름방학 가통문 (전체)
function generateCorrespondenceSummer() {
  generateCorrespondence('SUMMER', null, false);
}

// 겨울방학 가통문 (전체)
function generateCorrespondenceWinter() {
  generateCorrespondence('WINTER', null, false);
}

// 여름방학 가통문 (선택한 행만)
function generateCorrespondenceSummerSelected() {
  generateCorrespondence('SUMMER', null, true);
}

// 겨울방학 가통문 (선택한 행만)
function generateCorrespondenceWinterSelected() {
  generateCorrespondence('WINTER', null, true);
}

// 여름방학 가통문 (사용자 지정 길이)
function generateCorrespondenceSummerCustom() {
  const bytes = promptForByteLimitCorrespondence();
  if (bytes) generateCorrespondence('SUMMER', bytes, false);
}

// 겨울방학 가통문 (사용자 지정 길이)
function generateCorrespondenceWinterCustom() {
  const bytes = promptForByteLimitCorrespondence();
  if (bytes) generateCorrespondence('WINTER', bytes, false);
}

// 여름방학 가통문 (선택 행 + 사용자 지정 길이)
function generateCorrespondenceSummerCustomSelected() {
  const bytes = promptForByteLimitCorrespondence();
  if (bytes) generateCorrespondence('SUMMER', bytes, true);
}

// 겨울방학 가통문 (선택 행 + 사용자 지정 길이)
function generateCorrespondenceWinterCustomSelected() {
  const bytes = promptForByteLimitCorrespondence();
  if (bytes) generateCorrespondence('WINTER', bytes, true);
}

// 공통 생성 로직
function generateCorrespondence(type, customLengthBytes, forceSelectionMode) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const ui = SpreadsheetApp.getUi();
  
  let startRow, numRows;
  let isSelectionMode = forceSelectionMode || false;

  // 선택 모드가 강제된 경우
  if (forceSelectionMode) {
    const range = sheet.getActiveRange();
    if (!range || range.getRow() < 2) {
      ui.alert('행을 선택해주세요. (헤더 제외)');
      return;
    }
    
    startRow = range.getRow();
    numRows = range.getNumRows();
    
    const typeName = type === 'SUMMER' ? '여름방학' : '겨울방학';
    const response = ui.alert(
      '가통문 작성을 시작합니다',
      `선택한 ${numRows}명의 ${typeName} 가통문을 작성합니다.\n(I열 키워드 기반 가정통신문 생성)\n\n계속하시겠습니까?`,
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
  }
  // 전체 모드
  else {
    startRow = 2;
    numRows = sheet.getLastRow() - 1;
    
    if (numRows < 1) {
      ui.alert('처리할 데이터가 없습니다.');
      return;
    }
    
    const response = ui.alert(
      '가통문 작성을 시작합니다',
      `I열의 키워드를 바탕으로 ${type === 'SUMMER' ? '여름' : '겨울'}방학 가통문을 작성합니다.\n(J열에 생성됨)\n\n계속하시겠습니까?`,
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
  }

  const typeName = type === 'SUMMER' ? '여름방학' : '겨울방학';
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    const keywordCell = sheet.getRange(row, 9); // I열 (키워드)
    const resultCell = sheet.getRange(row, 10); // J열 (결과)
    
    const keywords = keywordCell.getValue();
    
    // 키워드가 있고 결과가 비어있거나, 선택 모드일 때 처리
    if (keywords && keywords.toString().trim() !== '' && 
        (isSelectionMode || !resultCell.getValue() || resultCell.getValue().toString().trim() === '')) {
      
      try {
        resultCell.setValue('작성 중...');
        SpreadsheetApp.flush();
        
        const content = callOpenAICorrespondence(keywords.toString(), type, row, customLengthBytes);
        resultCell.setValue(content);
        
        // 서식 적용
        applyAutoFormattingCorrespondence(sheet, row);
        
        successCount++;
        Utilities.sleep(1000); // API 호출 간격
        
      } catch (error) {
        resultCell.setValue('오류: ' + error.message);
        errorCount++;
      }
    }
  }
  
  ui.alert(`✅ ${typeName} 가통문 작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

// 바이트 수 입력 프롬프트
function promptForByteLimitCorrespondence() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    '글자 수 지정 (Byte)',
    '작성할 내용의 목표 바이트(Byte) 수를 입력하세요.\n(기본값: 1000Byte ≈ 330자)',
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

// 서식 자동 적용
function applyAutoFormattingCorrespondence(sheet, row) {
  // J열 (가통문) 자동 줄바꿈 및 세로 가운데 정렬
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
