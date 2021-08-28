const api = {
    enc: null,
    req: null,
    db: null,
    info:{}
}
function displayInfo(str){
    let ele = document.getElementById('lrcRaw');
    if(!ele){
        ele = document.createElement('div');
        ele.id = 'lrcRaw';
        ele.innerText = 'Init Lrc...';
        document.body.appendChild(ele)
    }else{
        if(str){
            ele.innerText = Array.isArray(str)?str.join('\n'):typeof str == 'object'?JSON.stringify(str):str;
        }
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
        one:arr.indexOf(Object.keys(obj)[nrr.indexOf(nrr.reduce((acc, item) => acc = acc > item ? acc : item, 0))]),
        list:obj
    };
}
function findLyrics(db, option) {
    displayInfo('Alsong: 정보 필터링 중...');
    api.db = db.data;
    api.db = api.db.filter(d => d.playtime != -1);
    if (option.includeAlbumText) {
        api.db = api.db.filter(d => d.album.indexOf(option.includeAlbumText) != -1)[0];
    }else{
        api.info.ListPickup= pickupGreatestDuples().list;
        api.db =api.db[pickupGreatestDuples().one];
    }
    displayInfo(["Alsong: "+(option.includeAlbumText?"입력된 앨범이름으로":"가장 많은 앨범으로")+" 필터링 완료.",JSON.stringify(api.db),null,'options : '+JSON.stringify(option),JSON.stringify(api.info)]);
    console.log(api.db);
}
function getResembleLyricList(artist, title, option) {
    displayInfo();
    if (!option) {
        option = {};
    }
    const urls = ['https://lyric.altools.com','/v1/search','/v1/info'];
    let RSA = new (RSAForHtml());
    api.enc = RSA.encrypt();
    api.req = axios.create({
        baseURL: urls[0],
        headers: {
            // 'Accept-Charset': 'utf-8',
            // 'Connection': 'close',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        responseType: 'json'
    });
    const page = option.page || 0;
    const playtime = option.playtime || 0;
    const params = new URLSearchParams();
    params.append('title', title);
    params.append('artist', artist);
    if (playtime) {
        params.append('playtime', playtime);
    }
    params.append('page', page + 1);
    displayInfo('Alsong: RSA 생성 완료');
    params.append('encData', api.enc);
    api.info.SearchTitle = title;
    api.info.SearchArtist = artist;
    const data = api.req.post(urls[1], params);
    data.then(e => findLyrics(e, option)).catch(e=>displayInfo(["Alsong: 서버 응답 없음: ",e,'Stack'+e.stack]))
};

// function getLyricById(id, option) {
//     const params = new URLSearchParams();
//     params.append('info_id', id);
//     params.append('encData', api.enc);

//     try {
//         const { data } = await api.req.post(urls[2], params);
//         return data;
//     } catch(err) {
//         if (err.response && err.response.status === 404) {
//             return null;
//         }

//         throw new Error("Alsong: Wrong response from server: " + err.message);
//     }
// }