// ====================================
// 학기말 가정통신문 자동 작성 Apps Script
// ====================================

// 사용 방법:
// 1. K열에 키워드를 입력하세요 (예: 학업, 건강, 친구 관계)
// 2. 메뉴에서 "가통문 작성" > "여름방학" 또는 "겨울방학"을 선택하세요
// 3. L열에 자동으로 가정통신문이 생성됩니다 (기본 1000Byte)

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
2. **본문 (키워드 주제 활용)**: 
   - 입력된 키워드({keywords})를 **주제(Theme)로 삼아** 내용을 작성하세요.
   - **절대 키워드 단어를 그대로 문장에 넣지 마세요.** (예: "[건강]을 챙기세요" -> "방학 동안 규칙적인 생활로 몸과 마음을 튼튼히 하길 바랍니다")
   - 키워드가 의미하는 바를 풀어서 따뜻한 문장으로 녹여내세요.
   - 학생의 구체적인 성장과 노력을 칭찬하는 내용을 포함하세요.
3. **당부의 말**: 방학 동안 가정에서의 지도와 격려 부탁
4. **맺음말**: 가정의 평안과 행복 기원

## 중요: 다양성 확보
- **키워드 순서를 매번 다르게 배치하세요.**
- **문장 구조와 표현을 매번 다르게 하세요.** (비슷한 내용이라도 표현을 다채롭게)
- 학생마다 내용이 똑같지 않도록 창의적으로 작성하세요.

## 글자 수 제한 (매우 중요)
- **분량: 공백 포함 약 330~350자 (1000바이트) 내외로 작성하세요.**
- **너무 길게 작성하지 마세요. 핵심 내용만 담아 간결하게 작성하세요.**

## 어조
- 정중하고 따뜻하며, 신뢰감을 주는 교사의 어조

## 절대 금지사항 (매우 중요)
- **주어 생략: "OO가", "자녀분이", "학생이" 등 주어를 절대 사용하지 마세요.** 주어 없이 자연스러운 문장으로 작성하세요. (예: "성실하게 생활하며..." O / "OO가 성실하게 생활하며..." X)
- **줄바꿈 없이 하나의 문단으로 작성하세요.** (중간에 줄바꿈 절대 금지)
- **마크다운 서식(볼드, 헤더 등)을 절대 사용하지 마세요. 순수 텍스트로만 작성하세요.**
- **대괄호[], 괄호() 등 특수 기호를 절대 사용하지 마세요.**
- **마지막에 글자 수를 표기하지 마세요.**
- **마지막에 "담임교사 드림", "[교사 이름] 드림", "담임 드림" 등의 서명 문구를 절대 포함하지 마세요**
- **"~구요", "~네요", "~죠" 등 구어체나 가벼운 어미를 절대 사용하지 마세요. 반드시 "~합니다", "~바랍니다" 등 격식 있는 어미를 사용하세요.**
- **"2024년", "2025년" 등 특정 연도를 절대 언급하지 마세요.** (그냥 "올해", "새해" 등으로 표현)
- **작성 전략, 키워드 순서 변경, 다양한 문장 표현 등에 대한 설명을 절대 출력하지 마세요.**
- **입력된 키워드 목록을 절대 다시 출력하지 마세요.** (예: "입력 키워드: ..." 금지)
- **오직 학부모님께 보내는 편지 본문만 출력하세요.**
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
2. **본문 (키워드 주제 활용)**: 
   - 입력된 키워드({keywords})를 **주제(Theme)로 삼아** 내용을 작성하세요.
   - **절대 키워드 단어를 그대로 문장에 넣지 마세요.** (예: "[건강]을 챙기세요" -> "방학 동안 규칙적인 생활로 몸과 마음을 튼튼히 하길 바랍니다")
   - 키워드가 의미하는 바를 풀어서 따뜻한 문장으로 녹여내세요.
   - 일년 동안의 성취와 성장을 구체적으로 칭찬하세요.
3. **당부의 말**: 겨울방학 동안의 건강 관리와 새 학기 준비 격려
4. **맺음말**: 새해 덕담과 가정의 평안 기원

## 중요: 다양성 확보
- **키워드 순서를 매번 다르게 배치하세요.**
- **문장 구조와 표현을 매번 다르게 하세요.** (비슷한 내용이라도 표현을 다채롭게)
- 학생마다 내용이 똑같지 않도록 창의적으로 작성하세요.

## 글자 수 제한 (매우 중요)
- **분량: 공백 포함 약 330~350자 (1000바이트) 내외로 작성하세요.**
- **너무 길게 작성하지 마세요. 핵심 내용만 담아 간결하게 작성하세요.**

## 어조
- 정중하고 따뜻하며, 신뢰감을 주는 교사의 어조

## 절대 금지사항 (매우 중요)
- **주어 생략: "OO가", "자녀분이", "학생이" 등 주어를 절대 사용하지 마세요.** 주어 없이 자연스러운 문장으로 작성하세요. (예: "성실하게 생활하며..." O / "OO가 성실하게 생활하며..." X)
- **줄바꿈 없이 하나의 문단으로 작성하세요.** (중간에 줄바꿈 절대 금지)
- **마크다운 서식(볼드, 헤더 등)을 절대 사용하지 마세요. 순수 텍스트로만 작성하세요.**
- **대괄호[], 괄호() 등 특수 기호를 절대 사용하지 마세요.**
- **마지막에 글자 수를 표기하지 마세요.**
- **마지막에 "담임교사 드림", "[교사 이름] 드림", "담임 드림" 등의 서명 문구를 절대 포함하지 마세요**
- **"~구요", "~네요", "~죠" 등 구어체나 가벼운 어미를 절대 사용하지 마세요. 반드시 "~합니다", "~바랍니다" 등 격식 있는 어미를 사용하세요.**
- **"2024년", "2025년" 등 특정 연도를 절대 언급하지 마세요.** (그냥 "올해", "새해" 등으로 표현)
- **작성 전략, 키워드 순서 변경, 다양한 문장 표현 등에 대한 설명을 절대 출력하지 마세요.**
- **입력된 키워드 목록을 절대 다시 출력하지 마세요.** (예: "입력 키워드: ..." 금지)
- **오직 학부모님께 보내는 편지 본문만 출력하세요.**
`;

// 2. Solar Pro 2 API 호출 함수 (Upstage)
function callOpenAICorrespondence(keywords, type, rowNumber, customLengthBytes) {
  // Upstage API Key 사용
  const apiKey = PropertiesService.getScriptProperties().getProperty('UPSTAGE_API_KEY');
  
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다.\n스크립트 속성에서 UPSTAGE_API_KEY를 설정해주세요.');
  }

  // 키워드 섞기 (다양성 확보)
  const shuffledKeywords = shuffleKeywords(keywords);
  
  // 기본 1000Byte (약 330자) 또는 사용자 지정
  // 사용자 지정이 없으면 기본값 1000Byte (약 330자)
  const targetBytes = customLengthBytes || 1000;
  const targetChars = Math.round(targetBytes / 3);
  const lengthInstruction = `분량: 공백 포함 약 ${targetChars}자 (${targetBytes}바이트) 내외로 작성하세요.`;

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

  // Upstage Solar API Endpoint
  const url = 'https://api.upstage.ai/v1/chat/completions';
  const payload = {
    model: 'solar-pro2',
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
        throw new Error('Solar API 오류: ' + responseData.error.message);
      } else {
        throw new Error('Solar API 오류: 응답 코드 ' + responseCode);
      }
    }
    
    let content = responseData.choices[0].message.content.trim();
    
    // 후처리: 내부 로직 설명 제거 (강력한 정규식)
    // 예: "키워드 순서 변경:", "다양한 문장 표현:", "작성 전략:" 등
    content = content.replace(/(키워드 순서 변경|다양한 문장 표현|작성 전략|참고 사항|추가 지시 사항|개별 학생 사례).*$/gm, '');
    content = content.replace(/^(키워드 순서 변경|다양한 문장 표현|작성 전략|참고 사항|추가 지시 사항|개별 학생 사례).*/gm, '');
    
    // 후처리: 입력 키워드 목록 제거 (예: "입력 키워드: ...")
    content = content.replace(/(입력\s*)?키워드\s*[:\u2192].*$/gm, '');
    
    // 후처리: OO 및 주어 제거 (OO가, OO는, 자녀분이 등)
    content = content.replace(/OO[가-힣]*\s*/g, '');
    content = content.replace(/자녀분[이은을를]?\s*/g, '');
    
    // 후처리: 서명 제거 (예: 담임교사 드림, 홍길동 드림, 담임 올림 등)
    content = content.replace(/\n?.*(드림|올림|배상)\s*$/g, '');
    
    // 후처리: 날짜 및 연도 제거 (예: 2024년, 2025년, 2024. 12. 31. 등)
    content = content.replace(/\n?\d{4}[.년]\s*\d{1,2}[.월]\s*\d{1,2}[.일]?\s*$/g, '');
    content = content.replace(/20\d{2}년/g, '새해'); // 연도 언급 시 '새해'로 치환
    
    // 후처리: 글자 수 표기 제거
    content = content.replace(/\s*[\(\[]?\d+자[\)\]]?$/g, '');
    
    // 후처리: 특수문자 및 마크다운 제거 (대괄호, 괄호, 별표 등)
    content = content.replace(/[\*#\[\]\(\)]/g, ''); 
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
      `선택한 ${numRows}명의 ${typeName} 가통문을 작성합니다.\n(K열 키워드 기반 가정통신문 생성)\n\n계속하시겠습니까?`,
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
      `K열의 키워드를 바탕으로 ${type === 'SUMMER' ? '여름' : '겨울'}방학 가통문을 작성합니다.\n(L열에 생성됨)\n\n계속하시겠습니까?`,
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
  }

  const typeName = type === 'SUMMER' ? '여름방학' : '겨울방학';
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    const keywordCell = sheet.getRange(row, 11); // K열 (키워드)
    const resultCell = sheet.getRange(row, 12); // L열 (결과)
    
    const keywords = keywordCell.getValue();
    
    if (!keywords || keywords.toString().trim() === '') {
      continue;
    }
    
    try {
      resultCell.setValue('작성 중...');
      SpreadsheetApp.flush();
      
      const content = callOpenAICorrespondence(keywords.toString(), type, row, customLengthBytes);
      resultCell.setValue(content);
      
      // 서식 자동 적용
      resultCell.setWrap(true).setVerticalAlignment('middle');
      sheet.autoResizeRows(row, 1);
      keywordCell.setHorizontalAlignment('center').setVerticalAlignment('middle');
      
      successCount++;
      Utilities.sleep(1000); // API 호출 간격
      
    } catch (error) {
      resultCell.setValue('오류: ' + error.message);
      errorCount++;
    }
  }
  
  ui.alert(`✅ 작성 완료!\n\n성공: ${successCount}명\n실패: ${errorCount}명`);
}

// 7. 사용자로부터 바이트 수 입력받기
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
