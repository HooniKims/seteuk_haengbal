# Semester-End Correspondence Generator Walkthrough

This document explains how to use the newly added "Semester-End Family Correspondence" generator.

## 1. Overview
A new feature has been added to generate family correspondence (가통문) based on keywords. You can create Summer or Winter versions, and the content will be generated in column J based on keywords in column I.

## 2. How to Use

### Step 1: Enter Keywords
1.  Open the spreadsheet.
2.  Go to **Column I (I열)**.
3.  Enter keywords describing the student or the tone you want (e.g., "학업, 건강, 친구 관계, 가족 여행").

### Step 2: Select Menu
1.  Click on the **"📜 가통문 작성"** menu in the toolbar.
2.  Choose one of the following:
    - **☀️ 여름방학 가통문 작성**: Generates a summer-themed letter (default 1000 bytes).
    - **❄️ 겨울방학 가통문 작성**: Generates a winter/year-end themed letter (default 1000 bytes).
    - **📏 글자 수 지정 작성**: Allows you to specify the length (e.g., 500 bytes).

### Step 3: Check Results
1.  The script will process the rows (either selected rows or all rows with keywords).
2.  The generated correspondence will appear in **Column J (J열)**.
3.  The cell height and alignment will be automatically adjusted.

## 3. Key Features
- **Variety**: Even with the same keywords, the generated content will vary in expression and structure.
- **Custom Length**: You can control the length of the text to fit your needs.
- **Two Modes**: tailored prompts for Summer (vacation guidance) and Winter (year-end wrap-up).

## 4. Files Changed
- `학기말 가통문 작성기.gs`: New script containing the generation logic.
- `메뉴설정.gs`: Updated to include the new menu items.
