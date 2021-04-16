// https://github.com/snowplow/snowplow/wiki/integrating-javascript-tags-onto-your-website#pageview
(function() {
    'use strict';

    const path = `${chrome.runtime.getURL('').slice(0, -1)}/scripts/lib/snowplow.js`;
    const snowplow = document.createElement('script');

    snowplow.textContent = `;(function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[];
p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments)
};p[i].q=p[i].q||[];n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1;
n.src=w;g.parentNode.insertBefore(n,g)}}(window,document,"script","${path}","snowplow"));
`;

    document.documentElement.appendChild(snowplow);
})();
