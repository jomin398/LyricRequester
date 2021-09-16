/**
 * @constant {string} cors_api_url @see github https://github.com/jomin398/cors-anywhere
 */
const cors_api_url = 'https://corsfree.herokuapp.com/';

/**
 * @name doCORSRequest cors free function
 * @author Rob--W
 * @see cors-anywhere https://github.com/Rob--W/cors-anywhere
 * @license MIT
 * @param {Object} options 
 * @param {function} printResult call back function
 * @returns {Object} object result.
 * @example
 * doCORSRequest({
 *  method: options.method === 'post' ? 'POST' : 'GET',
 *  url: options.url,
 *  status: x.status,
 *  statusText: x.statusText,
 *  responseText: x.responseText || ''
 *  }
 * });
 */
function doCORSRequest(options, printResult) {
  let x = new XMLHttpRequest();
  x.open(options.method, cors_api_url + options.url);
  x.onload = x.onerror = function () {
    printResult(
      {
        method: options.method === 'post' ? 'POST' : 'GET',
        url: options.url,
        status: x.status,
        statusText: x.statusText,
        responseText: x.responseText || '',
        response:x.response
      }
    );
  };
  if (/^POST/i.test(options.method)) {
    x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    x.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
  }
  if(options.progress){
    function onXhrLoadLog(xhr) {
      if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        const precent = Math.round(percentComplete, 2);
        const reqName = xhr.target.responseURL;
        console.log(reqName + " -> "+ precent + '% downloaded');
      }
    };
    x.onprogress = (evt)=> onXhrLoadLog(evt);
  }
  x.send(options.data);
}

/*
xhr.onprogress = function(evt) {
  if (evt.lengthComputable) {
    evt.target.curLoad = evt.loaded;
    evt.target.log.parentNode.parentNode.previousSibling.textContent =
      Number(evt.loaded / k).toFixed() + "/" + Number(evt.total / k).toFixed() + "kB";
  }
  if (evt.lengthComputable) {
    var loaded = (evt.loaded / evt.total);
    if (loaded < 1) {
      var newW = loaded * width;
      if (newW < 10) newW = 10;
      evt.target.log.style.width = newW + "px";
    }
  }
};
*/