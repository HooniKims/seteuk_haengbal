# Implementation Plan - Semester-End Correspondence Generator

This plan outlines the implementation of a new feature to generate semester-end family correspondence based on keywords.

## Goal Description
The goal is to allow users to generate "Semester-End Family Correspondence" (학기말 가통문) by entering keywords in column I. The system will generate the correspondence in column J.
Key features:
- **Two Modes**: Summer (여름용) and Winter (겨울용).
- **Custom Length**: Default 1000 bytes, with an option to specify custom length.
- **Variety**: Ensure content variety even for similar keywords by shuffling keyword order and using diverse prompts.
- **Menu Integration**: Add new menu items to `메뉴설정.gs`.

## User Review Required
> [!IMPORTANT]
> Please review the proposed menu structure and the prompt style for the correspondence.

## Proposed Changes

### Google Apps Script

#### [NEW] [학기말 가통문 작성기.gs](file:///c:/Users/Administrator/Desktop/vibecoding_projects/seteuk_haengbal/학기말 가통문 작성기.gs)
- Create a new script file to handle the correspondence generation logic.
- **Functions**:
    - `generateCorrespondenceSummer()`: Generates Summer correspondence for selected/all rows.
    - `generateCorrespondenceWinter()`: Generates Winter correspondence for selected/all rows.
    - `generateCorrespondenceSummerCustom()`: Summer correspondence with custom length.
    - `generateCorrespondenceWinterCustom()`: Winter correspondence with custom length.
    - `callOpenAICorrespondence()`: Handles API calls with specific prompts for correspondence.
    - `shuffleKeywords()`: Helper function to shuffle keywords for variety.
- **Prompts**:
    - Define `SUMMER_PROMPT_TEMPLATE` and `WINTER_PROMPT_TEMPLATE`.
    - Include instructions for tone (warm, professional, encouraging) and structure (greeting, body based on keywords, closing).

#### [MODIFY] [메뉴설정.gs](file:///c:/Users/Administrator/Desktop/vibecoding_projects/seteuk_haengbal/메뉴설정.gs)
- Add a new menu section "📜 가통문 작성".
- Add items:
    - "☀️ 여름방학 가통문 작성 (기본 1000Byte)"
    - "❄️ 겨울방학 가통문 작성 (기본 1000Byte)"
    - "📏 글자 수 지정 작성" (Sub-menu with Summer/Winter options)

## Verification Plan

### Manual Verification
1.  **Menu Check**: Reload the spreadsheet and verify the new "📜 가통문 작성" menu appears.
2.  **Summer Generation**:
    - Enter keywords in column I (e.g., "학업, 건강, 친구 관계").
    - Run "☀️ 여름방학 가통문 작성".
    - Verify output in column J matches the tone and includes the keywords.
3.  **Winter Generation**:
    - Enter keywords in column I.
    - Run "❄️ 겨울방학 가통문 작성".
    - Verify output in column J.
4.  **Custom Length**:
    - Run "📏 글자 수 지정 작성" -> "☀️ 여름방학...".
    - Enter a specific byte count (e.g., 500).
    - Verify the output length is approximately correct.
5.  **Variety Check**:
    - Run generation multiple times for the same keywords and check if the output varies (due to shuffling and high temperature).
