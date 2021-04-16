const toggler_DOM = document.querySelector(".toggler");
const textTags = document.querySelectorAll(".text");
// const noteBefore_DOM = document.querySelector(".note-anchor");
const lightAnchors = document.querySelectorAll(".light-anchor")
const paraText_DOM = document.querySelector(".para-text");
const footerAnchors_DOM = document.querySelectorAll(".footer-anchor");
const footer_DOM = document.querySelector(".footer");

toggler.addEventListener("click",function(event){
    document.body.classList.toggle("dark");
    textTags.forEach(tag => tag.classList.toggle("text-white"));
    lightAnchors.forEach(anchor => anchor.classList.toggle("off-blue"));
    footerAnchors_DOM.forEach(anchor  => anchor.classList.toggle("off-blue") )
    // noteBefore_DOM.classList.toggle("off-blue");
    paraText_DOM.classList.toggle("text-white");
    footer_DOM.classList.toggle("text-white");

})