;(function () {
  let url = decodeURIComponent(window.location.search.split('?url=')[1]);
  vAPI.messaging.send(
    'checkDomainClass',
    {
      url: url
    },
    function (url) {
      window.location.replace(url);
    }
  );
})();