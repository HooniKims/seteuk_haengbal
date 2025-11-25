// ====================================
// 동아리 특기사항 자동 작성 Apps Script
// ====================================

// 사용 방법:
// 1. 스크립트 속성에 GEMINI_API_KEY를 미리 설정하세요
// 2. I열에 동아리 활동 내용을 입력하세요
// 3. 메뉴에서 "동아리 특기사항 작성"을 클릭하세요
// 4. J열에 자동으로 동아리 특기사항이 생성됩니다 (기본 1000Byte)

// 1. 프롬프트 템플릿
const DONGARI_PROMPT_TEMPLATE = `
당신은 대한민국 고등학교 교사로서 학생의 학교생활기록부 동아리 활동 특기사항을 작성하는 전문가입니다.

## 작성 목표
학생의 동아리 활동 내용을 바탕으로, 학생의 적극성, 성실성, 리더십, 협업 능력 등 개별적인 특성이 드러나도록 구체적이고 과정 중심으로 작성하세요.

## 입력된 동아리 활동 내용
{activity_description}

## 작성 가이드
1. **구체적인 활동 명시**: 참여 내용 등 구체적인 사실을 포함합니다.
2. **개인별 특성 강조**: 학생의 적극성, 성실성, 리더십, 협업 능력 등 개별적인 특성이 드러나도록 작성합니다.
3. **과정 중심 서술**: 결과만 나열하기보다 활동 과정에서 겪은 어려움, 노력, 태도 변화 등을 구체적으로 기술합니다.
4. **성과 및 성장 기록**: 활동을 통해 얻은 성과나 지식, 기술의 발전 정도, 진로와 연결된 점 등을 기록합니다.
5. **행동 변화를 통한 성장**: 활동을 통해 나타난 행동의 긍정적 변화와 성장에 초점을 맞춥니다.
6. **문체**: 명사형 종결어미(~함, ~보임, ~드러남)를 사용하여 간결하고 명확하게 작성하세요.
7. **마침표 준수**: **모든 문장은 반드시 마침표(.)로 끝나야 합니다.**

## 글자 수 제한
- **{length_instruction}**

## 절대 금지사항 (매우 중요)
- **소논문 기재 금지**: 소논문은 절대 기재할 수 없습니다.
- **특정 성명, 기관명, 상호명 등은 기재 불가**
- **동아리명 언급 금지**: "~동아리에서", "~동아리 활동으로" 등 동아리명을 절대 언급하지 마세요. 바로 활동 내용부터 시작하세요.
- **"학생은", "OO는", "위 학생은" 등 주어를 절대 사용하지 마세요.**
- **분석 내용, 검증 포인트, 글자 수 표기 등을 절대 출력하지 마세요.**
- **오직 동아리 특기사항 본문만 출력하세요.**
- **줄바꿈 없이 하나의 문단으로 작성하세요.**
- **입력된 활동 내용에 없는 구체적인 사건, 실험 결과, 특정 도서명 등을 절대 지어내지 마세요.**
`;

// 2. Gemini Native API 호출 함수
function callOpenAIDongari(activityDescription, rowNumber, lengthInstruction) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다.\nGoogle AI Studio (aistudio.google.com)에서 API 키를 발급받아\n스크립트 속성에서 GEMINI_API_KEY를 설정해주세요.');
  }

  // 활동 내용은 순서대로 유지 (단계별 활동이므로)
  const targetBytes = 1000; 
  const targetChars = Math.round(targetBytes / 3);
  const finalLengthInstruction = lengthInstruction || `분량: 공백 포함 약 ${targetChars}자 (${targetBytes}바이트) 내외로 작성하세요.`;

  // 다양성을 위한 관점 배열 (행 번호 기반으로 다른 관점 적용)
  const perspectives = [
    '특히 학생의 적극성과 참여도를 중심으로',
    '특히 협업 능력과 소통 능력을 중심으로',
    '특히 리더십과 책임감을 중심으로',
    '특히 창의성과 문제 해결 능력을 중심으로',
    '특히 성실성과 지속적인 노력을 중심으로',
    '특히 성장 과정과 태도 변화를 중심으로',
    '특히 진로 연계성과 전문성 발전을 중심으로',
    '특히 자기주도성과 탐구 능력을 중심으로'
  ];
  
  // 행 번호를 기반으로 다양한 관점 선택
  const perspective = perspectives[(rowNumber || 0) % perspectives.length];
  
  let fullPrompt = DONGARI_PROMPT_TEMPLATE
    .replace('{activity_description}', activityDescription)
    .replace('{length_instruction}', finalLengthInstruction);
  
  // 다양성을 위한 추가 지시
  fullPrompt += `\n\n**추가 지시: ${perspective} 서술하되, 매번 다른 표현과 구조를 사용하여 작성하세요. 활동의 순서는 입력된 그대로 유지하되, 서술 방식과 강조점을 다양하게 변화시키세요.**`;

  // Gemini Native API Endpoint
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
      temperature: 0.95,  // 다양성을 위해 높은 temperature 사용
      maxOutputTokens: 1000,
      topP: 0.95,
      topK: 40
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

// 3. 선택한 행의 동아리 특기사항 작성
function generateDongariForSelectedRows() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  const startRow = range.getRow();
  const numRows = range.getNumRows();
  
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '동아리 특기사항 작성을 시작합니다',
    `선택한 ${numRows}명의 동아리 특기사항을 작성합니다.\n계속하시겠습니까?`,
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) {
    return;
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    const activityCell = sheet.getRange(row, 9);  // I열 (동아리 활동)
    const dongariCell = sheet.getRange(row, 10);  // J열 (결과)
    
    const activityValue = activityCell.getValue();
    
    if (!activityValue || activityValue.toString().trim() === '') {
      continue;
    }
    
    try {
      dongariCell.setValue('작성 중...');
      SpreadsheetApp.flush();
      
      const dongariContent = callOpenAIDongari(activityValue.toString(), row);
      dongariCell.setValue(dongariContent);
      
      // 서식 자동 적용
      dongariCell.setWrap(true).setVerticalAlignment('middle').setHorizontalAlignment('center');
      activityCell.setHorizontalAlignment('center').setVerticalAlignment('middle');
      sheet.autoResizeRows(row, 1);
      
      successCount++;
      Utilities.sleep(1500);
      
    } catch (error) {
      dongariCell.setValue('오류: ' + error.message);
      errorCount++;
    }
  }
  
  ui.alert(`작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

// 4. 비어있는 모든 행 처리
function generateDongariForAllEmpty() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('처리할 데이터가 없습니다.');
    return;
  }
  
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '동아리 특기사항 작성을 시작합니다',
    'I열에 동아리 활동 내용이 있는 모든 학생의 특기사항을 작성합니다.\n계속하시겠습니까?',
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) {
    return;
  }
  
  const activityRange = sheet.getRange(2, 9, lastRow - 1, 1);  // I2부터
  const dongariRange = sheet.getRange(2, 10, lastRow - 1, 1);  // J2부터
  
  const activityValues = activityRange.getValues();
  const dongariValues = dongariRange.getValues();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < activityValues.length; i++) {
    const row = i + 2;
    const activityValue = activityValues[i][0];
    const dongariValue = dongariValues[i][0];
    
    if (activityValue && activityValue.toString().trim() !== '' && 
        (!dongariValue || dongariValue.toString().trim() === '')) {
      
      const dongariCell = sheet.getRange(row, 10);
      const activityCell = sheet.getRange(row, 9);
      
      try {
        dongariCell.setValue('작성 중...');
        SpreadsheetApp.flush();
        
        const dongariContent = callOpenAIDongari(activityValue.toString(), row);
        dongariCell.setValue(dongariContent);
        
        // 서식 자동 적용
        dongariCell.setWrap(true).setVerticalAlignment('middle').setHorizontalAlignment('center');
        activityCell.setHorizontalAlignment('center').setVerticalAlignment('middle');
        sheet.autoResizeRows(row, 1);
        
        successCount++;
        Utilities.sleep(1500);
        
      } catch (error) {
        dongariCell.setValue('오류: ' + error.message);
        errorCount++;
      }
    }
  }
  
  ui.alert(`작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

// 5. 글자수 지정 함수들
function promptForByteLimitDongari() {
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

function generateDongariCustomLengthForAll() {
  const bytes = promptForByteLimitDongari();
  if (!bytes) return;
  
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('처리할 데이터가 없습니다.');
    return;
  }
  
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '동아리 특기사항 작성을 시작합니다',
    `I열에 동아리 활동 내용이 있는 모든 학생의 특기사항을 작성합니다.\n(글자수: 약 ${Math.round(bytes/3)}자)\n계속하시겠습니까?`,
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) return;
  
  const lengthInstruction = `분량: 공백 포함 약 ${Math.round(bytes/3)}자 (${bytes}바이트) 내외로 작성하세요.`;
  
  const activityRange = sheet.getRange(2, 9, lastRow - 1, 1);
  const dongariRange = sheet.getRange(2, 10, lastRow - 1, 1);
  
  const activityValues = activityRange.getValues();
  const dongariValues = dongariRange.getValues();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < activityValues.length; i++) {
    const row = i + 2;
    const activityValue = activityValues[i][0];
    const dongariValue = dongariValues[i][0];
    
    if (activityValue && activityValue.toString().trim() !== '' && 
        (!dongariValue || dongariValue.toString().trim() === '')) {
      
      const dongariCell = sheet.getRange(row, 10);
      const activityCell = sheet.getRange(row, 9);
      
      try {
        dongariCell.setValue('작성 중...');
        SpreadsheetApp.flush();
        
        const dongariContent = callOpenAIDongari(activityValue.toString(), row, lengthInstruction);
        dongariCell.setValue(dongariContent);
        
        dongariCell.setWrap(true).setVerticalAlignment('middle').setHorizontalAlignment('center');
        activityCell.setHorizontalAlignment('center').setVerticalAlignment('middle');
        sheet.autoResizeRows(row, 1);
        
        successCount++;
        Utilities.sleep(1500);
        
      } catch (error) {
        dongariCell.setValue('오류: ' + error.message);
        errorCount++;
      }
    }
  }
  
  ui.alert(`작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

function generateDongariCustomLengthForSelected() {
  const bytes = promptForByteLimitDongari();
  if (!bytes) return;
  
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  const startRow = range.getRow();
  const numRows = range.getNumRows();
  
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '동아리 특기사항 작성을 시작합니다',
    `선택한 ${numRows}명의 동아리 특기사항을 작성합니다.\n(글자수: 약 ${Math.round(bytes/3)}자)\n계속하시겠습니까?`,
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) return;
  
  const lengthInstruction = `분량: 공백 포함 약 ${Math.round(bytes/3)}자 (${bytes}바이트) 내외로 작성하세요.`;
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    const activityCell = sheet.getRange(row, 9);
    const dongariCell = sheet.getRange(row, 10);
    
    const activityValue = activityCell.getValue();
    
    if (!activityValue || activityValue.toString().trim() === '') {
      continue;
    }
    
    try {
      dongariCell.setValue('작성 중...');
      SpreadsheetApp.flush();
      
      const dongariContent = callOpenAIDongari(activityValue.toString(), row, lengthInstruction);
      dongariCell.setValue(dongariContent);
      
      dongariCell.setWrap(true).setVerticalAlignment('middle').setHorizontalAlignment('center');
      activityCell.setHorizontalAlignment('center').setVerticalAlignment('middle');
      sheet.autoResizeRows(row, 1);
      
      successCount++;
      Utilities.sleep(1500);
      
    } catch (error) {
      dongariCell.setValue('오류: ' + error.message);
      errorCount++;
    }
  }
  
  ui.alert(`작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

function autoResizeRowsDongari() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('처리할 데이터가 없습니다.');
    return;
  }
  
  sheet.autoResizeRows(2, lastRow - 1);
  SpreadsheetApp.getUi().alert('셀 높이 자동 조절 완료!');
}
