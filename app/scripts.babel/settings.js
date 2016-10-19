'use strict';

var selectedClass = 'selected';
var adsClassClass = 'js-ads-level';
var checkBitcoinClass = 'js-check-bitcoin-id';
var bitcoinInputClass = 'js-bitcoin-input';
var defaultAdsClass = 'c';

var setAdsClass = function (data) {
  // if ($.isEmptyObject(data)) {
  //   $(`.js-ads-level[data-class=${defaultAdsClass}]`).addClass(selectedClass);
  // } else {
  //   $(`.js-ads-level[data-class=${data.adsClass}]`).addClass(selectedClass);
  // }
  $(`.js-ads-level[data-class=${data.adsClass}]`).addClass(selectedClass);
};

vAPI.messaging.send('getData', {'key': 'adsClass'}, setAdsClass);

vAPI.messaging.send('getData', {'key': 'bitcoinId'}, function (data) {
  if (!$.isEmptyObject(data)) {
    $(`.${bitcoinInputClass}`).val(data.bitcoinId);
  }
});

function updateWhiteListByAdsClass(adsClass) {
  vAPI.messaging.send('updWhiteList', {'adsClass': adsClass}, function (data) {});
}


$(`.${adsClassClass}`).on('click', function (e) {
  e.preventDefault();
  let adsClass = $(e.currentTarget).data('class');
  vAPI.messaging.send('saveAdsClass', {'adsClass': adsClass}, function () {
    $(`.${adsClassClass}`).removeClass(selectedClass);
    $(e.currentTarget).addClass(selectedClass);
    updateWhiteListByAdsClass(adsClass);
  });
});

var checkBitcoin = function (bitcoinId) {
  let saveBitcoinId = function (bitcoinId, callback) {
    vAPI.messaging.send('saveData', {'bitcoinId': bitcoinId}, callback);
  };
  $.get(`https://blockchain.info/q/addressbalance/${bitcoinId}?confirmations=6`, function (balance) {
    if (Number(balance) > 0) {
      saveBitcoinId(bitcoinId, function () {
        $('.js-check-bitcoin-success').text(`Success! Wallet balance is ${balance}.`);
        $('.js-check-bitcoin-fail').text('');
      });
    } else {
      $('.js-check-bitcoin-success').text('');
      $('.js-check-bitcoin-fail').text('Fail');
    }
  });
};

$(`.${checkBitcoinClass}`).on('click', function () {
  let bitcoinId = $(`.${bitcoinInputClass}`).val();
  checkBitcoin(bitcoinId);
});
