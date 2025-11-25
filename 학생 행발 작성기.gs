// ====================================
// 학생 행동특성 및 종합의견(행발) 자동 작성 Apps Script
// ====================================

// 사용 방법:
// 1. 스크립트 속성에 GEMINI_API_KEY를 미리 설정하세요
// 2. K열에 행동 특성 키워드나 내용을 입력하세요
// 3. 메뉴에서 "행발 작성 시작하기"를 클릭하세요
// 4. L열에 자동으로 행발이 생성됩니다 (기본 1500Byte)

const HAENGBAL_PROMPT_TEMPLATE = `
당신은 대한민국 고등학교 교사로서 학생의 학교생활기록부 행동특성 및 종합의견(행발)을 작성하는 전문가입니다.

## 작성 목표
교사가 입력한 학생의 행동 특성을 바탕으로, 학생의 인성, 잠재력, 공동체 역량 등을 종합적으로 관찰하여 구체적이고 긍정적인 변화와 성장을 드러내는 행발을 작성하세요.

## 입력된 행동 특성
{behavior_description}

## 작성 가이드
1. **핵심 역량 강조**: 배려, 나눔, 협력, 타인 존중, 갈등 관리, 관계 지향성, 규칙 준수 등 인성 요소와 리더십, 자기주도성 등 잠재력을 중심으로 서술하세요.
2. **구체적 사례 중심**: 추상적인 칭찬보다는 구체적인 행동 사례나 에피소드를 통해 학생의 특성이 잘 드러나도록 하세요.
3. **성장과 변화**: 단순한 나열이 아니라, 일년 동안의 긍정적인 변화와 성장의 모습을 보여주세요.
4. **긍정적 재구성 (매우 중요)**: 부정적으로 보일 수 있는 특성도 반드시 긍정적이고 발전 가능성이 느껴지는 표현으로 전환하세요.
   - 내성적 → 신중함, 사려 깊음, 차분함, 성찰적임, 깊이 있는 사고
   - 소극적 → 신중하게 접근함, 관찰력이 뛰어남, 계획적임
   - 느림 → 꼼꼼함, 세심함, 정확성을 추구함
   - 고집이 셈 → 소신이 있음, 주관이 뚜렷함, 신념이 확고함
   - 산만함 → 다양한 관심사, 호기심이 많음, 활발한 탐구심
   - 말이 적음 → 경청을 잘함, 신중하게 발언함, 깊이 있는 대화를 선호함
5. **문체**: 명사형 종결어미(~함, ~임, ~음)를 사용하여 간결하고 명확하게 작성하세요.
6. **마침표 준수**: **모든 문장은 반드시 마침표(.)로 끝나야 합니다.**

## 글자 수 제한
- **{length_instruction}**

## 절대 금지사항
- **부정적 표현 금지**: "~하지만", "~에도 불구하고", "부족하다", "미흡하다" 등 부정적 뉘앙스의 표현을 절대 사용하지 마세요.
- **특정 성명, 기관명, 상호명 등은 기재 불가**
- **"학생은", "OO는", "위 학생은" 등 주어를 절대 사용하지 마세요.**
- **분석 내용, 검증 포인트, 글자 수 표기 등을 절대 출력하지 마세요.**
- **오직 행발 본문만 출력하세요.**
- **줄바꿈 없이 하나의 문단으로 작성하세요.**
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

function callOpenAIHaengbal(behaviorDescription, rowNumber, lengthInstruction) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다.\nGoogle AI Studio (aistudio.google.com)에서 API 키를 발급받아\n스크립트 속성에서 GEMINI_API_KEY를 설정해주세요.');
  }

  const shuffledBehavior = shuffleKeywords(behaviorDescription);
  
  const targetBytes = 1500; 
  const targetChars = Math.round(targetBytes / 3);
  const finalLengthInstruction = lengthInstruction || `분량: 공백 포함 약 ${targetChars}자 (${targetBytes}바이트) 내외로 작성하세요.`;

  const fullPrompt = HAENGBAL_PROMPT_TEMPLATE
    .replace('{behavior_description}', shuffledBehavior)
    .replace('{length_instruction}', finalLengthInstruction);

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
    
    if (!responseData.candidates || !responseData.candidates[0] || 
        !responseData.candidates[0].content || !responseData.candidates[0].content.parts ||
        !responseData.candidates[0].content.parts[0] || !responseData.candidates[0].content.parts[0].text) {
      throw new Error('Gemini API 응답 형식 오류\n응답: ' + responseText.substring(0, 200));
    }
    
    let content = responseData.candidates[0].content.parts[0].text.trim();
    
    // 후처리
    content = content.replace(/\s*[\(\[]?\d+자[\)\]]?$/g, '');
    content = content.replace(/^[\(\[]?\d+자[\)\]]?\s*[-–—]*\s*(검증|강조|분석|포인트).*$/gm, '');
    content = content.replace(/^(검증|강조|분석|포인트).*$/gm, '');
    
    // 특수문자 제거
    content = content.replace(/[''""]/g, '');
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

function generateHaengbalForSelectedRows() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  const startRow = range.getRow();
  const numRows = range.getNumRows();
  
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '행발 작성을 시작합니다',
    `선택한 ${numRows}명의 행발을 작성합니다.\n(K열 키워드 기반)\n계속하시겠습니까?`,
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) {
    return;
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    const behaviorCell = sheet.getRange(row, 11);  // K열
    const resultCell = sheet.getRange(row, 12);    // L열
    
    const behaviorValue = behaviorCell.getValue();
    
    if (!behaviorValue || behaviorValue.toString().trim() === '') {
      continue;
    }
    
    try {
      resultCell.setValue('작성 중...');
      SpreadsheetApp.flush();
      
      const content = callOpenAIHaengbal(behaviorValue.toString(), row);
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
    'K열에 행동 특성이 있는 모든 학생의 행발을 작성합니다.\n계속하시겠습니까?',
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) {
    return;
  }
  
  const behaviorRange = sheet.getRange(2, 11, lastRow - 1, 1);  // K2부터
  const resultRange = sheet.getRange(2, 12, lastRow - 1, 1);    // L2부터
  
  const behaviorValues = behaviorRange.getValues();
  const resultValues = resultRange.getValues();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < behaviorValues.length; i++) {
    const row = i + 2;
    const behaviorValue = behaviorValues[i][0];
    const resultValue = resultValues[i][0];
    
    if (behaviorValue && behaviorValue.toString().trim() !== '' && 
        (!resultValue || resultValue.toString().trim() === '')) {
      
      const resultCell = sheet.getRange(row, 12);
      
      try {
        resultCell.setValue('작성 중...');
        SpreadsheetApp.flush();
        
        const content = callOpenAIHaengbal(behaviorValue.toString(), row);
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
  }
  
  ui.alert(`작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

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

function generateHaengbalCustomLengthForAll() {
  const bytes = promptForByteLimitHaengbal();
  if (!bytes) return;
  
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('처리할 데이터가 없습니다.');
    return;
  }
  
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '행발 작성을 시작합니다',
    `K열에 행동 특성이 있는 모든 학생의 행발을 작성합니다.\n(글자수: 약 ${Math.round(bytes/3)}자)\n계속하시겠습니까?`,
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) return;
  
  const lengthInstruction = `분량: 공백 포함 약 ${Math.round(bytes/3)}자 (${bytes}바이트) 내외로 작성하세요.`;
  
  const behaviorRange = sheet.getRange(2, 11, lastRow - 1, 1);
  const resultRange = sheet.getRange(2, 12, lastRow - 1, 1);
  
  const behaviorValues = behaviorRange.getValues();
  const resultValues = resultRange.getValues();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < behaviorValues.length; i++) {
    const row = i + 2;
    const behaviorValue = behaviorValues[i][0];
    const resultValue = resultValues[i][0];
    
    if (behaviorValue && behaviorValue.toString().trim() !== '' && 
        (!resultValue || resultValue.toString().trim() === '')) {
      
      const resultCell = sheet.getRange(row, 12);
      
      try {
        resultCell.setValue('작성 중...');
        SpreadsheetApp.flush();
        
        const content = callOpenAIHaengbal(behaviorValue.toString(), row, lengthInstruction);
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
  }
  
  ui.alert(`작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

function generateHaengbalCustomLengthForSelected() {
  const bytes = promptForByteLimitHaengbal();
  if (!bytes) return;
  
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  const startRow = range.getRow();
  const numRows = range.getNumRows();
  
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '행발 작성을 시작합니다',
    `선택한 ${numRows}명의 행발을 작성합니다.\n(글자수: 약 ${Math.round(bytes/3)}자)\n계속하시겠습니까?`,
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) return;
  
  const lengthInstruction = `분량: 공백 포함 약 ${Math.round(bytes/3)}자 (${bytes}바이트) 내외로 작성하세요.`;
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    const behaviorCell = sheet.getRange(row, 11);
    const resultCell = sheet.getRange(row, 12);
    
    const behaviorValue = behaviorCell.getValue();
    
    if (!behaviorValue || behaviorValue.toString().trim() === '') {
      continue;
    }
    
    try {
      resultCell.setValue('작성 중...');
      SpreadsheetApp.flush();
      
      const content = callOpenAIHaengbal(behaviorValue.toString(), row, lengthInstruction);
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

function autoResizeRowsHaengbal() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('처리할 데이터가 없습니다.');
    return;
  }
  
  sheet.autoResizeRows(2, lastRow - 1);
  SpreadsheetApp.getUi().alert('셀 높이 자동 조절 완료!');
}