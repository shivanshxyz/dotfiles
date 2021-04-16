(() => {
  const messageId = 'honey:fetchPayPalMeta';
  let ok = false;
  let paypal = null;

  if (window.paypal && window.paypal.version) {
    ok = true;
    paypal = {
      version: window.paypal.version,
    };
  }

  window.postMessage({ ok, messageId, paypal }, window.location.origin);
})();
