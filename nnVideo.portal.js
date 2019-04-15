/* 
   detikVideo Object for Portal-Developers
*/

// Chapter 1: Beginning
if (typeof jQuery !== 'function') {
  var warnJQueryUndefinedStr = 'detikVideo.portal.js needs jQuery 1.1x.x to run properly!';
  console.log(warnJQueryUndefinedStr);  
  alert(warnJQueryUndefinedStr);
  throw new Error(warnJQueryUndefinedStr); // this line will stop the script
};
if ($.type(detikVideo) !== 'object') {
  var warnDetikVideoUndefinedStr = 'detikVideo.portal.js needs detikVideo.core.js to run properly!';
  console.log(warnDetikVideoUndefinedStr);  
  alert(warnDetikVideoUndefinedStr);
  throw new Error(warnDetikVideoUndefinedStr); // this line will stop the script
};

// analytic dataLayer for Google
if (typeof window['dataLayer'] === 'undefined') {
  var dataLayer = [];
}



// Chapter 2: detikVideo Context as ctx
(function(ctx) {

  'use strict';

  var portalVersion     = '0.8.5';
  var portalHeaderInfo  = '[detikVideo.portal]';
  var playerName        = 'detikVideo'
  var playerInstance    = null;
  //you can also access ctx.scriptconf.*
  //you can also access ctx.vjsconf.* , etc
  //you can also access player instance with ctx.vars.player as long as it is an object
  //you can also access hlsjs instance with ctx.vars.hlsjsInstance as long as it is an object
  //you can also access adsManager instance with ctx.vars.imaAdsManager as long as it is an object
  //you can also access adsRenderingSettings instance with ctx.vars.imaAdsRenderingSettings as long as it is an object
    
  var title             = '';
  var labelStr          = '';
  var categoryEvent     = {};
  var eventStr          = '';
  var categoryStr       = '';
  var vk_eventStr       = '';
  var vk_categoryStr    = '';
  var programId         = '';
  var videoId           = '';

  var isFirstPlay       = false;
  var lastCurrentTime   = 0;

  var isPlaying0Sec = false;
  var isPlaying3Sec = false;
  var isPlaying30Sec= false;
  var isPlaying25Percent = false;
  var isPlaying50Percent = false;
  var isPlaying75Percent = false;

  var vjsTimeUpdateLog  = 0;
  var vjsTimeUpdateLogMax = 30;
  var vjsProgressLog    = 0;
  var vjsProgressLogMax   = 30;

  var docReferrer, metaArticleId = '';
  
  window.addEventListener("message", function(event) {
    if ( event.origin.includes('detik.com') || event.origin.includes('haibunda.com') || event.origin.includes('cnnindonesia.com') || event.origin.includes('cnbcindonesia.com') || event.origin.includes('insertlive.com') ) {
      docReferrer = document.referrer;
      metaArticleId = event.data;
    };
  });

  // portal Logging
  ctx.plog = function(txtLog, txtVal) {
    if ($.type(ctx.log) === 'function') {
      ctx.log(portalHeaderInfo, txtLog, txtVal);
    };
  };

  ctx.showPortalVersion = function() {
    ctx.plog('version is', portalVersion);
  };

  // ctx.coreRun in detikVideo.core.js will run ctx.portalInit before player and ima initialization
  ctx.portalInit = function() {
    ctx.plog('portalInit...', null);
    title         = ctx.scriptconf.title; // special variable from detikVideo.core.js
    labelStr      = ctx.label();
    categoryEvent = ctx.channelToCategoryEvent(ctx.scriptconf.channel);
    eventStr      = categoryEvent.event;
    categoryStr   = categoryEvent.category;
    //param for valuklik
    vk_eventStr   = (typeof categoryEvent.vk_event !== 'undefined') ? categoryEvent.vk_event : vk_eventStr;
    vk_categoryStr= (typeof categoryEvent.vk_category !== 'undefined') ? categoryEvent.vk_category : vk_categoryStr;
    programId     = (typeof program_id !== 'undefined') ? program_id : programId;
    videoId       = (typeof video_id !== 'undefined') ? video_id : videoId;
    ctx.plog('portalInit playerName', playerName);
    ctx.plog('portalInit labelStr', labelStr);
    ctx.plog('portalInit categoryStr', categoryStr);
    ctx.plog('portalInit eventStr', eventStr);
    ctx.plog('portalInit title', title);
    ctx.plog('vjsTimeUpdateLogMax is maximum console.log for portalVjsTimeUpdateCallback' , vjsTimeUpdateLogMax);
    ctx.plog('vjsProgressLogMax   is maximum console.log for portalVjsProgressCallback'   , vjsProgressLogMax);
  };

  // ctx.coreRun in detikVideo.core.js will run ctx.portalRun after player and ima adsManager object has been created
  ctx.portalRun = function(player) {
    ctx.plog('portalRun...', null);
    playerInstance      = player;
    ctx.showPortalVersion();
    ctx.plog('portalRun player', playerInstance);
  };

  // hlsjs Customize Callback-Functions

  ctx.portalHlsjsXhrSetupCallback = function(xhr, url) {
    //ctx.plog('portalHlsjsXhrSetupCallback xhr', xhr);
    //ctx.plog('portalHlsjsXhrSetupCallback url', url);
  };

  // vjs Customize Callback-Functions

  ctx.portalVjsLoadStartCallback = function(player) { 
    ctx.plog('portalVjsLoadStartCallback', null);
  };

  ctx.portalVjsProgressCallback = function(player) { 
    if (vjsProgressLog < vjsProgressLogMax) {
      ctx.plog('portalVjsProgressCallback', vjsProgressLog);
      vjsProgressLog++;
    };
  };

  ctx.portalVjsAbortCallback = function(player) { 
    ctx.plog('portalVjsAbortCallback', null);
  };

  ctx.portalVjsErrorCallback = function(player) { 
    ctx.plog('portalVjsErrorCallback', null);
  };

  ctx.portalVjsEmptiedCallback = function(player) { 
    ctx.plog('portalVjsEmptiedCallback', null);
  };

  ctx.portalVjsStalledCallback = function(player) { 
    ctx.plog('portalVjsStalledCallback', null);
  };

  ctx.portalVjsLoadedMetadataCallback = function(player) {
    // begin Send to GA for Bitrate
    if ($.type(ctx.vars.hlsjsInstance) !== 'object') {
      var current = ctx.vars.hlsjsInstance.currentLevel;
      var level = null;
      var info = '';
      if (current >= 0) {
        level = ctx.vars.hlsjsInstance.levels[current];
      } else {
        level = ctx.vars.hlsjsInstance.levels[0];
      };
      if (($.type(level) !== 'undefined') && ($.type(level) !== 'null')) {
        info = ctx.scriptconf.live ?
          level.bitrate / 1000 + ' kbps' : 
          level.height + 'p';
      };
      ctx.plog('portalVjsLoadedMetadataCallback report as Bitrate info', info);
      dataLayer.push({'playfrom_article' : metaArticleId, 'playfrom_url' : docReferrer, 'event' : eventStr, 'gaEventCategory' : playerName+' '+categoryStr, 'gaEventAction' : 'Bitrate '+info, 'gaEventLabel' : labelStr+'-'+title});
    };
    // end
    ctx.plog('portalVjsLoadedMetadataCallback', null);
  };

  ctx.portalVjsLoadedDataCallback = function(player) { 
    ctx.plog('portalVjsLoadedDataCallback', null);
  };

  ctx.portalVjsCanPlayCallback = function(player) { 
    ctx.plog('portalVjsCanPlayCallback', null);
  };

  ctx.portalVjsCanPlayThroughCallback = function(player) { 
    ctx.plog('portalVjsCanPlayThroughCallback', null);
  };

  ctx.portalVjsPlayingCallback = function(player) { 
    ctx.plog('portalVjsPlayingCallback', null);
  };

  ctx.portalVjsWaitingCallback = function(player) { 
    ctx.plog('portalVjsWaitingCallback', null);
  };

  ctx.portalVjsSeekingCallback = function(player) { 
    ctx.plog('portalVjsSeekingCallback', null);
  };

  ctx.portalVjsSeekedCallback = function(player) { 
    ctx.plog('portalVjsSeekedCallback', null);
  };

  ctx.portalVjsEndedCallback = function(player) { 
    // begin Send to GA for Video Finish
    dataLayer.push({'playfrom_article' : metaArticleId, 'playfrom_url' : docReferrer, 'event' : eventStr, 'gaEventCategory' : playerName+' '+categoryStr, 'gaEventAction' : 'Video Finish', 'gaEventLabel' : labelStr+'-'+title});
    if (labelStr === 'cnbcindonesiacom') {
      dataLayer.push({'event': vk_eventStr, 'videotype': vk_categoryStr, 'videoaction': 'Play Percentage 100%', 'videotitle': title, 'programid': programId, 'videoid': videoId});
    };
    ctx.plog('portalVjsEndedCallback report as Video Finish', null);
    // end
    ctx.plog('portalVjsEndedCallback', null);
  };

  ctx.portalVjsDurationChangedCallback = function(player) { 
    ctx.plog('portalVjsDurationChangedCallback', null);
  };

  ctx.portalVjsTimeUpdateCallback = function(player) {
    // begin Send to GA for Video Play and Video Resume
    var currentTime = player.currentTime(); 
    var floorCurrentTime = Math.floor(currentTime);
    var lengthOfVideo = player.duration();
    if (lastCurrentTime !== floorCurrentTime) {
      //it's time to send to GA
      //ctx.plog('portalVjsTimeUpdateCallback floorCurrentTime sent to GA', null);
      if ((floorCurrentTime === 0) && (isPlaying0Sec === false)) {
        // Send 0 sec
        //dataLayer.push({'playfrom_article' : metaArticleId, 'playfrom_url' : docReferrer, 'event' : eventStr, 'gaEventCategory' : playerName+' '+categoryStr, 'gaEventAction' : '0 seconds', 'gaEventLabel' : labelStr+'-'+title});
        //isPlaying0Sec = true;
        //ctx.plog('portalVjsTimeUpdateCallback report as GA 0 seconds', null);
      };
      if ((floorCurrentTime === 3) && (isPlaying3Sec === false)) {
        // Send 3 sec
        dataLayer.push({'playfrom_article' : metaArticleId, 'playfrom_url' : docReferrer, 'event' : eventStr, 'gaEventCategory' : playerName+' '+categoryStr, 'gaEventAction' : '3 seconds', 'gaEventLabel' : labelStr+'-'+title});
        if (labelStr === 'cnbcindonesiacom') {
          dataLayer.push({'event': vk_eventStr, 'videotype': vk_categoryStr, 'videoaction': '3 Seconds Play', 'videotitle': title, 'programid': programId, 'videoid': videoId});
        };
        isPlaying3Sec = true;
        ctx.plog('portalVjsTimeUpdateCallback report as GA 3 seconds', null);
      };
      if ((floorCurrentTime === 30) && (isPlaying30Sec === false)) {
        // Send 30 sec
        //dataLayer.push({'playfrom_article' : metaArticleId, 'playfrom_url' : docReferrer, 'event' : eventStr, 'gaEventCategory' : playerName+' '+categoryStr, 'gaEventAction' : '30 seconds', 'gaEventLabel' : labelStr+'-'+title});
        if (labelStr === 'cnbcindonesiacom') {
          dataLayer.push({'event': vk_eventStr, 'videotype': vk_categoryStr, 'videoaction': '30 Seconds Play', 'videotitle': title, 'programid': programId, 'videoid': videoId});
        };
        isPlaying30Sec = true;
        ctx.plog('portalVjsTimeUpdateCallback report as GA 30 seconds', null);
      };
      if ( ( floorCurrentTime === Math.floor(lengthOfVideo * (25/100)) ) && (isPlaying25Percent === false) && (ctx.scriptconf.live !== true) ) {
        // Send 25%
        dataLayer.push({'playfrom_article' : metaArticleId, 'playfrom_url' : docReferrer, 'event' : eventStr, 'gaEventCategory' : playerName+' '+categoryStr, 'gaEventAction' : '25% played', 'gaEventLabel' : labelStr+'-'+title});
        if (labelStr === 'cnbcindonesiacom') {
          dataLayer.push({'event': vk_eventStr, 'videotype': vk_categoryStr, 'videoaction': 'Play Percentage 25%', 'videotitle': title, 'programid': programId, 'videoid': videoId});
        };
        isPlaying25Percent = true;
        ctx.plog('portalVjsTimeUpdateCallback report as GA 25 percent', null);
      };
      if ( ( floorCurrentTime === Math.floor(lengthOfVideo * (50/100)) ) && (isPlaying50Percent === false) && (ctx.scriptconf.live !== true) ) {
        // Send 50%
        dataLayer.push({'playfrom_article' : metaArticleId, 'playfrom_url' : docReferrer, 'event' : eventStr, 'gaEventCategory' : playerName+' '+categoryStr, 'gaEventAction' : '50% played', 'gaEventLabel' : labelStr+'-'+title});
        if (labelStr === 'cnbcindonesiacom') {
          dataLayer.push({'event': vk_eventStr, 'videotype': vk_categoryStr, 'videoaction': 'Play Percentage 50%', 'videotitle': title, 'programid': programId, 'videoid': videoId});
        };
        isPlaying50Percent = true;
        ctx.plog('portalVjsTimeUpdateCallback report as GA 50 percent', null);
      };
      if ( ( floorCurrentTime === Math.floor(lengthOfVideo * (75/100)) ) && (isPlaying75Percent === false) && (ctx.scriptconf.live !== true) ) {
        // Send 75%
        dataLayer.push({'playfrom_article' : metaArticleId, 'playfrom_url' : docReferrer, 'event' : eventStr, 'gaEventCategory' : playerName+' '+categoryStr, 'gaEventAction' : '75% played', 'gaEventLabel' : labelStr+'-'+title});
        if (labelStr === 'cnbcindonesiacom') {
          dataLayer.push({'event': vk_eventStr, 'videotype': vk_categoryStr, 'videoaction': 'Play Percentage 75%', 'videotitle': title, 'programid': programId, 'videoid': videoId});
        };
        isPlaying75Percent = true;
        ctx.plog('portalVjsTimeUpdateCallback report as GA 75 percent', null);
      };
      lastCurrentTime = floorCurrentTime;
    };
    //ctx.plog('portalVjsTimeUpdateCallback currentTime', currentTime);
    //ctx.plog('portalVjsTimeUpdateCallback floorCurrentTime', floorCurrentTime); 
    // end
    if (vjsTimeUpdateLog < vjsTimeUpdateLogMax) {
      ctx.plog('portalVjsTimeUpdateCallback', vjsTimeUpdateLog);
      vjsTimeUpdateLog++;
    };
  };

  ctx.portalVjsPlayCallback = function(player) { 
    // begin Send to GA for Video Play and Video Resume
    if (isFirstPlay === false) {
      dataLayer.push({'playfrom_article' : metaArticleId, 'playfrom_url' : docReferrer, 'event' : eventStr, 'gaEventCategory' : playerName+' '+categoryStr, 'gaEventAction' : 'Video Play'    , 'gaEventLabel' : labelStr+'-'+title});
      if (labelStr === 'cnbcindonesiacom') {
        dataLayer.push({'event': vk_eventStr, 'videotype': vk_categoryStr, 'videoaction': 'Play', 'videotitle': title, 'programid': programId, 'videoid': videoId});
      };
      isFirstPlay = true;
      ctx.plog('portalVjsPlayCallback report as Video Play', null);
    } else {
      dataLayer.push({'playfrom_article' : metaArticleId, 'playfrom_url' : docReferrer, 'event' : eventStr, 'gaEventCategory' : playerName+' '+categoryStr, 'gaEventAction' : 'Video Resume'  , 'gaEventLabel' : labelStr+'-'+title});
      if (labelStr === 'cnbcindonesiacom') {
        dataLayer.push({'event': vk_eventStr, 'videotype': vk_categoryStr, 'videoaction': 'Resume', 'videotitle': title, 'programid': programId, 'videoid': videoId});
      };
      ctx.plog('portalVjsPlayCallback report as Video Resume', null);
    };
    // end
    ctx.plog('portalVjsPlayCallback', null);
  };

  ctx.portalVjsPauseCallback = function(player) {
    // begin Send to GA for Video Pause
    dataLayer.push({'playfrom_article' : metaArticleId, 'playfrom_url' : docReferrer, 'event' : eventStr, 'gaEventCategory' : playerName+' '+categoryStr, 'gaEventAction' : 'Video Pause', 'gaEventLabel' : labelStr+'-'+title});
    if (labelStr === 'cnbcindonesiacom') {
      dataLayer.push({'event': vk_eventStr, 'videotype': vk_categoryStr, 'videoaction': 'Pause', 'videotitle': title, 'programid': programId, 'videoid': videoId});
    };
    ctx.plog('portalVjsPauseCallback report as Video Pause', null);
    // end
    ctx.plog('portalVjsPauseCallback', null);
  };

  ctx.portalVjsRateChangeCallback = function(player) { 
    ctx.plog('portalVjsRateChangeCallback', null);
  };

  ctx.portalVjsResizeCallback = function(player) { 
    // begin Send to GA for Video Fullscreen
    var isFullscreen = player.isFullscreen();
    if (isFullscreen === true) {
      dataLayer.push({'playfrom_article' : metaArticleId, 'playfrom_url' : docReferrer, 'event' : eventStr, 'gaEventCategory' : playerName+' '+categoryStr, 'gaEventAction' : 'Video Fullscreen', 'gaEventLabel' : labelStr+'-'+title});
      if (labelStr === 'cnbcindonesiacom') {
        dataLayer.push({'event': vk_eventStr, 'videotype': vk_categoryStr, 'videoaction': 'Full Screen', 'videotitle': title, 'programid': programId, 'videoid': videoId});
      };
      ctx.plog('portalVjsResizeCallback report as Video Fullscreen', null);
    }
    // end
    ctx.plog('portalVjsResizeCallback', null);
  };

  ctx.portalVjsVolumeChangeCallback = function(player) { 
    // begin Send to GA for Video Mute and Volume
    var isMuted = player.muted();
    if (isMuted === true) {
      dataLayer.push({'playfrom_article' : metaArticleId, 'playfrom_url' : docReferrer, 'event' : eventStr, 'gaEventCategory' : playerName+' '+categoryStr, 'gaEventAction' : 'Video Mute',  'gaEventLabel' : labelStr+'-'+title});
      ctx.plog('portalVjsVolumeChangeCallback report as Video Mute', null);
    } else {
      dataLayer.push({'playfrom_article' : metaArticleId, 'playfrom_url' : docReferrer, 'event' : eventStr, 'gaEventCategory' : playerName+' '+categoryStr, 'gaEventAction' : 'Volume',      'gaEventLabel' : labelStr+'-'+title});
      ctx.plog('portalVjsVolumeChangeCallback report as Volume', null);
    };
    // end
    ctx.plog('portalVjsVolumeChangeCallback', null);
  };

  // IMA and Ads Customize Callback-Functions
  
  ctx.portalOnAdsLog = function(data) {
    ctx.plog('portalOnAdsLog', data);
  };

  ctx.portalOnAdsReady = function(data) {
    ctx.plog('portalOnAdsReady', data);
  };

  ctx.portalOnAdsCanceled = function(data) {
    ctx.plog('portalOnAdsCanceled', data);
  };

  ctx.portalOnAdSkip = function(data) {
    ctx.plog('portalOnAdSkip', data);
  };

  ctx.portalOnAdsError = function(data) {
    ctx.plog('portalOnAdsError', data);
  };

  ctx.portalOnAdTimeout = function(data) {
    ctx.plog('portalOnAdTimeout', data);
  };

  ctx.portalOnAdEnded = function(data) {
    ctx.plog('portalOnAdEnded', data);
  };

  ctx.portalOnAdsAdStarted = function(data) {
    ctx.plog('portalOnAdsAdStarted', data);
  };

  ctx.portalOnAdReadyForPostroll = function(data) {
    ctx.plog('portalOnAdReadyForPostroll', data);
  };

  ctx.portalOnAdNoPreroll = function(data) {
    ctx.plog('portalOnAdNoPreroll', data);
  };

  ctx.portalOnAdNoPostroll = function(data) {
    ctx.plog('portalOnAdNoPostroll', data);
  };

  ctx.portalImaAllAdsCompleted = function(event) { 
    ctx.plog('portalImaAllAdsCompleted', event);
  };

  ctx.portalImaClick = function(event) { 
    ctx.plog('portalImaClick', event);
  };

  ctx.portalImaComplete = function(event) { 
    ctx.plog('portalImaComplete', event);
  };

  ctx.portalImaFirstQuartile = function(event) { 
    ctx.plog('portalImaFirstQuartile', event);
  };

  ctx.portalImaLoaded = function(event) { 
    ctx.plog('portalImaLoaded', event);
  };

  ctx.portalImaMidPoint = function(event) { 
    ctx.plog('portalImaMidPoint', event);
  };

  ctx.portalImaPaused = function(event) { 
    ctx.plog('portalImaPaused', event);
  };

  ctx.portalImaResumed = function(event) { 
    ctx.plog('portalImaResumed', event);
  };

  ctx.portalImaStarted = function(event) { 
    ctx.plog('portalImaStarted', event);
  };

  ctx.portalImaThirdQuartile = function(event) { 
    ctx.plog('portalImaThirdQuartile', event);
  };

  // portal Ultimate Functions

  ctx.channelToCategoryEvent = function(channel) {
    var result = {
      category: 'VOD',
      event: '20detik'
    };
    if ($.type(channel) === 'string') {
      if (channel === 'breakingnews') {
        result = {
          category: 'breakingnews',
          event: 'livestreaming'
        };
      } else if (channel === 'livestreaming') {
        result = {
          category: 'livestreaming',
          event: 'livestreaming'
        };
      } else if (channel === 'vod') {
        result = {
          category: 'VOD',
          event: '20detik'
        };
      } else if (channel === 'breakingnews20d') {
        result = {
          category: 'breakingnews 20detik',
          event: 'breakingnews20detik'
        };
      } else if (channel === 'livestreaming20d') {
        result = {
          category: 'livestreaming 20detik',
          event: 'livestreaming20detik'
        };
      } else if (channel === 'cnnvideo') {
        result = {
          category: 'Video CNN',
          event: 'CNNIndonesia'
        };
      } else if (channel === 'cnnlivestreaming') {
        result = {
          category: 'Livestreaming CNN',
          event: 'CNNIndonesiaLivestreaming'
        };
      } else if (channel === 'cnntvlivestreaming') {
        result = {
          category: 'Livestreaming CNNTV',
          event: 'Livestreaming CNNTV'
        };
      } else if (channel === 'cnbcvideo') {
        result = {
          category: 'Video CNBC',
          event: 'CNBCIndonesia',
          vk_category: '',
          vk_event: 'videoondemand'
        };
      } else if (channel === 'cnbclivestreaming') {
        result = {
          category: 'Livestreaming CNBC',
          event: 'CNBCIndonesiaLivestreaming',
          vk_category: 'Livestreaming CNBC',
          vk_event: 'videolivestream'
        };
      } else if (channel === 'cnbctv') {
        result = {
          category: 'CNBC TV',
          event: 'CNBCIndonesiaTV',
          vk_category: 'CNBC TV',
          vk_event: 'videolivestream'
        };
      } else if (channel === 'insertlivevideo') {
        result = {
          category: 'Video Insert Live',
          event: 'insertlivevideo'
        };
      } else if (channel === 'insertlivestreaming') {
        result = {
          category: 'Livestreaming Insert Live',
          event: 'insertlivestreaming'
        };
      } else if (channel === 'livetranstv') {
        result = {
          category: 'livetranstv',
          event: 'livetranstv'
        };
      } else if (channel === 'livetrans7') {
        result = {
          category: 'livetrans7',
          event: 'livetrans7'
        };
      } else {
        result = {
          category: 'VOD',
          event: '20detik'
        };
      };
    };
    ctx.plog('channelToCategoryEvent result is', result);
    return result;
  };

  ctx.label = function() {
    var refUrl = (window.location !== window.parent.location) ? document.referrer : document.location.href;

    var userAgent   = window.navigator.userAgent.toLowerCase(),
        dtkiphone   = /detikcom\/iphone/.test( userAgent ),
        dtkandroid  = /detikcom\/android/.test( userAgent );
      
    var result = 'Others';
    if ($.type(refUrl) === 'string') {
      if ( dtkiphone ) {
        result = 'detikiphone';
      } else if ( dtkandroid ) {
        result = 'detikandroid';
      } else if (refUrl.indexOf('forum.detik') !== -1) {
        result = 'detikforum';
      } else if (refUrl.indexOf('blogdetik') !== -1) {
        result = 'blogdetik';
      } else if (refUrl.indexOf('news.detik') !== -1) {
        result = 'detiknews';
      } else if (refUrl.indexOf('finance.detik') !== -1) {
        result = 'detikfinance';
      } else if (refUrl.indexOf('hot.detik') !== -1) {
        result = 'detikhot';
      } else if (refUrl.indexOf('inet.detik') !== -1) {
        result = 'detikinet';
      } else if (refUrl.indexOf('sport.detik.com/sepakbola') !== -1) {
        result = 'sepakbola';
      } else if (refUrl.indexOf('sport.detik') !== -1) {
        result = 'detiksport';
      } else if (refUrl.indexOf('oto.detik') !== -1) {
        result = 'detikoto';
      } else if (refUrl.indexOf('travel.detik') !== -1) {
        result = 'detiktravel';
      } else if (refUrl.indexOf('food.detik') !== -1) {
        result = 'detikfood';
      } else if (refUrl.indexOf('health.detik') !== -1) {
        result = 'detikhealth';
      } else if (refUrl.indexOf('wolipop.detik') !== -1) {
        result = 'wolipop';
      } else if (refUrl.indexOf('20.detik') !== -1) {
        result = '20detik';
      } else if (refUrl.indexOf('m.detik.com/hot') !== -1) {
        result = 'mdetikhot';
      } else if (refUrl.indexOf('m.detik.com/sport') !== -1) {
        result = 'mdetiksport';
      } else if (refUrl.indexOf('m.detik.com/sepakbola') !== -1) {
        result = 'mdetiksepakbola';
      } else if (refUrl.indexOf('m.detik.com/news') !== -1) {
        result = 'mdetiknews';
      } else if (refUrl.indexOf('m.detik.com/finance') !== -1) {
        result = 'mdetikfinance';
      } else if (refUrl.indexOf('m.detik.com/inet') !== -1) {
        result = 'mdetikinet';
      } else if (refUrl.indexOf('m.detik.com/oto') !== -1) {
        result = 'mdetikoto';
      } else if (refUrl.indexOf('m.detik.com/travel') !== -1) {
        result = 'mdetiktravel';
      } else if (refUrl.indexOf('m.detik.com/food') !== -1) {
        result = 'mdetikfood';
      } else if (refUrl.indexOf('m.detik.com/health') !== -1) {
        result = 'mdetikhealth';
      } else if (refUrl.indexOf('m.detik.com/wolipop') !== -1) {
        result = 'mdetikwolipop';
      } else if (refUrl.indexOf('m.detik.com/20detik') !== -1) {
        result = 'm20detik';      
      } else if (refUrl.indexOf('m.detik') !== -1) {
        result = 'mdetikcom';
      } else if (refUrl.indexOf('detik.com/pialadunia') !== -1) {
        result = 'pialadunia';
      } else if (refUrl.indexOf('www.detik') !== -1) {
        result = 'detikcom';
      } else if (refUrl.indexOf('detik.com') !== -1) {
        result = 'detikcom';
      } else if (refUrl.indexOf('cnnindonesia.com') !== -1) {
        result = 'cnnindonesiacom';
      } else if (refUrl.indexOf('cnbcindonesia.com') !== -1) {
        result = 'cnbcindonesiacom';
      } else if (refUrl.indexOf('insertlive.com') !== -1) {
        result = 'insertlivecom';
      } else {
        result = 'Others';
      };
    };
    ctx.plog('label result is', result);
    return result;
  };



})(detikVideo);
