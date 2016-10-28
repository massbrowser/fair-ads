/*******************************************************************************

    uBlock Origin - a browser extension to block requests.
    Copyright (C) 2014-2016 Raymond Hill

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/gorhill/uBlock
*/

/* global uDom, uBlockDashboard */

/******************************************************************************/

(function() {

'use strict';

/******************************************************************************/

var messaging = vAPI.messaging;
var cachedWhitelist = '';
var cachedWhitelistDefault = '';

// Could make it more fancy if needed. But speed... It's a compromise.
var reUnwantedChars = /[\x00-\x09\x0b\x0c\x0e-\x1f!"$'()<>{}|\\^\[\]`~]/;

/******************************************************************************/

var whitelistChanged = function() {
    var textarea = $('#whitelist');
    var s = textarea.val().trim();
    var changed = s === cachedWhitelist;
    var isDefault = cachedWhitelist===cachedWhitelistDefault;
    var bad = reUnwantedChars.test(s);
    $('#whitelistApply').prop('disabled', changed || bad);
    $('#whitelistRevert').prop('disabled', changed);
    $('#whitelistDefault').prop('disabled', isDefault);
    textarea.toggleClass('bad', bad);
};

/******************************************************************************/

var renderWhitelist = function() {
    var onRead = function(whitelist) {
        cachedWhitelist = whitelist.trim();
        $('#whitelist').val(cachedWhitelist + '\n');
        whitelistChanged();
    };
    messaging.send('dashboard', { what: 'getWhitelist' }, onRead);
};

/******************************************************************************/

var initDefaultWhitelist = function() {
    var onRead = function(whitelist) {
        cachedWhitelistDefault = whitelist.trim();
    };
    messaging.send('dashboard', { what: 'getDefaultWhitelist' }, onRead);
};

/******************************************************************************/

var handleImportFilePicker = function() {
    var fileReaderOnLoadHandler = function() {
        var textarea = $('#whitelist');
        textarea.val([textarea.val(), this.result].join('\n').trim());
        whitelistChanged();
    };
    var file = this.files[0];
    if ( file === undefined || file.name === '' ) {
        return;
    }
    if ( file.type.indexOf('text') !== 0 ) {
        return;
    }
    var fr = new FileReader();
    fr.onload = fileReaderOnLoadHandler;
    fr.readAsText(file);
};

/******************************************************************************/

var startImportFilePicker = function() {
    var input = document.getElementById('importFilePicker');
    // Reset to empty string, this will ensure an change event is properly
    // triggered if the user pick a file, even if it is the same as the last
    // one picked.
    input.value = '';
    input.click();
};

/******************************************************************************/

var exportWhitelistToFile = function() {
    var val = $('#whitelist').val().trim();
    if ( val === '' ) {
        return;
    }
    var now = new Date();
    var filename = vAPI.i18n('whitelistExportFilename')
        .replace('{{datetime}}', now.toLocaleString())
        .replace(/ +/g, '_');
    vAPI.download({
        'url': 'data:text/plain;charset=utf-8,' + encodeURIComponent(val + '\n'),
        'filename': filename
    });
};

/******************************************************************************/

var applyChanges = function() {
    cachedWhitelist = $('#whitelist').val().trim();
    var request = {
        what: 'setWhitelist',
        whitelist: cachedWhitelist
    };
    messaging.send('dashboard', request, renderWhitelist);
};

var revertChanges = function() {
    $('#whitelist').val(cachedWhitelist + '\n');
    whitelistChanged();
};

var setDefaultValues = function() {
    var request = {
        what: 'setDefaultWhitelist'
    };
    messaging.send('dashboard', request, renderWhitelist);
};

/******************************************************************************/

var getCloudData = function() {
    return $('#whitelist').val();
};

var setCloudData = function(data, append) {
    if ( typeof data !== 'string' ) {
        return;
    }
    var textarea = $('#whitelist')[0];
    if ( append ) {
        data = uBlockDashboard.mergeNewLines(textarea.value.trim(), data);
    }
    textarea.value = data.trim() + '\n';
    whitelistChanged();
};

self.cloud.onPush = getCloudData;
self.cloud.onPull = setCloudData;

/******************************************************************************/

$('#importWhitelistFromFile').on('click', startImportFilePicker);
$('#importFilePicker').on('change', handleImportFilePicker);
$('#exportWhitelistToFile').on('click', exportWhitelistToFile);
$('#whitelist').on('input', whitelistChanged);
$('#whitelistApply').on('click', applyChanges);
$('#whitelistRevert').on('click', revertChanges);
$('#whitelistDefault').on('click', setDefaultValues);

initDefaultWhitelist();
renderWhitelist();


/******************************************************************************/

})();
