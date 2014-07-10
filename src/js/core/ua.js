/**
 * @file SQ.ua
 * 获取设备 ua 信息，判断系统版本、浏览器名称及版本
 * @version 1.0.0
 */
/*global SQ*/
SQ.ua = (function () {
    'use strict';
    var info = {};
    var ua = navigator.userAgent;
    var m;

    info.os = {};
    info.browser = {};

    /**
     * operating system. android, ios, linux, windows
     * @type string
     */
    if ((/Android/i).test(ua)) {
        info.os.name = 'android';
        info.os.version = ua.match(/(Android)\s([\d.]+)/)[2];
    } else if ((/Adr/i).test(ua)) {
        // UC 浏览器极速模式下，Android 系统的 UA 为 'Adr'
        info.os.name = 'android';
        info.os.version = ua.match(/(Adr)\s([\d.]+)/)[2];
    } else if ((/iPod/i).test(ua)) {
        info.os.name = 'ios';
        info.os.version = ua.match(/OS\s([\d_]+)/)[1].replace(/_/g, '.');
        info.device = 'ipod';
    } else if ((/iPhone/i).test(ua)) {
        info.os.name = 'ios';
        info.os.version = ua.match(/(iPhone\sOS)\s([\d_]+)/)[2].replace(/_/g, '.');
        info.device = 'iphone';
    } else if ((/iPad/i).test(ua)) {
        info.os.name = 'ios';
        info.os.version = ua.match(/OS\s([\d_]+)/)[1].replace(/_/g, '.');
        info.device = 'ipad';
    }

    // 浏览器判断
    m = ua.match(/AppleWebKit\/([\d.]*)/);
    if (m && m[1]) {
        info.browser.core = 'webkit';
        info.browser.version = m[1];

        if ((/Chrome/i).test(ua)) {
            info.browser.shell = 'chrome';
        } else if ((/Safari/i).test(ua)) {
            info.browser.shell = 'safari';
        } else if ((/Opera/i).test(ua)) {
            info.browser.shell = 'opera';
        }
    }

    if ((/UCBrowser/i).test(ua)) {
        // UCWeb 9.0 UA 信息中包含 UCBrowser 字段
        m = ua.match(/(UCBrowser)\/([\d.]+)/);
        info.browser.shell = 'ucweb';
        info.browser.version = m[2];
    } else if ((/UCWEB/i).test(ua)) {
        // UCWeb 7.9 UA 信息中包含 UCWEB 字段
        m = ua.match(/(UCWEB)([\d.]+)/);
        info.browser.shell = 'ucweb';
        info.browser.version = m[2];
    } else if ((/UC/i).test(ua)) {
        // UCWeb 8.x UA 信息中包含 UC 字段
        // 确认 8.6、8.7 
        info.browser.shell = 'ucweb';
        info.browser.version = '8.x';
    }

    if (info.browser.shell === 'ucweb') {
        // UC 浏览器急速模式
        // 目前只有 Android 平台国内版 UCWeb 9.0 可以判断是否为急速模式，UA 中包含 UCWEB/2.0 字段即为急速模式。
        if ((/UCWEB\/2\.0/i).test(ua)) {
            info.browser.module = 'swift';
        }
    }

    if (info.browser.version) {
        info.browser.version = parseFloat(info.browser.version, 10);
    }

    return info;
}());