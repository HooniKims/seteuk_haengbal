# Implementation Plan - Migrate to Solar Pro 2 API

OpenAI API를 Upstage Solar Pro 2 API로 교체하여 프로젝트의 AI 모델을 변경합니다.

## User Review Required
> [!IMPORTANT]
> **API Key Change**: 기존 `OPENAI_API_KEY` 대신 Upstage API Key를 사용해야 합니다. 스크립트 속성 이름을 `UPSTAGE_API_KEY`로 변경할 예정이므로, 사용자는 스크립트 속성에서 키를 새로 설정해야 합니다.
> **Model Behavior**: Solar Pro 2 모델의 응답 특성이 GPT-4o와 다를 수 있으므로, 프롬프트 튜닝이 필요할 수 있습니다. 일단 기존 프롬프트를 그대로 사용하고 결과를 확인합니다.

## Proposed Changes

### API Call Logic Update

#### [MODIFY] [학생 세특 작성기.gs](file:///c:/Users/Administrator/Desktop/vibecoding_projects/seteuk_haengbal/학생%20세특%20작성기.gs)
- `callOpenAI` 함수 수정
  - API URL 변경: `https://api.openai.com/v1/chat/completions` -> `https://api.upstage.ai/v1/chat/completions`
  - Model 변경: `gpt-4o` -> `solar-pro2`
  - API Key Property 변경: `OPENAI_API_KEY` -> `UPSTAGE_API_KEY`
  - Error Message 수정: "OpenAI API" -> "Solar API"

#### [MODIFY] [학생 행발 작성기.gs](file:///c:/Users/Administrator/Desktop/vibecoding_projects/seteuk_haengbal/학생%20행발%20작성기.gs)
- `callOpenAIHaengbal` 함수 수정
  - API URL 변경: `https://api.openai.com/v1/chat/completions` -> `https://api.upstage.ai/v1/chat/completions`
  - Model 변경: `gpt-4o` -> `solar-pro2`
  - API Key Property 변경: `OPENAI_API_KEY` -> `UPSTAGE_API_KEY`

#### [MODIFY] [학기말 가통문 작성기.gs](file:///c:/Users/Administrator/Desktop/vibecoding_projects/seteuk_haengbal/학기말%20가통문%20작성기.gs)
- `callOpenAICorrespondence` 함수 수정
  - API URL 변경: `https://api.openai.com/v1/chat/completions` -> `https://api.upstage.ai/v1/chat/completions`
  - Model 변경: `gpt-4o` -> `solar-pro2`
  - API Key Property 변경: `OPENAI_API_KEY` -> `UPSTAGE_API_KEY`

#### [MODIFY] [메뉴설정.gs](file:///c:/Users/Administrator/Desktop/vibecoding_projects/seteuk_haengbal/메뉴설정.gs)
- (Optional) API 키 설정 메뉴가 있다면 업데이트 필요. 현재 코드를 확인해보니 주석 처리된 `setApiKey` 함수 등이 있을 수 있음. 확인 후 수정.

## Verification Plan

### Manual Verification
1.  **API Key Setup**:
    - 사용자가 스크립트 속성에 `UPSTAGE_API_KEY`를 설정하도록 안내 (또는 테스트를 위해 직접 설정).
2.  **Functionality Test**:
    - **세특 작성**: "세특 작성 시작하기" 메뉴 실행 -> Solar Pro 2 모델이 정상적으로 응답하는지 확인.
    - **행발 작성**: "행발 작성 시작하기" 메뉴 실행 -> 정상 작동 확인.
    - **가통문 작성**: "가통문 작성" 메뉴 실행 -> 정상 작동 확인.
3.  **Output Quality Check**:
    - 생성된 텍스트가 기존 요구사항(글자 수, 어조 등)을 만족하는지 확인.
