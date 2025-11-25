// ====================================
// 메뉴 통합 스크립트
// 이 스크립트를 "메뉴설정.gs" 파일로 저장하세요
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
  
  // 동아리 특기사항 작성 메뉴
  ui.createMenu('🎭 동아리 특기사항')
    .addItem('✨ 동아리 특기사항 작성 시작하기', 'generateDongariForAllEmpty')
    .addItem('✍️ 선택한 행만 작성하기', 'generateDongariForSelectedRows')
    .addSeparator()
    .addSubMenu(ui.createMenu('📏 글자 수 지정 작성')
      .addItem('전체 작성 (글자수 지정)', 'generateDongariCustomLengthForAll')
      .addItem('선택 행 작성 (글자수 지정)', 'generateDongariCustomLengthForSelected'))
    .addSeparator()
    .addItem('📏 셀 높이 자동 조절', 'autoResizeRowsDongari')
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

  // 가통문 작성 메뉴
  ui.createMenu('📜 가통문 작성')
    .addSubMenu(ui.createMenu('☀️ 여름방학')
      .addItem('✨ 전체 작성 (기본 1000Byte)', 'generateCorrespondenceSummer')
      .addItem('✍️ 선택한 행만 작성', 'generateCorrespondenceSummerSelected')
      .addSeparator()
      .addItem('📏 전체 작성 (글자수 지정)', 'generateCorrespondenceSummerCustom')
      .addItem('📏 선택 행 작성 (글자수 지정)', 'generateCorrespondenceSummerCustomSelected'))
    .addSubMenu(ui.createMenu('❄️ 겨울방학')
      .addItem('✨ 전체 작성 (기본 1000Byte)', 'generateCorrespondenceWinter')
      .addItem('✍️ 선택한 행만 작성', 'generateCorrespondenceWinterSelected')
      .addSeparator()
      .addItem('📏 전체 작성 (글자수 지정)', 'generateCorrespondenceWinterCustom')
      .addItem('📏 선택 행 작성 (글자수 지정)', 'generateCorrespondenceWinterCustomSelected'))
    .addToUi();
}