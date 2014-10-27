var api = {
  stop: false,
  init: function () {
    api.setDefaultSettings();
    screenshot.init();
    codeinjector.init();
    api.listenMessages();
  },
  setDefaultSettings: function () {
    var defaults = {
      pngjpg: 'png',
      delay: 0,
      rnd: Math.random(),
      options: hex_md5((new Date).toString()) + hex_md5( Math.random().toString()),
      shortcut_full: 90,
      shortcut_visible: 88,
      shortcut_region: 82,
      enableshortcuts: 'yes',
      // show_toolbar: 'yes',
      // show_selectionbar: 'yes',
      button_size: 14,
      sb_opacity: 0.7,
      created: new Date,
      captureWithScroll: 0,
      captureWithoutScroll: 0,
      color: '#FF0000',
      captureCount: 0,
      txtHeader: 'Webpage Screenshot',
      txtFotter: '%U %D'
    };
    for (var i in defaults) {
      if (defaults.hasOwnProperty(i) && !localStorage.hasOwnProperty(i)) {
        localStorage[i] = defaults[i];
      }
    }
    chrome.i18n.getAcceptLanguages(function () {
      try{
        localStorage['primaryLanguage']=arguments[0][0]
      } catch(e) {
        localStorage['primaryLanguage']=''
      }
    });
  },
  isEnableURL: function (url){
    if (localStorage['sb_enable']!='yes') return false
    url=cleanUp(url);
    if(!url) return false
    var j= JSON.parse(  localStorage['sb_disableURLs'] || '{}' );
    if(j[url]=='disabled') return false;
    return true;
  },
  executeIfPermission: function (callback, fail) {
    chrome.permissions.contains({permissions: ['tabs']}, function (contains) {
      if (contains) {
        callback();
      } else if (fail) {
        fail();
      }
    })
  },
  callPopup: function (data) {
    var views = chrome.extension.getViews({type: "popup"});
    for (var i = 0; i < views.length; i++) {
      views[i].popup.exec(data);
    }
  },
  copyTextToClipboard: function (text) {
    var copyFrom = $('<textarea/>');
    copyFrom.text(text);
    $('body').append(copyFrom);
    copyFrom.select();
    document.execCommand('copy', true);
    copyFrom.remove();
  },
  listenMessages: function () {
    chrome.runtime.onMessage.addListener(function (data, sender, callback) {
      api.stop = false;
      switch (data.data) {
        case 'captureVisible':
          premissions.checkPermissions(function () {
            screenshot.captureVisible({
              callback: callback,
              runCallback: data.runCallback,
              keepIt: data.keepIt,
              cropData: data.cropData
            });
          });
          break;
        case 'captureAll':
          premissions.checkPermissions(function () {
            screenshot.captureAll({
              callback: callback,
              runCallback: data.runCallback,
              keepIt: data.keepIt,
              cropData: data.cropData
            });
          });
          break;
        case 'captureRegion':
          screenshot.captureRegion();
          break;
        case 'captureWebcam':
          screenshot.captureWebcam();
          break;
        case 'captureDesktop':
          screenshot.captureDesktop();
          break;
        case 'captureClipboard':
          screenshot.captureClipboard();
          break;
        case 'editContent':
          screenshot.editContent();
          break;
        case 'stopNow':
          api.stop = true;
          break;
        case 'ana':
          _gaq.push(data.array)
          break;
        case 'copyText':
          api.copyTextToClipboard(data.text);
          break;
        case 'storageGet':
          callback(localStorage);
          break;
        case 'storageSet':
          localStorage[data.key] = data.val;
          break;
        case 'upload':
          data.callback = callback;
          data.fail = callback;
          objectUrlToBlob(data.objectURL, function (blob) {
            data.blob = blob;
            uploady.upload(data);
          });
          break;
        case 'isEnableShortCuts':
          if (localStorage['enableshortcuts']=='yes')	{
            callback();
          }
          break;
        default:
          console.warn('Invalid message', data);
      }
      return true;
    });
  }
};
api.init();