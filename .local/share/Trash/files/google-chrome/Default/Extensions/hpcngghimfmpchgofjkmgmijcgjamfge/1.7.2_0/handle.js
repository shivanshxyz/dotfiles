
//we have to emulate WindiwCommandIssuer, so let's store id counter in case this iframe becomes ever-green
var currentCommandId = 0;

document.body.addEventListener('click', function maximize () {
  currentCommandId += 1;
  window.parent.postMessage({
    piqCommand: {
      id: currentCommandId,
      name: 'maximize',
      data: undefined
    }
  }, '*');
});
