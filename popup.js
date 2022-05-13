/*
「平手」、「香落ち」、「右香落ち」、「角落ち」、「飛車落ち」、「飛香落ち」、「二枚落ち」、「三枚落ち」、「四枚落ち」、「五枚落ち」、「左五枚落ち」、「六枚落ち」、「左七枚落ち」、「右七枚落ち」、「八枚落ち」、「十枚落ち」、「その他」

<移動先座標> = <X座標><Y座標> | "同　"

<X座標> "１"～"９"：全角アラビア数字
<Y座標> "一"～"九"：全角漢数字
"同　"は、直前の指し手の移動先

<駒> 駒名
玉、飛、龍、角、馬、金、銀、成銀、桂、成桂、香、成香、歩、と
龍を「竜」であらわす場合もある。
成銀を「全」、成桂を「圭」、成香を「杏」であらわす場合もある（「詰将棋パラダイス」でも使用）。

*/
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

  function output_utf8_sig(records) {
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
  }

  // アプリケーションの確認
  // 対応済みサイト
  // 形式チェック
  // 将棋ウォーズ'https://shogiwars.heroz.jp/web_app/standard/'})
  // ピヨ将棋 'https://www.studiok-i.net/ps/'

  // 対応済みの形式かどうかチェック

  let info;
  let filename;
  let records = [
    '#KIF version=2.0 encoding=UTF-8',
    //'開始日時：1999/07/15',
    //'持ち時間：20分+30秒',
    //'場所：将棋ウォーズ',
    '手合割：平手',
    '下手：プレイヤー',
    '上手：プレイヤー',
    '手数----指手---------消費時間--'
  ]
  let kifu;
  let teban = '';
  let orig = '';
  let formatted = '';

  info = document.querySelectorAll('[id^=twitter-widget-]')[0].dataset.url;
  if (info) {
    // 将棋ウォーズとして処理
    console.log('将棋ウォーズとして処理...')
    filename = info.substring(info.lastIndexOf('/') + 1) + '.kif';
    kifu = document.querySelectorAll("#kifu_child span");
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

    output_utf8_sig(records);
    return false;
  }

  info = document.querySelectorAll('[id^=select_kifu]');
  if (info) {
    records = [
      '#KIF version=2.0 encoding=UTF-8',
      '手合割：六枚落ち',
      '下手：プレイヤー',
      '上手：プレイヤー',
      '手数----指手---------消費時間--'
    ]
    // ぴよ将棋として処理
    console.log('ピヨ将棋として処理...')
    filename = 'piyo.kif';
    kifu = document.querySelectorAll("#select_kifu option");
    kifu.forEach(function (te) {
      txt = te.innerHTML;
      if (txt.length > 0) {
        teban = txt.match(/[0-9]+/);
        if (teban) {
          if (teban[0] != 0) {
            formatted = txt.replace('▲', '').replace('△', '').replace('杏', '成香');
            records.push(formatted);
          }
        }
      }
    });
    output_utf8_sig(records);
    return false;

  }
};
