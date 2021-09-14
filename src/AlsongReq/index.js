const api = {
  enc: null,
  db: null,
  info: null,
  finalData: null,
  lyric: null
}
const urls = ['https://lyric.altools.com', '/v1/search', '/v1/info'];
/**
 * @name CustomError
 * @author BlueRex
 * @param {string} ErrorName error Name 
 * @returns
 * @see BlueRex https://github.com/archethic/rhino-customError
 */
function CustomError(ErrorName) {
  var errForm = (Message) => {
    this.message = Message
  }

  function CE(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    errForm && errForm.call(this, arguments[0]);
  }

  CE.prototype = new Error();
  CE.prototype.name = ErrorName;
  CE.prototype.constructor = CE;
  return CE;
}
const NetWorkError = CustomError("NetWorkError");

function displayInfo(str) {
  let ele = document.getElementById('lrcRaw');
  if (!ele) {
    ele = document.createElement('div');
    ele.id = 'lrcRaw';
    ele.innerText = 'Init Lrc...';
    document.body.appendChild(ele)
  } else {
    if (str) {
      ele.innerText = Array.isArray(str) ? str.join('\n') : typeof str == 'object' ? JSON.stringify(str) : str;
    }
  }
}
/**
 * @author jomin398
 * @name displayJSON
 * @param {object} obj to display json object 
 * @param {object} option to set options @see guide https://github.com/abodelot/jquery.json-viewer
 */
function displayJSON(obj, option) {
  let el1 = document.getElementById('json-rendrer');
  if (!el1) {
    jsonWrapper = document.createElement('div');
    jsonWrapper.id = 'jsonWrapper';
    el1 = document.createElement('label');
    el1.innerText = 'JSON viewer';
    el2 = document.createElement('a');
    el2.id = 'json-rendrer';
    el2.innerText = 'Init json...';
    jsonWrapper.append(el1, document.createElement('br'), el2);
    document.body.appendChild(jsonWrapper);
  }
  if (obj) {
    $(function() {
      $('#json-rendrer').jsonViewer(obj, option);
    });
  }

}

// @see https://stackoverflow.com/a/65706633
function countDuplicate(arr) {
  if (!arr) {
    return null;
  }
  let obj = {}
  for (var i = 0; i < arr.length; i++) {
    obj[arr[i]] = obj[arr[i]] != null ? obj[arr[i]] + 1 : 1 //stores duplicate in an obj
  }
  return obj;
}
//pickup Greatest number of Duplicates;
function pickupGreatestDuples() {
  arr = Array.from(api.db, x => x.album);
  obj = countDuplicate(arr);
  nrr = Object.values(obj);
  return {
    one: arr.indexOf(Object.keys(obj)[nrr.indexOf(nrr.reduce((acc, item) => acc = acc > item ? acc : item, 0))]),
    list: obj
  };
}

function findLyrics(db, option) {
  displayInfo('Alsong: 정보 필터링 중...');
  api.db = JSON.parse(db);
  api.db = api.db.filter(d => d.playtime != -1);
  if (option.includeAlbumText) {
    api.db = api.db.filter(d => d.album.indexOf(option.includeAlbumText) != -1)[0];
  } else {
    api.info.ListPickup = pickupGreatestDuples().list;
    api.db = api.db[pickupGreatestDuples().one];
  }
  let testType = option.includeAlbumText ? 0 : 1;
  api.info.filteringType = testType;
  api.info.filterName = ["입력된 앨범이름으로", "가장 많은 앨범으로"][testType];
  displayInfo("Alsong: " + api.info.filterName + " 필터링 완료.");
  displayJSON({ DB: api.db, Options: option, Info: api.info });
  console.log(api.db);
  displayInfo("Alsong: 가사 요청 전송...");
  getLyric(option)
}

function addXhrHeaders(xhr) {
  xhr.setRequestHeader("accept-language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7");
  xhr.setRequestHeader("access-control-allow-credentials", "true");
  xhr.setRequestHeader("access-control-allow-origin", "https://lyric.altools.com");
  xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.setRequestHeader("referrerPolicy", "strict-origin-when-cross-origin");
}

function getResembleLyricList(artist, title, option) {
  displayInfo('Alsong: RSA 키 생성');
  if (!option) {
    option = {};
  }
  let RSA = new(RSAForHtml());
  api.enc = RSA.encrypt();

  let xhr = new XMLHttpRequest();
  const page = option.page || 0;
  const playtime = option.playtime || 0;
  const params = new URLSearchParams();
  params.append('title', title);
  params.append('artist', artist);
  if (playtime) {
    params.append('playtime', playtime);
  }
  params.append('page', page + 1);
  displayInfo('Alsong: RSA 키 생성 완료');
  params.append('encData', api.enc);
  api.info = {};
  api.info.SearchTitle = title;
  api.info.SearchArtist = artist;

  doCORSRequest({
    method: 'POST',
    url: urls[0] + urls[1],
    data: params
  }, (res) => {
    findLyrics(res.responseText, option)
    delete res.responseText;
    console.log(res);
  });
};

function parseLyric(lyric) {
  const lyrics = {};
  const lyricLines = {};
  lyric.split('<br>').forEach(v => {
    const match = v.match(/^\[(\d+):(\d\d).(\d\d)\](.*)$/);
    if (!match) return;

    const timestamp = 10 * (parseInt(match[1]) * 60 * 100 + parseInt(match[2]) * 100 + parseInt(match[3]));
    if (!lyrics[timestamp]) lyrics[timestamp] = [];

    lyrics[timestamp].push(match[4]);

  });
  if (lyrics[0].length > 3) {
    lyrics[0] = ["", "", ""];
  }
  return lyrics;
}

function getLyric(option) {
  const params = new URLSearchParams();
  params.append('info_id', api.db.lyric_id);
  params.append('encData', api.enc);

  let xhr = new XMLHttpRequest();
  xhr.open('POST', urls[0] + urls[2], true);
  xhr.onload = () => {
    if (xhr.status != 200) { // analyze HTTP status of the response
      displayInfo("Alsong: 가사 요청 실페");
      console.log(xhr.status + " Error ", xhr.statusText); // e.g. 404: Not Found
    } else {
      let res = xhr.responseText;
      displayInfo("Alsong: 가사 요청 성공. (" + xhr.response.length + " bytes)");
      api.finalData = {};
      api.finalData = JSON.parse(res);
      api.lyric = {};
      api.lyric = new parseLyric(api.finalData.lyric);
      let json = Object.assign({}, api);
      delete json.enc;

      displayJSON(json, { collapsed: true });
    }
  }
  xhr.onerror = () => {
    let e = new NetWorkError('ServerNotResponce');
    displayInfo(["Alsong:", e, "at XMLHttpRequest"]);
  }
  xhr.send(params);
}