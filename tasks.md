# Project Tasks

## Phase 1: Refining Output Logic and Formatting (Completed)
- [x] Setuk: Implement activity randomization <!-- id: 100 -->
- [x] Haengbal: Enforce strict formatting (no special chars, final period) <!-- id: 101 -->
- [x] Gatongmun: Use keywords as themes, remove brackets/signatures <!-- id: 102 -->

## Phase 2: Refining Gatongmun Tone and Content (Completed)
- [x] Enforce formal tone (remove "~구요", "~네요") <!-- id: 200 -->
- [x] Remove specific year mentions (2024, 2025) <!-- id: 201 -->
- [x] Fix syntax error in `학기말 가통문 작성기.gs` <!-- id: 202 -->

## Phase 3: Update Column References and Implement Grade-Based Logic (Completed)
- [x] Update `학생 세특 작성기.gs` for Grade logic <!-- id: 301 -->
- [x] Update `학생 행발 작성기.gs` for column shifts <!-- id: 305 -->
- [x] Update `학기말 가통문 작성기.gs` for column shifts <!-- id: 307 -->

## Phase 4: Incorporate Subject Name and Clean Output (Completed)
- [x] Update `학생 세특 작성기.gs` with Subject Name and Cleaning <!-- id: 402 -->
- [x] Update `학생 행발 작성기.gs` for column shifts <!-- id: 406 -->
- [x] Update `학기말 가통문 작성기.gs` for column shifts <!-- id: 408 -->

## Phase 5: Further Refinement - Anonymize Subject, Strict Output, and Spacing
- [x] Plan and Document Changes <!-- id: 500 -->
- [x] Update `학생 세특 작성기.gs` <!-- id: 501 -->
    - [x] Modify prompt to forbid explicit subject name mentions <!-- id: 502 -->
    - [x] Reinforce strict output cleaning (no extra text) <!-- id: 503 -->
    - [x] Enforce spacing rule: Period + Space (except end of text) <!-- id: 504 -->
- [x] Update `학생 행발 작성기.gs` <!-- id: 505 -->
    - [x] Enforce spacing rule: Period + Space (except end of text) <!-- id: 506 -->
- [x] Update `학기말 가통문 작성기.gs` <!-- id: 507 -->
    - [x] Enforce spacing rule: Period + Space (except end of text) <!-- id: 508 -->
- [x] Verification <!-- id: 509 -->

## Phase 6: Content Level and Convergence Control
- [x] Plan and Document Changes <!-- id: 600 -->
- [x] Update `학생 세특 작성기.gs` <!-- id: 601 -->
    - [x] Lower content level (High School appropriate, no academic jargon) <!-- id: 602 -->
    - [x] Restrict Convergence/Fusion (Only if explicitly mentioned) <!-- id: 603 -->
- [x] Verification <!-- id: 604 -->

## Phase 7: Gatongmun Output Cleaning
- [x] Plan and Document Changes <!-- id: 700 -->
- [x] Update `학기말 가통문 작성기.gs` <!-- id: 701 -->
    - [x] Modify prompt to forbid internal logic descriptions <!-- id: 702 -->
    - [x] Add regex to remove "Keyword order change", "Diverse expressions", etc. <!-- id: 703 -->
- [x] Verification <!-- id: 704 -->

## Phase 8: Final Cleaning and Punctuation
- [x] Plan and Document Changes <!-- id: 800 -->
- [x] Update `학기말 가통문 작성기.gs` <!-- id: 801 -->
    - [x] Remove "Input Keywords" and Omit Subjects <!-- id: 802 -->
    - [x] Enforce strict punctuation (Period + Space) <!-- id: 803 -->
    - [x] Enforce strict length (~1000 bytes) <!-- id: 807 -->
- [x] Update `학생 세특 작성기.gs` & `학생 행발 작성기.gs` <!-- id: 804 -->
    - [x] Reinforce strict punctuation (Period + Space) <!-- id: 805 -->
- [x] Verification <!-- id: 806 -->
