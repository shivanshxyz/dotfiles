!function(n){function t(i){if(e[i])return e[i].exports;var o=e[i]={i:i,l:!1,exports:{}};return n[i].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var e={};t.m=n,t.c=e,t.i=function(n){return n},t.d=function(n,e,i){t.o(n,e)||Object.defineProperty(n,e,{configurable:!1,enumerable:!0,get:i})},t.n=function(n){var e=n&&n.__esModule?function(){return n.default}:function(){return n};return t.d(e,"a",e),e},t.o=function(n,t){return Object.prototype.hasOwnProperty.call(n,t)},t.p="",t(t.s=411)}({411:function(n,t,e){"use strict";function i(n){n.style.display="block",n.style.animation="fadeIn 0.5s",s(n,500)}function o(n){n.style.display="block",n.style.animation="fadeIn 1s",s(n,1e3)}function a(n){n.style.display="none",n.style.animation="fadeOut 1s",s(n,1e3)}function s(n,t){window.setTimeout(function(){n.style.animation=null},t)}function d(){var n=c.contentWindow,t=window.parent;window.addEventListener("message",function(e){var o=e.origin,a=o===r,s=a?t:n;if(!a){var d=e.data.piqContentEvent;d&&"aside.toggled"===d.name&&d.data.visible&&i(c)}s.postMessage(e.data,"*")})}var r={PERSISTIQ_ROOT:"https://persistiq.com",REMOTE_CODE_ROOT:"https://persistiq.com",WEBPACK_MANIFEST_URL:"https://persistiq.com/webpack_manifest",BUGSNAG_API_KEY:"6c43f04d9fe4e189ecbde53121b9dadf",SEGMENTIO_API_KEY:"sh70tnuued"}.PERSISTIQ_ROOT,c=void 0,u=void 0;window.onload=function(){c=window.document.getElementById("piq-aside"),u=window.document.getElementById("loading"),a(c),c.src=r+"/aside",c.onload=function(){a(u),o(c)},d()}}});