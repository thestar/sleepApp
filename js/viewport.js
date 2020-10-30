(function (doc, win) {
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function () {
            var clientWidth = docEl.clientWidth;
            docEl.style.fontSize = 100 * (clientWidth / 750) + 'px';
        };
    recalc();
    win.addEventListener(resizeEvt, recalc, false);
})(document, window)