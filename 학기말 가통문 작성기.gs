// ====================================
// 학기말 가정통신문 자동 작성 Apps Script
// ====================================

// 사용 방법:
// 1. M열에 키워드를 입력하세요 (예: 학업, 건강, 친구 관계)
// 2. 메뉴에서 "가통문 작성" > "여름방학" 또는 "겨울방학"을 선택하세요
// 3. N열에 자동으로 가정통신문이 생성됩니다 (기본 1000Byte)

const SUMMER_PROMPT_TEMPLATE = `
당신은 학생의 학교생활을 관찰하고 평가하는 교사입니다. 학기말 통지표에 들어갈 '가정통신문(종합의견)'을 작성해주세요.

## 작성 목표
편지 형식이 아닌, 학생의 한 학기 동안의 성장과 노력을 객관적이면서도 따뜻하게 기술하고, 여름방학 동안 가정에서 지도해야 할 점을 당부하는 내용을 작성하세요.

## 입력된 키워드
{keywords}

## 작성 가이드
1. **학생의 성장과 노력**: 입력된 키워드를 바탕으로 학생이 학교에서 보여준 긍정적인 모습과 노력을 구체적으로 서술하세요.
2. **가정 연계 지도 당부**: 방학 동안 가정에서 학생을 위해 신경 써주어야 할 부분이나 지도가 필요한 부분을 조언하세요.
3. **마침표 준수**: **모든 문장은 반드시 마침표(.)로 끝나야 합니다.**

## 글자 수 제한
- **분량: {length_instruction}**

## 절대 금지사항
- **특정 과목명(국어, 수학 등) 및 점수/등수 언급 금지.**
- **주어 생략: "OO가", "자녀분이", "학생이" 등 주어를 절대 사용하지 마세요.**
- **줄바꿈 없이 하나의 문단으로 작성하세요.**
- **오직 본문 내용만 출력하세요.**
`;

const WINTER_PROMPT_TEMPLATE = `
당신은 학생의 학교생활을 관찰하고 평가하는 교사입니다. 학기말 통지표에 들어갈 '가정통신문(종합의견)'을 작성해주세요.

## 작성 목표
편지 형식이 아닌, 학생의 일년 동안의 성장과 노력을 객관적이면서도 따뜻하게 기술하고, 겨울방학 및 새 학기 준비를 위해 가정에서 지도해야 할 점을 당부하는 내용을 작성하세요.

## 입력된 키워드
{keywords}

## 작성 가이드
1. **학생의 성장과 노력**: 입력된 키워드를 바탕으로 학생이 일년 동안 보여준 성취와 긍정적인 변화를 구체적으로 서술하세요.
2. **가정 연계 지도 당부**: 겨울방학 동안의 생활 습관 관리와 새 학기 준비를 위해 가정에서 신경 써주어야 할 부분을 조언하세요.
3. **마침표 준수**: **모든 문장은 반드시 마침표(.)로 끝나야 합니다.**

## 글자 수 제한
- **분량: {length_instruction}**

## 절대 금지사항
- **특정 과목명(국어, 수학 등) 및 점수/등수 언급 금지.**
- **주어 생략: "OO가", "자녀분이", "학생이" 등 주어를 절대 사용하지 마세요.**
- **줄바꿈 없이 하나의 문단으로 작성하세요.**
- **오직 본문 내용만 출력하세요.**
`;

function shuffleKeywords(keywordString) {
  if (!keywordString) return '';
  
  let parts = keywordString.split(',').map(s => s.trim()).filter(s => s !== '');
  
  for (let i = parts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }
  
  return parts.join(', ');
}

function callOpenAICorrespondence(keywords, type, rowNumber, customLengthBytes) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다.\nGoogle AI Studio (aistudio.google.com)에서 API 키를 발급받아\n스크립트 속성에서 GEMINI_API_KEY를 설정해주세요.');
  }

  const shuffledKeywords = shuffleKeywords(keywords);
  
  const targetBytes = customLengthBytes || 1000;
  const targetChars = Math.round(targetBytes / 3);
  const lengthInstruction = `공백 포함 약 ${targetChars}자 (${targetBytes}바이트) 내외로 작성하세요.`;

  let promptTemplate = type === 'SUMMER' ? SUMMER_PROMPT_TEMPLATE : WINTER_PROMPT_TEMPLATE;
  
  const fullPrompt = promptTemplate
    .replace('{keywords}', shuffledKeywords)
    .replace('{length_instruction}', lengthInstruction);

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
      temperature: 1.0,
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
    
    if (!responseData.candidates || !responseData.candidates[0] || 
        !responseData.candidates[0].content || !responseData.candidates[0].content.parts ||
        !responseData.candidates[0].content.parts[0] || !responseData.candidates[0].content.parts[0].text) {
      throw new Error('Gemini API 응답 형식 오류\n응답: ' + responseText.substring(0, 200));
    }
    
    let content = responseData.candidates[0].content.parts[0].text.trim();
    
    // 후처리
    content = content.replace(/(키워드 순서 변경|다양한 문장 표현|작성 전략).*$/gm, '');
    content = content.replace(/(입력\s*)?키워드\s*[:→].*$/gm, '');
    content = content.replace(/OO[가-힣]*\s*/g, '');
    content = content.replace(/자녀분[이은을를]?\s*/g, '');
    content = content.replace(/\n?.*(드림|올림)\s*$/g, '');
    content = content.replace(/\n?\d{4}[.년]\s*\d{1,2}[.월]\s*\d{1,2}[.일]?\s*$/g, '');
    content = content.replace(/20\d{2}년/g, '새해');
    content = content.replace(/\s*[\(\[]?\d+자[\)\]]?$/g, '');
    
    // 특수문자 제거
    content = content.replace(/[''""]/g, '');
    content = content.replace(/[\*#\[\]\(\)]/g, '');
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

function generateCorrespondenceSummer() {
  generateCorrespondence('SUMMER', null, false);
}

function generateCorrespondenceWinter() {
  generateCorrespondence('WINTER', null, false);
}

function generateCorrespondenceSummerSelected() {
  generateCorrespondence('SUMMER', null, true);
}

function generateCorrespondenceWinterSelected() {
  generateCorrespondence('WINTER', null, true);
}

function promptForByteLimitCorrespondence() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    '글자 수 지정 (Byte)',
    '작성할 내용의 목표 바이트(Byte) 수를 입력하세요.\n(예: 1000Byte ≈ 330자, 3Byte = 한글 1자)',
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

function generateCorrespondenceSummerCustom() {
  const bytes = promptForByteLimitCorrespondence();
  if (bytes) generateCorrespondence('SUMMER', bytes, false);
}

function generateCorrespondenceWinterCustom() {
  const bytes = promptForByteLimitCorrespondence();
  if (bytes) generateCorrespondence('WINTER', bytes, false);
}

function generateCorrespondenceSummerCustomSelected() {
  const bytes = promptForByteLimitCorrespondence();
  if (bytes) generateCorrespondence('SUMMER', bytes, true);
}

function generateCorrespondenceWinterCustomSelected() {
  const bytes = promptForByteLimitCorrespondence();
  if (bytes) generateCorrespondence('WINTER', bytes, true);
}

function generateCorrespondence(type, customLengthBytes, forceSelectionMode) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const ui = SpreadsheetApp.getUi();
  
  let startRow, numRows;

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
      `선택한 ${numRows}명의 ${typeName} 가통문을 작성합니다.\n계속하시겠습니까?`,
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
  } else {
    startRow = 2;
    numRows = sheet.getLastRow() - 1;
    
    if (numRows < 1) {
      ui.alert('처리할 데이터가 없습니다.');
      return;
    }
    
    const response = ui.alert(
      '가통문 작성을 시작합니다',
      `M열의 키워드를 바탕으로 ${type === 'SUMMER' ? '여름' : '겨울'}방학 가통문을 작성합니다.\n계속하시겠습니까?`,
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    const keywordCell = sheet.getRange(row, 13);  // M열
    const resultCell = sheet.getRange(row, 14);   // N열
    
    const keywords = keywordCell.getValue();
    
    if (!keywords || keywords.toString().trim() === '') {
      continue;
    }
    
    try {
      resultCell.setValue('작성 중...');
      SpreadsheetApp.flush();
      
      const content = callOpenAICorrespondence(keywords.toString(), type, row, customLengthBytes);
      resultCell.setValue(content);
      
      resultCell.setWrap(true).setVerticalAlignment('middle');
      sheet.autoResizeRows(row, 1);
      
      successCount++;
      Utilities.sleep(1500);
      
    } catch (error) {
      resultCell.setValue('오류: ' + error.message);
      errorCount++;
    }
  }
  
  ui.alert(`작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}
