'use strict';

console.log('chromereload.js');

const LIVERELOAD_HOST = 'localhost:';
const LIVERELOAD_PORT = 35729;
const connection = new WebSocket('ws://' + LIVERELOAD_HOST + LIVERELOAD_PORT + '/livereload');


connection.onerror = error => {
  console.log('reload connection got error:', error);
};

function reloadActiveTabs() {
  chrome.tabs.query(
    {active : true, currentWindow: true},
    function(tabArray){
     tabArray.forEach(function (tab) {
       chrome.tabs.reload(tab.id, function () {
         chrome.runtime.reload();
       });
     });
    }
  )
}

connection.onmessage = e => {
  if (e.data) {
    const data = JSON.parse(e.data);
    if (data && data.command === 'reload') {
      reloadActiveTabs();
    }
  }
};

