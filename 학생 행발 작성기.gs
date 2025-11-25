// ====================================
// 학생 행동특성 및 종합의견(행발) 자동 작성 Apps Script
// ====================================

// 사용 방법:
// 1. 스크립트 속성에 UPSTAGE_API_KEY를 미리 설정하세요
// 2. I열에 행동 특성 키워드나 내용을 입력하세요 (예: 배려심이 깊고, 리더십이 있음)
// 3. 메뉴에서 "행발 작성 시작하기"를 클릭하세요
// 4. J열에 자동으로 행발이 생성됩니다 (기본 1500Byte)

// 1. 프롬프트 템플릿

// 행발 작성용 프롬프트
const HAENGBAL_PROMPT_TEMPLATE = `
당신은 대한민국 고등학교 교사로서 학생의 학교생활기록부 행동특성 및 종합의견(행발)을 작성하는 전문가입니다.

## 작성 목표
교사가 입력한 학생의 행동 특성({behavior_description})을 바탕으로, 학생의 인성, 잠재력, 공동체 역량 등을 종합적으로 관찰하여 구체적이고 긍정적인 변화와 성장을 드러내는 행발을 작성하세요.

## 입력된 행동 특성
{behavior_description}

## 작성 가이드
1. **핵심 역량 강조**: 배려, 나눔, 협력, 타인 존중, 갈등 관리, 관계 지향성, 규칙 준수 등 인성 요소와 리더십, 자기주도성 등 잠재력을 중심으로 서술하세요.
2. **구체적 사례 중심**: 추상적인 칭찬보다는 구체적인 행동 사례나 에피소드를 통해 학생의 특성이 잘 드러나도록 하세요.
3. **성장과 변화**: 단순한 나열이 아니라, 일년 동안의 긍정적인 변화와 성장의 모습을 보여주세요.
4. **문체**: 명사형 종결어미(~함, ~임, ~음)를 사용하여 간결하고 명확하게 작성하세요.
5. **마침표 및 띄어쓰기 (매우 중요)**:
   - **모든 문장은 반드시 마침표(.)로 끝나야 합니다.**
   - **마침표 뒤에는 반드시 한 칸을 띄우세요.** (예: "...함. 또한..." O / "...함.또한..." X)

## 글자 수 제한
- **{length_instruction}**

## 절대 금지사항 (매우 중요)
- **특정 성명, 기관명, 상호명 등은 기재 불가**
- **"학생은", "OO는", "위 학생은" 등 주어를 절대 사용하지 마세요.** 주어 없이 자연스러운 문장으로 작성하세요.
- **분석 내용, 검증 포인트, 글자 수 표기 등을 절대 출력하지 마세요.**
- **오직 행발 본문만 출력하세요.**
- **줄바꿈 없이 하나의 문단으로 작성하세요.**
`;

// 키워드 섞기 함수 (다양성 확보)
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

// 2. Solar Pro 2 API 호출 함수 (Upstage)
function callOpenAIHaengbal(behaviorDescription, rowNumber, lengthInstruction) {
  // Upstage API Key 사용
  const apiKey = PropertiesService.getScriptProperties().getProperty('UPSTAGE_API_KEY');
  
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다.\n스크립트 속성에서 UPSTAGE_API_KEY를 설정해주세요.');
  }

  // 키워드 섞기 (다양성 확보)
  const shuffledBehavior = shuffleKeywords(behaviorDescription);
  
  // 기본 1500Byte (약 500자) 또는 사용자 지정
  // 사용자 지정이 없으면 기본값 1500Byte
  const targetBytes = 1500; 
  const targetChars = Math.round(targetBytes / 3);
  
  // lengthInstruction이 있으면 그것을 사용, 없으면 기본값 사용
  const finalLengthInstruction = lengthInstruction || `분량: 공백 포함 약 ${targetChars}자 (${targetBytes}바이트) 내외로 작성하세요.`;

  let prompt = HAENGBAL_PROMPT_TEMPLATE
    .replace('{behavior_description}', shuffledBehavior)
    .replace('{length_instruction}', finalLengthInstruction);

  // 다양성을 위한 추가 지시 (행 번호 기반)
  const perspectives = [
    '특히 공동체 역량과 배려심을 중심으로',
    '특히 리더십과 책임감을 중심으로',
    '특히 성실함과 자기주도성을 중심으로',
    '특히 교우 관계와 소통 능력을 중심으로',
    '특히 예의 바른 태도와 규칙 준수를 중심으로'
  ];
  const perspective = perspectives[(rowNumber || 0) % perspectives.length];
  prompt += `\n\n**추가 지시: ${perspective} 서술하되, 매번 다른 표현과 구조를 사용하세요.**`;

  // Upstage Solar API Endpoint
  const url = 'https://api.upstage.ai/v1/chat/completions';
  const payload = {
    model: 'solar-pro2',
    messages: [
      {
        role: 'system',
        content: '당신은 대한민국 고등학교 교사로서 학생의 학교생활기록부 행동특성 및 종합의견(행발)을 작성하는 전문가입니다. 명사형 종결어미(~함, ~임)를 사용하고, 주어는 절대 사용하지 마세요.'
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
    
    // 후처리: 글자 수 표기 제거
    content = content.replace(/\s*[\(\[]?\d+자[\)\]]?$/g, '');
    
    // 후처리: 검증 포인트 및 분석 내용 제거
    content = content.replace(/^[\(\[]?\d+자[\)\]]?\s*[-–—]*\s*(검증|강조|분석|포인트).*$/gm, '');
    content = content.replace(/^(검증|강조|분석|포인트).*$/gm, '');
    
    // 후처리: 특수문자 및 마크다운 제거
    content = content.replace(/[\*#\[\]]/g, ''); 
    content = content.replace(/^\s*[-•]\s*/gm, ''); 
    
    // 후처리: 줄바꿈 제거 (하나의 문단으로 병합)
    content = content.replace(/\n+/g, ' ');
    
    // 후처리: 마침표 보장 및 공백 강제
    if (!content.endsWith('.')) {
      content += '.';
    }
    // 1. 모든 마침표 뒤에 공백이 없으면 공백 추가 (마지막 마침표 제외)
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
    `선택한 ${numRows}명의 행발을 작성합니다.\n(I열 키워드 기반)\n계속하시겠습니까?`,
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) {
    return;
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    const behaviorCell = sheet.getRange(row, 9); // I열 (행동 특성)
    const resultCell = sheet.getRange(row, 10);  // J열 (결과)
    
    const behaviorValue = behaviorCell.getValue();
    
    if (!behaviorValue || behaviorValue.toString().trim() === '') {
      continue;
    }
    
    try {
      resultCell.setValue('작성 중...');
      SpreadsheetApp.flush();
      
      const content = callOpenAIHaengbal(behaviorValue.toString(), row);
      resultCell.setValue(content);
      
      // 서식 자동 적용
      resultCell.setWrap(true).setVerticalAlignment('middle');
      sheet.autoResizeRows(row, 1);
      behaviorCell.setHorizontalAlignment('center').setVerticalAlignment('middle');
      
      successCount++;
      Utilities.sleep(1000); // API 호출 간격
      
    } catch (error) {
      resultCell.setValue('오류: ' + error.message);
      errorCount++;
    }
  }
  
  ui.alert(`✅ 작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

// 6. I열에 데이터가 있고 J열이 비어있는 모든 행 처리
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
    'I열에 행동 특성이 있는 모든 학생의 행발을 작성합니다.\n계속하시겠습니까?',
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) {
    return;
  }
  
  const behaviorRange = sheet.getRange(2, 9, lastRow - 1, 1); // I2부터
  const resultRange = sheet.getRange(2, 10, lastRow - 1, 1);  // J2부터
  
  const behaviorValues = behaviorRange.getValues();
  const resultValues = resultRange.getValues();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < behaviorValues.length; i++) {
    const row = i + 2;
    const behaviorValue = behaviorValues[i][0];
    const resultValue = resultValues[i][0];
    
    // I열에 데이터가 있고 J열이 비어있는 경우만 처리
    if (behaviorValue && behaviorValue.toString().trim() !== '' && 
        (!resultValue || resultValue.toString().trim() === '')) {
      
      const resultCell = sheet.getRange(row, 10);
      
      try {
        resultCell.setValue('작성 중...');
        SpreadsheetApp.flush();
        
        const content = callOpenAIHaengbal(behaviorValue.toString(), row);
        resultCell.setValue(content);
        
        // 서식 자동 적용
        resultCell.setWrap(true).setVerticalAlignment('middle');
        sheet.autoResizeRows(row, 1);
        
        successCount++;
        Utilities.sleep(1000); // API 호출 간격
        
      } catch (error) {
        resultCell.setValue('오류: ' + error.message);
        errorCount++;
      }
    }
  }
  
  ui.alert(`✅ 작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

// 7. 사용자로부터 바이트 수 입력받기
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

// 사용자 지정 길이로 행발 작성 (선택한 행)
function generateHaengbalCustomSelected() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  
  if (!range || range.getRow() < 2) {
    SpreadsheetApp.getUi().alert('행을 선택해주세요. (헤더 제외)');
    return;
  }

  const bytes = promptForByteLimitHaengbal();
  if (!bytes) return;
  
  const lengthInstruction = `분량: 공백 포함 약 ${Math.round(bytes/3)}자 (${bytes}바이트) 내외로 작성하세요.`;
  
  const startRow = range.getRow();
  const numRows = range.getNumRows();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    const behaviorCell = sheet.getRange(row, 9); // I열
    const resultCell = sheet.getRange(row, 10);  // J열
    
    const behaviorValue = behaviorCell.getValue();
    
    if (!behaviorValue || behaviorValue.toString().trim() === '') continue;
    
    try {
      resultCell.setValue('작성 중...');
      SpreadsheetApp.flush();
      
      const content = callOpenAIHaengbal(behaviorValue.toString(), row, lengthInstruction);
      resultCell.setValue(content);
      
      resultCell.setWrap(true).setVerticalAlignment('middle');
      sheet.autoResizeRows(row, 1);
      
      successCount++;
      Utilities.sleep(1000);
      
    } catch (error) {
      resultCell.setValue('오류: ' + error.message);
      errorCount++;
    }
  }
  
  SpreadsheetApp.getUi().alert(`✅ 작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}