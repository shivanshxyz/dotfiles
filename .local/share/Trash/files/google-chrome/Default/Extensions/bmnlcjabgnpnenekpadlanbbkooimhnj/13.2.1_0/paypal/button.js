// Finds the element in which the PayPal Button will
// be cloned
window.payPalButtonContainer = document
.getElementById('honeyContainer').shadowRoot
.getElementById('paypal-button-clone');

// Simulate click on find savings modal to close
// Called after the PayPal modal/window pops up

window.closeHoneyModal = () => document
.getElementById('honeyContainer').shadowRoot
.getElementById('closeButton')
.click();

// Check if paypal object is present on the current page
if (window.paypal
  && window.paypal.Buttons
  && window.paypal.Buttons.instances
  && window.paypal.Buttons.instances.length) {
  // Clones the PayPal Button (SPB) present on the page
  // Only works for the latest version (v5) of PayPal's SPB sdk
  // https://developer.paypal.com/docs/checkout/
  window.paypal.Buttons.instances[0].clone({
    decorate: (props) => {
      return {
        ...props,
        onClick: (...args) => {
          document.getElementById('honeyContainer').shadowRoot.getElementById('paypal-button-clone').click();
          window.closeHoneyModal();
          if (props.onClick) {
            return props.onClick(...args);
          }
          return null;
        },
        style: {
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
        },
      };
    },
  }).render(window.payPalButtonContainer);
}

if (window.paypal
  && window.paypal.Button
  && window.paypal.Button.instances
  && window.paypal.Button.instances.length) {
  // Clones the PayPal Button (SPB) present on the page
  // Only works for the deprecated version (v4) of PayPal's SPB sdk
  // https://developer.paypal.com/docs/archive/checkout/
  window.paypal.Button.instances[0].clone({
    decorate: (props) => {
      return {
        ...props,
        onClick: (...args) => {
          document.getElementById('honeyContainer').shadowRoot.getElementById('paypal-button-clone').click();
          window.closeHoneyModal();
          if (props.onClick) {
            return props.onClick(...args);
          }
          return null;
        },
        style: {
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          size: 'responsive',
          layout: 'vertical',
        },
        funding: {
          allowed: [window.paypal.FUNDING.CREDIT],
          disallowed: Object.values(window.paypal.FUNDING)
            .filter(source => ![
              window.paypal.FUNDING.PAYPAL,
              window.paypal.FUNDING.CREDIT,
            ].includes(source))
        },
      };
    },
  }).render(window.payPalButtonContainer);
}
