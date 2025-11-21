// ====================================
// 메뉴 통합 스크립트
// 이 스크립트를 "메뉴설정.gs" 파일로 저장하세요
// ====================================

// 세특과 행발 메뉴를 모두 생성하는 함수
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  // 세특 작성 메뉴
  ui.createMenu('📋 세특 작성')
    .addItem('✨ 세특 작성 시작하기', 'generateSetukForAllEmpty')
    .addItem('✍️ 선택한 행만 작성하기', 'generateSetukForSelectedRows')
    .addSeparator()
    .addSubMenu(ui.createMenu('📏 글자 수 지정 작성')
      .addItem('전체 작성 (글자수 지정)', 'generateSetukCustomLengthForAll')
      .addItem('선택 행 작성 (글자수 지정)', 'generateSetukCustomLengthForSelected'))
    .addSeparator()
    .addItem('📏 셀 높이 자동 조절', 'autoResizeRowsSetuk')
    .addToUi();
  
  // 행발 작성 메뉴
  ui.createMenu('🌟 행발 작성')
    .addItem('✨ 행발 작성 시작하기', 'generateHaengbalForAllEmpty')
    .addItem('✍️ 선택한 행만 작성하기', 'generateHaengbalForSelectedRows')
    .addSeparator()
    .addSubMenu(ui.createMenu('📏 글자 수 지정 작성')
      .addItem('전체 작성 (글자수 지정)', 'generateHaengbalCustomLengthForAll')
      .addItem('선택 행 작성 (글자수 지정)', 'generateHaengbalCustomLengthForSelected'))
    .addSeparator()
    .addItem('📏 셀 높이 자동 조절', 'autoResizeRowsHaengbal')
    .addToUi();
}