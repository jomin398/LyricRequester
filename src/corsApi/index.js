/*
from
https://github.com/Rob--W/cors-anywhere
*/

const cors_api_url = 'https://cors-anywhere.herokuapp.com/';
/**
* doCORSRequest({
*   method: this.id === 'post' ? 'POST' : 'GET',
*   url: urlField.value,
*   data: dataField.value
* }, function printResult(result) {
*   outputField.value = result;
* });
*/
function doCORSRequest(options, printResult) {
  let x = new XMLHttpRequest();
  x.open(options.method, cors_api_url + options.url);
  x.onload = x.onerror = function() {
    printResult(
      {
        method:options.method,
        url:options.url,
        status:x.status,
        statusText:x.statusText,
      responseText: x.responseText || ''}
    );
  };
  if (/^POST/i.test(options.method)) {
    x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
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