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
    $(function () {
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
  displayInfo('Alsong: ?????? ????????? ???...');
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
  api.info.filterName = ["????????? ??????????????????", "?????? ?????? ????????????"][testType];
  displayInfo("Alsong: " + api.info.filterName + " ????????? ??????.");
  displayJSON({ DB: api.db, Options: option, Info: api.info });
  console.log(api.db);
  displayInfo("Alsong: ?????? ?????? ??????...");
  getLyric(option)
}

function getResembleLyricList(artist, title, option) {
  displayInfo('Alsong: RSA ??? ??????');
  if (!option) {
    option = {};
  }
  let RSA = new (RSAForHtml());
  api.enc = RSA.encrypt();

  const page = option.page || 0;
  const playtime = option.playtime || 0;
  const params = new URLSearchParams();
  params.append('title', title);
  params.append('artist', artist);
  if (playtime) {
    params.append('playtime', playtime);
  }
  params.append('page', page + 1);
  displayInfo('Alsong: RSA ??? ?????? ??????');
  params.append('encData', api.enc);
  api.info = {};
  api.info.SearchTitle = title;
  api.info.SearchArtist = artist;
  doCORSRequest({
    method: 'POST',
    url: urls[0] + urls[1],
    data: params,
    progress: true
  }, (res) => {
    findLyrics(res.responseText, option)
    delete res.responseText;
    console.log(res);
  });
};

function parseLyric(lyric, method) {
  const lyrics = {};
  
  if (method) {
    lyric.split('<br>').forEach(v => {
      const match = v.match(/^\[(\d+):(\d\d).(\d\d)\](.*)$/);
      if (!match) return;

      const timestamp = 10 * (parseInt(match[1]) * 60 * 100 + parseInt(match[2]) * 100 + parseInt(match[3]));
      if (!lyrics[timestamp]) lyrics[timestamp] = [];

      lyrics[timestamp].push(match[4]);

    });
    let lyricFirst = lyrics[0];
    if (lyricFirst) {
      if (lyrics[0].length > 3) {
        lyrics[0] = ["", "", ""];
      }
    }
  } else {
    lyric.split('<br>').forEach(v => {
      const match = v.match(/^\[(\d+):(\d\d).(\d\d)\](.*)$/);
      if (!match) return;
      const timestamp = v.match(/^\[\d+:\d\d\.\d\d\]/)[0];
      if (!lyrics[timestamp]) lyrics[timestamp] = [];

      lyrics[timestamp].push(match[4]);
    })
    lyricFirst = lyrics["[00:00.00]"];
    if (lyricFirst) {
      
        lyrics["[00:00.00]"] = ["", "", ""];
      
    }
  }
  return lyrics;
}

function getLyric() {
  const params = new URLSearchParams();
  params.append('info_id', api.db.lyric_id);
  params.append('encData', api.enc);
  doCORSRequest({
    method: 'POST',
    url: urls[0] + urls[2],
    data: params,
    progress: true
  }, (res) => {
    if (res.status != 200) { // analyze HTTP status of the response
      displayInfo("Alsong: ?????? ?????? ??????");
      console.log(res.status + " Error ", res.statusText); // e.g. 404: Not Found
    } else {
      displayInfo("Alsong: ?????? ?????? ??????. (" + res.response.length + " bytes)");
      lyricsDisplay(res);
    }
  });
}
function lyricsDisplay(res) {
  api.finalData = {};
  api.finalData = JSON.parse(res.responseText);
  api.lyric = [];
  api.lyric.push(api.finalData.lyric.replaceAll('[00:00.00]<br>','').replaceAll('<br>', '\n'));
  api.lyric.push(new parseLyric(api.finalData.lyric));
  api.lyric.push(new parseLyric(api.finalData.lyric, true));
  let json = Object.assign({}, api);
  delete json.enc;
  displayJSON(json, { collapsed: true });
  //display
  lyricsWrapper = document.createElement('div');
  lyricsWrapper.id = lyricsWrapper;
  lyricsWrapper.innerText = api.lyric[0];
  document.getElementById('jsonWrapper').insertAdjacentElement('afterend', lyricsWrapper)
}