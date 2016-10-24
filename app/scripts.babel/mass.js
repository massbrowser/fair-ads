;(function () {
'use strict';

var ub = µBlock;

function extractDomain(url) {
  var domain;
  //find & remove protocol (http, ftp, etc.) and get domain
  if (url.indexOf('://') > -1) {
    domain = url.split('/')[2];
  }
  else {
    domain = url.split('/')[0];
  }

  //find & remove port number
  domain = domain.split(':')[0];

  return domain;
}

ub.adsClasses = [
  {
    domain: 'example.com',
    class: 'a'
  },
  {
    domain: 'google.com',
    class: 'b'
  },
  {
    domain: 'facebook.com',
    class: 'c'
  },
  {
    domain: 'mail.ru',
    class: 'd'
  },
  {
    domain: '',
    class: 'e'
  },
  {
    domain: '',
    class: 'f'
  },
  {
    domain: 'youtube.com',
    class: 'd'
  },
  {
    domain: 'baidu.com',
    class: ''
  },
  {
    domain: 'wikipedia.org',
    class: 'a'
  },
  {
    domain: 'yahoo.com',
    class: 'b'
  },
  {
    domain: 'google.co.in',
    class: 'b'
  },
  {
    domain: 'twitter.com',
    class: ''
  },
  {
    domain: 'amazon.com',
    class: ''
  },
  {
    domain: 'qq.com',
    class: ''
  },
  {
    domain: 'google.co.jp',
    class: 'b'
  },
  {
    domain: 'live.com',
    class: 'b'
  },
  {
    domain: 'linkedin.com',
    class: 'c'
  },
  {
    domain: 'taobao.com',
    class: 'c'
  },
  {
    domain: 'vk.com',
    class: 'b'
  },
  {
    domain: 'hao123.com',
    class: ''
  },
  {
    domain: 'sohu.com',
    class: ''
  },
  {
    domain: 'weibo.com',
    class: 'c'
  },
  {
    domain: 'sina.com.cn',
    class: 'c'
  },
  {
    domain: '360.cn',
    class: 'd'
  },
  {
    domain: 'google.de',
    class: 'b'
  },
  {
    domain: 'yahoo.co.jp',
    class: 'b'
  },
  {
    domain: 'reddit.com',
    class: 'b'
  },
  {
    domain: 'google.com.br',
    class: 'b'
  },
  {
    domain: 'forklog.com',
    class: 'c'
  },
  {
    domain: 'forklog.net',
    class: 'c'
  },
  {
    domain: 'bitcointalk.org',
    class: 'b'
  },
  {
    domain: 'yandex.ru',
    class: 'c'
  },
  {
    domain: 'ya.ru',
    class: 'b'
  }
];

ub.isGoogleDomain = function (url) {
  let urlArray = url.split('.');
  if ((urlArray[urlArray.length - 2] === 'com') || (urlArray[urlArray.length - 2] === 'co') ) {
    if (urlArray[urlArray.length - 3] === 'google') {
      return true;
    }
  } else {
    return urlArray[urlArray.length - 2] === 'google';
  }
};

ub.getDomainAdsClass = function (url) {
  let result = '?';
  let domain = extractDomain(url);
  if (this.isGoogleDomain(domain)) {
    result = 'b';
  }
  let domainArray = domain.split('.');
  this.adsClasses.forEach(function (el) {
    let elDomainArray = el.domain.split('.');
    if ((domainArray[domainArray.length - 1] == elDomainArray[elDomainArray.length - 1]) && (domainArray[domainArray.length - 2] == elDomainArray[elDomainArray.length - 2])) {
      result =  el.class;
    }
  });
  return result;
};

ub.checkIfUrlFitsAdsClass = function (url) {
  let adsClass = this.adsClass;
  let result = false;
  // for google
  if (adsClass >= 'b') {
    if (this.isGoogleDomain(url)) {
      result = true;
    }
  }
  // for domains in list
  let domainAdsClass = this.getDomainAdsClass(url);
  if (domainAdsClass != '?') {
    result =  domainAdsClass <= adsClass;
  }
  return result;
};

})();