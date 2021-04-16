/* El código a continuación es propiedad intelectual de The Mail Track Company S.L. de Barcelona y es secreto industrial.

The code hereafter is the intellectual property of The Mail Track Company S.L. of Barcelona, Spain and is a Trade Secret. */
(function() {
    'use strict';

    var iframe = document.getElementById('iframe');
    var loaded = false;
    var postClose = function() {
        window.parent.postMessage(
            {
                // Forward message
                action: 'close',
            },
            '*'
        );
    };
    /**
     * Maximum 3 seconds wait so popup can appear in context.
     */
    var iframeError = setTimeout(postClose, 10000);

    /**
     * Listens to messages sent from s3 src page.
     */
    window.addEventListener(
        'message',
        function receiveMessage(event) {
            if (/mailtrack\.(me|io)$/.test(event.origin)) {
                if (event.data.action === 'loaded') {
                    loaded = true;
                }

                window.parent.postMessage(
                    {
                        action: event.data.action,
                        size: event.data.size,
                    },
                    '*'
                );
            }
        },
        false
    );

    iframe.src = decodeURIComponent(
        window.location.search.replace('?url=', '') + window.location.hash
    );

    iframe.addEventListener(
        'error',
        function() {
            clearTimeout(iframeError);
            postClose();
        },
        false
    );

    iframe.addEventListener(
        'load',
        function() {
            clearTimeout(iframeError);

            if (!loaded) {
                postClose();
            } else {
                iframe.style.display = 'block';
            }
        },
        false
    );
})();
