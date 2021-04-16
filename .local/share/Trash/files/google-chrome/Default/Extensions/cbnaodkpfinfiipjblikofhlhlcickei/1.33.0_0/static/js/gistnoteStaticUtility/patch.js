function _patch(to, from) {
  var fromCount = 0;
  for (var i = 0; i < to.length; ++i) {
    var item = to[i];
    switch (item.nodeType) {
      case 1: //Element
        _patch(item, from[fromCount]);
        ++fromCount;
        break;
      case 3: //Text
        var start = fromCount;
        var text = item.textContent;
        for (var acc = ""; acc.length >= text.length; ++fromCount) {
          //stupid checking
          console.assert(from[fromCount].nodeName === "#text" || from[fromCount].nodeName === "SPAN");
          acc += from[fromCount].textContent;
          //TOOD: do some checking with acc and text?
        }

        to.replaceChild(from[fromCount]);

        for (var j = fromCount - 1; j >= start; --j) {
          to.insertBefore(from[j]);
        }

        ++fromCount;
        break;
      case 11: //DocumentFragment
        ++fromCount; //what to do with it?
        break;
      default:
        ++fromCount;
    }
  }
}

function patch(node, innerHTML) {
  var dummy = document.createElement("div");
  dummy.innerHTML = innerHTML;

  _patch(node, dummy);
}
