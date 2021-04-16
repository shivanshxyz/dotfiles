var location = window.location;
var href = location.href;
var origin = location.origin;
window.location = href.replace(origin + "/content", "https://web.kamihq.com");
