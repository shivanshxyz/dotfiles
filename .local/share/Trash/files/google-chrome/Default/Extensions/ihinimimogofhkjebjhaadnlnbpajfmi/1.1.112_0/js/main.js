const topicContainer_DOM = document.querySelector(".topic-container");
const topicContentContainer_DOM = document.querySelector(".topic-content-container");
const topicList_DOM = document.querySelector(".topic-list")
const topicContentList_DOM = document.querySelector(".topic-content-list");



let data = JSON.parse(localStorage.getItem("data")) || dataSource;
let activeTab = localStorage.getItem("activeTab") || ""

// Progress Bar
const progressContainer_DOM = document.querySelector(".progress-container");
function createProgressBars(topicData = data){
    progressContainer_DOM.innerHTML = topicData.map((topic,index) => {     
        return `
            <div>
                <p>${topic.name}</p>
                <progress value="${topic.articleInfo.filter(article => article.isRead === true).length}" max="${topic.articleInfo.length}" class="progress progress-${index + 1}">${topic.name}</progress>
            </div>
        `
    }).join("")
}

// End of Progress Bar
function createTabs(){
    topicList_DOM.innerHTML = "";
    topicList_DOM.innerHTML = data.map(topic => {
        return `
            <li class="topic topic-unselect">
                ${topic.name}
            </li>
        `
    }).join("")
}

function createTopicContentUI(topicContent,topic) {
    return topicContent.map((article,index) => {
        return `
            <li class="topic-content flex" data-id=${index}>
                <span class="checkbox-span">
                   
                    <input type="checkbox" class="content-checkbox" id="content-checkbox-${index}" ${article.isRead ? "checked" : ""}>
                    <label class="checkbox-label" for="content-checkbox-${index}">
                        <div class="tick-mark"></div>
                    </label>
                </span>
                <span class="title-span flex">
                   <a class="title-link flex" target="_blank" href="${article.articleLink}">
                    <h2> ${topic === "Useful Tools!" || topic === "Challenges" ? "" : "Day-"+ (index + 1) }</h2>
                    <p class="content-title">${article.articleTitle}</p>
                   </a>
                </span>
                <span class="content-word-count">
                    ${article.wordCount ? article.wordCount : ""}
                </span>
            </li>
        `
    }).join("")
}

function handleClickOnTopicSelection(event) {
    if(!event.target.closest(".topic")) return;
    const selectedLi = event.target.closest(".topic");
    activeTab = selectedLi.innerText;
    localStorage.setItem("activeTab",activeTab);
    [...document.querySelectorAll(".topic")].forEach(topic => topic.innerText !== activeTab ? topic.classList.remove("topic-selected") : "" );
    selectedLi.classList.add("topic-selected");
    selectedLi.classList.remove("topic-unselect");
    footer_DOM.style.display = "none";
    topicContainer_DOM.classList.add("topic-container-move");
    
    setTimeout(() => {
        topicContentContainer_DOM.classList.add("topic-content-flex");
       
        topicContentList_DOM.innerHTML = "";
        const topicContent = data.find(topic => topic.name === activeTab).articleInfo;
        topicContentList_DOM.innerHTML = createTopicContentUI(topicContent,activeTab);
        progressContainer_DOM.classList.add("progress-move");
        createProgressBars()
    },500)
}

function handleClickOnCheckboxSelection(event){
    let checkbox = event.target.closest(".content-checkbox");
    if(!checkbox) return;
    let selectedArticleId = checkbox.parentElement.parentElement.dataset.id;
    const isRead = data.find(topic => topic.name === activeTab).articleInfo[selectedArticleId].isRead;
    data.find(topic => topic.name === activeTab).articleInfo[selectedArticleId].isRead = !isRead;
    localStorage.setItem("data",JSON.stringify(data));
    createProgressBars()
}


document.body.addEventListener("click",function(e){
    
    handleClickOnTopicSelection(event);
    handleClickOnCheckboxSelection(event);
})

window.addEventListener("load",function(e){
    if(activeTab === "")return;
    // [...document.querySelectorAll(".topic")].forEach(topic => topic.innerText !== activeTab ? topic.classList.remove("topic-selected") : "" );
    [...document.querySelectorAll(".topic")].find(topic => topic.innerText === activeTab ? topic.classList.add("topic-selected") : "" );
    topicContentContainer_DOM.classList.add("topic-content-flex");
    footer_DOM.style.display = "none";
    topicContainer_DOM.classList.add("topic-container-move");   
    topicContentList_DOM.innerHTML = "";
    const topicContent = data.find(topic => topic.name === activeTab).articleInfo;
    topicContentList_DOM.innerHTML = createTopicContentUI(topicContent,activeTab);
    progressContainer_DOM.classList.add("progress-move");
    createProgressBars()
})

createTabs();




