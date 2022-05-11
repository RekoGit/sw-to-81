document.getElementById("btn").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: exportKIF,
  });
});

function exportKIF() {
  function single_to_double(num) {
    return String(num).replace(/[A-Za-z0-9]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
    });
  }
  function int_to_kansuji(num) {
    kansuji = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    return kansuji[Number(num)]
  }

  let info = document.querySelectorAll('[id^=twitter-widget-]')[0].dataset.url;
  let filename = 'shogi_wars.kif';
  if (info) {
    filename = info.substring(info.lastIndexOf('/') + 1) + '.kif';
  }
  let records = [
    '#KIF version=2.0 encoding=UTF-8',
    '開始日時：1999/07/15',
    '持ち時間：20分+30秒',
    '場所：将棋ウォーズ',
    '手合割：平手',
    '下手：プレイヤー',
    '上手：プレイヤー',
    '手数----指手---------消費時間--'
  ]

  let kifu = document.querySelectorAll("#kifu_child span");
  let teban = '';
  let orig = '';
  let formatted = '';

  kifu.forEach(function (te) {
    txt = te.innerHTML;
    if (txt.length > 0) {
      teban = txt.match(/[0-9]+/);
      if (teban) {
        orig = txt.match(/(▲|△)[1-9][1-9].*/)[0];
        formatted = teban + ' ' + single_to_double(orig.substring(1, 2)) + int_to_kansuji(orig.substring(2, 3)) + orig.substring(3) + '   ( 0:00/00:00:00)'
        records.push(formatted);
      }
    }
  });

  let data = records.join('\r\n');
  let bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  let blob = new Blob([bom, data], { type: 'text/csv' });
  let url = (window.URL || window.webkitURL).createObjectURL(blob);
  let link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
