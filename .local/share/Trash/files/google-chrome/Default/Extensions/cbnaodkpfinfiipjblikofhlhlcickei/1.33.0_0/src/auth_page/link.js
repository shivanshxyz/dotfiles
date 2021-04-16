var linkWithGoogle = function () {
  chrome.runtime.sendMessage({
    id: "LOG_EVENT",
    event: "LINK_WITH_GOOGLE_CLICKED",
  });
  chrome.runtime.sendMessage({
    id: "LINK_WITH_GOOGLE_ACCOUNT",
  });
};

var linkWithFacebook = function () {
  chrome.runtime.sendMessage({
    id: "LOG_EVENT",
    event: "LINK_WITH_FACEBOOK_CLICKED",
  });
  chrome.runtime.sendMessage({
    id: "LINK_WITH_FACEBOOK_ACCOUNT",
  });
};

var loading = function () {
  document.getElementById("loading-div").style.display = "block";
  document.getElementById("main-div").style.display = "none";
};

var showSignupForm = function () {
  document.getElementById("email-signup-form").style.display = "block";
  document.getElementById("email-signup-prompt").style.display = "none";
};

var hideSignupForm = function () {
  document.getElementById("email-signup-form").style.display = "none";
  document.getElementById("email-signup-prompt").style.display = "block";
};

var submitForm = function () {
  chrome.runtime.sendMessage({
    id: "LOG_EVENT",
    event: "LINK_WITH_EMAIL_CLICKED",
  });
  loading();
  chrome.runtime.sendMessage({
    id: "LINK_WITH_EMAIL_ACCOUNT",
    payload: {
      displayName:
        document.getElementById("first-name-input").value + " " + document.getElementById("last-name-input").value,
      email: document.getElementById("email-input").value,
      password: document.getElementById("password-input").value,
    },
  });
  setTimeout(function () {
    location.reload();
  }, 1000);
};

hideSignupForm();

document.getElementById("google-btn").addEventListener("click", linkWithGoogle);
document.getElementById("facebook-btn").addEventListener("click", linkWithFacebook);
document.getElementById("email-signup-link").addEventListener("click", showSignupForm);
document.getElementById("signup-form-submit").addEventListener("click", submitForm);

chrome.runtime.sendMessage({
  id: "LOG_EVENT",
  event: "VISIT_LINK_ACCOUNT_PAGE",
});
