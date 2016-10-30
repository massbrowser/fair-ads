;(function () {
'use strict';

var ub = µBlock;

function extractDomain(url) {
  let domain, domainArr;
  //find & remove protocol (http, ftp, etc.) and get domain
  if (url.indexOf('://') > -1) {
    domain = url.split('/')[2];
  }
  else {
    domain = url.split('/')[0];
  }

  //find & remove port number
  domain = domain.split(':')[0];

  domainArr = domain.split('.');

  domain = `${domainArr[domainArr.length - 2]}.${domainArr[domainArr.length - 1]}`;

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

ub.getAndCacheDomainClass = function (url) {
  return new Promise((resolve) => {
    let domain = extractDomain(url);

    let domainClass = ((url) => {
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
    })(url);
    this.cachedDomains[domain] = {
      class: domainClass,
      time: 0
    };
    setTimeout(function () {
      resolve(url);
    }, 500);
  });
};

ub.cachedDomains = {};

ub.getDomainAdsClass = function (url) {
  let domain = extractDomain(url);
  if (domain in this.cachedDomains) {
    return this.cachedDomains[domain].class;
  } else {
    return '?!';
  }
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

ub.isUrlHasCachedClass = function (url) {
  let domain = extractDomain(url);
  return domain in this.cachedDomains;
};

})();