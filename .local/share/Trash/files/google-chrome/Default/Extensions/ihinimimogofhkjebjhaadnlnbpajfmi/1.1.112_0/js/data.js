// You js goes here
const dataSource = [
    {
        name: "HTML & CSS",
        articleCount: 20,
        articleInfo: [
            {
                articleTitle: "Intro to HTML & CSS",
                articleLink: "https://www.youtube.com/watch?v=OZeoiotzPFg",
                isRead: false,
                wordCount: "30m"
            },
            {
                articleTitle: "HTML Project",
                articleLink: "https://youtu.be/PlxWf493en4",
                isRead: false,
                wordCount: "1h"
            },
            {
                articleTitle: "Linking HTML & CSS Files",
                articleLink: "https://youtu.be/YNSnugnQYiI",
                isRead: false,
                wordCount: "30m"
            },
            {
                articleTitle: "CSS Resets",
                articleLink: "https://youtu.be/A9U6DEbJrxw",
                isRead: false,
                wordCount: "30m"
            },
            {
                articleTitle: "CSS Box Model",
                articleLink: "https://youtu.be/rIO5326FgPE",
                isRead: false,
                wordCount: "15m"
            },
            {
                articleTitle: "CSS Floats",
                articleLink: "https://css-tricks.com/all-about-floats/",
                isRead: false,
                wordCount: "15m"
            },
            {
                articleTitle: "CSS Positioning",
                articleLink: "https://www.freecodecamp.org/news/how-to-use-the-position-property-in-css-to-align-elements-d8f49c403a26/",
                isRead: false,
                wordCount: "15m"
            },
            {
                articleTitle: "CSS Typography",
                articleLink: "https://cssreference.io/typography/",
                isRead: false,
                wordCount: "25m"
            },
            {
                articleTitle: "CSS Flexbox",
                articleLink: "https://flexboxfroggy.com/",
                isRead: false,
                wordCount: "45m"
            },
            {
                articleTitle: "Revisiting CSS",
                articleLink: "http://learnlayout.com/no-layout.html",
                isRead: false,
                wordCount: "30m"
            },
            {
                articleTitle: "Complex CSS Backgrounds",
                articleLink: "https://youtu.be/muE2B0Zylbw",
                isRead: false,
                wordCount: "30m"
            },
            {
                articleTitle: "CSS Pseudo Elements",
                articleLink: "https://youtu.be/W-YHT9xHBgA",
                isRead: false,
                wordCount: "45m"
            },
            {
                articleTitle: "CSS 'rem' and 'em' units",
                articleLink: "https://youtu.be/H4UtKu11yXg",
                isRead: false,
                wordCount: "30m"
            },
            {
                articleTitle: "CSS Responsive Design",
                articleLink: "https://youtu.be/fgOO9YUFlGI",
                isRead: false,
                wordCount: "30m"
            },
            {
                articleTitle: "CSS Hamburger Menu",
                articleLink: "https://youtu.be/H4MkGzoACpQ",
                isRead: false,
                wordCount: "45m"
            },
            {
                articleTitle: "Flexbox Project",
                articleLink: "https://youtu.be/ZeDP-rzOnAA",
                isRead: false,
                wordCount: "1h"
            },
            {
                articleTitle: "CSS Grid",
                articleLink: "https://youtu.be/jV8B24rSN5o",
                isRead: false,
                wordCount: "1h"
            },
            {
                articleTitle: "Grid Project",
                articleLink: "https://youtu.be/M3qBpPw77qo",
                isRead: false,
                wordCount: "1h"
            },
            {
                articleTitle: "CSS Animations",
                articleLink: "https://thoughtbot.com/blog/transitions-and-transforms",
                isRead: false,
                wordCount: "30m"
            },
            {
                articleTitle: "Final Project!",
                articleLink: "https://youtu.be/zyNhxN6sToM",
                isRead: false,
                wordCount: "3h"
            },
        ]
    },
    {
        name: "Javascript",
        articleCount: 30,
        articleInfo: [
            {
                articleTitle: "Play Around With JS!!",
                articleLink: "http://jsforcats.com/",
                isRead: false,
                wordCount: "2h"
            },
            {
                articleTitle: "JS Fundamentals (Till Ch.9)",
                articleLink: "https://javascript.info/first-steps",
                isRead: false,
                wordCount: "2h"
            },
            {
                articleTitle: "JS Fundamentals (Ch.9 - Till End)",
                articleLink: "https://javascript.info/first-steps",
                isRead: false,
                wordCount: "2h"
            },
            {
                articleTitle: "JS Objects (Only Ch.1)",
                articleLink: "https://javascript.info/object-basics",
                isRead: false,
                wordCount: "2h"
            },
            {
                articleTitle: "JS Copy vs Reference",
                articleLink: "https://youtu.be/YnfwDQ5XYF4?list=PLu8EoSxDXHP6CGK4YVJhL_VWetA865GOH",
                isRead: false,
                wordCount: "1h"
            },
            {
                articleTitle: "JS Data Types (Till Ch.6)",
                articleLink: "https://javascript.info/data-types",
                isRead: false,
                wordCount: "2h"
            },
            {
                articleTitle: "JS Array Cardio 1",
                articleLink: "https://youtu.be/HB1ZC7czKRs",
                isRead: false,
                wordCount: "1h"
            },
            {
                articleTitle: "CodeWars(Katas 1 to 4)",
                articleLink: "https://github.com/myjinxin2015/Katas-list-of-Training-JS-series",
                isRead: false,
                wordCount: "2h"
            },
            {
                articleTitle: "JS Array Cardio 2",
                articleLink: "https://youtu.be/QNmRfyNg1lw",
                isRead: false,
                wordCount: "3h"
            },
            {
                articleTitle: "CodeWars(Katas 5 to 8)",
                articleLink: "https://github.com/myjinxin2015/Katas-list-of-Training-JS-series",
                isRead: false,
                wordCount: "2h"
            },
            {
                articleTitle: "JS Array Cardio 3",
                articleLink: "https://youtu.be/SadWPo2KZWg",
                isRead: false,
                wordCount: "1h"
            },
            {
                articleTitle: "CodeWars(Katas 9 to 12)",
                articleLink: "https://github.com/myjinxin2015/Katas-list-of-Training-JS-series",
                isRead: false,
                wordCount: "2h"
            },
            {
                articleTitle: "Chome Dev Tools",
                articleLink: "https://youtu.be/xkzDaKwinA8?list=PLu8EoSxDXHP6CGK4YVJhL_VWetA865GOH",
                isRead: false,
                wordCount: "1h"
            },
            {
                articleTitle: "CodeWars(Katas 13 to 16)",
                articleLink: "https://github.com/myjinxin2015/Katas-list-of-Training-JS-series",
                isRead: false,
                wordCount: "2h"
            },
            {
                articleTitle: "CodeWars(Katas 17 to 22)",
                articleLink: "https://github.com/myjinxin2015/Katas-list-of-Training-JS-series",
                isRead: false,
                wordCount: "2h"
            },
            {
                articleTitle: "CodeWars(Katas 23 to 28)",
                articleLink: "https://github.com/myjinxin2015/Katas-list-of-Training-JS-series",
                isRead: false,
                wordCount: "2h"
            },
            {
                articleTitle: "CodeWars(Katas 29 to 36)",
                articleLink: "https://github.com/myjinxin2015/Katas-list-of-Training-JS-series",
                isRead: false,
                wordCount: "3h"
            },
            {
                articleTitle: "JS DOM Part 1",
                articleLink: "https://youtu.be/0ik6X4DJKCc",
                isRead: false,
                wordCount: "2h"
            },
            {
                articleTitle: "JS DOM Part 2",
                articleLink: "https://youtu.be/mPd2aJXCZ2g",
                isRead: false,
                wordCount: "2h"
            },
            {
                articleTitle: "JS DOM Part 3",
                articleLink: "https://youtu.be/wK2cBMcDTss",
                isRead: false,
                wordCount: "2h"
            },
            {
                articleTitle: "JS DOM Project",
                articleLink: "https://youtu.be/i37KVt_IcXw",
                isRead: false,
                wordCount: "2h"
            },
            {
                articleTitle: "JS Local Storage Project",
                articleLink: "https://youtu.be/YL1F4dCUlLc",
                isRead: false,
                wordCount: "1h"
            },
            {
                articleTitle: "JS Calculator Project",
                articleLink: "https://youtu.be/j59qQ7YWLxw",
                isRead: false,
                wordCount: "1h"
            },
            {
                articleTitle: "JS DrumKit Project",
                articleLink: "https://youtu.be/VuN8qwZoego?list=PLu8EoSxDXHP6CGK4YVJhL_VWetA865GOH",
                isRead: false,
                wordCount: "1h"
            },
            {
                articleTitle: "JS Follow Along Links",
                articleLink: "https://youtu.be/POP_qri7RA8?list=PLu8EoSxDXHP6CGK4YVJhL_VWetA865GOH",
                isRead: false,
                wordCount: "45m"
            },
            {
                articleTitle: "JS Stripe Project",
                articleLink: "https://youtu.be/GvuWJSXYQDU?list=PLu8EoSxDXHP6CGK4YVJhL_VWetA865GOH",
                isRead: false,
                wordCount: "1h"
            },
            {
                articleTitle: "JS Speech Recognition Project",
                articleLink: "https://youtu.be/0mJC0A72Fnw?list=PLu8EoSxDXHP6CGK4YVJhL_VWetA865GOH",
                isRead: false,
                wordCount: "1h"
            },
            {
                articleTitle: "JS Pagination",
                articleLink: "https://www.youtube.com/watch?v=IqYiVHrO2U8&t=12s",
                isRead: false,
                wordCount: "1h"
            },
            {
                articleTitle: "JS Final Project Part 1",
                articleLink: "https://youtu.be/IhmSidOJSeE",
                isRead: false,
                wordCount: "2h"
            },
            {
                articleTitle: "JS Final Project Part 2",
                articleLink: "https://youtu.be/W7FaYfuwu70",
                isRead: false,
                wordCount: "1h30m"
            }
        ]
    },
    {
        name: "Useful Tools!",
        articleCount: 20,
        articleInfo: [
            {
                articleTitle: "Color Palette",
                articleLink: "https://materialuicolors.co/",
                isRead: false,
            },
            {
                articleTitle: "Generate Masonry Tiles",
                articleLink: "https://w3bits.com/tools/masonry-generator/",
                isRead: false,
            },
            {
                articleTitle: "Clip Path Maker",
                articleLink: "https://bennettfeely.com/clippy/",
                isRead: false,
            },
            {
                articleTitle: "Flexbox CheatSheet",
                articleLink: "https://darekkay.com/dev/flexbox-cheatsheet.html",
                isRead: false,
            },
            {
                articleTitle: "CSS Visual Guide",
                articleLink: "https://cssreference.io/",
                isRead: false,
            },
            {
                articleTitle: "Flexbox Templates",
                articleLink: "https://www.flexboxpatterns.com/mosaic",
                isRead: false,
            },
            {
                articleTitle: "CSS Grid Visual Guide",
                articleLink: "https://learncssgrid.com/",
                isRead: false,
            },
            {
                articleTitle: "Useful Hover Effects",
                articleLink: "https://codepen.io/IanLunn/pen/hysxc",
                isRead: false,
            },
            {
                articleTitle: "Image Hover effects",
                articleLink: "https://codepen.io/kw7oe/pen/mPeepv",
                isRead: false,
            },
            {
                articleTitle: "Neomorphic buttons",
                articleLink: "https://neumorphism.io/#55b9f3",
                isRead: false,
            },
            {
                articleTitle: "Play with Flex",
                articleLink: "https://codepen.io/enxaneta/pen/adLPwv",
                isRead: false,
            },
            {
                articleTitle: "HTML Tag Generator",
                articleLink: "https://html-css-js.com/html/generator/",
                isRead: false,
            },
            {
                articleTitle: "SVG Wave Generator",
                articleLink: "https://getwaves.io/",
                isRead: false,
            },
            {
                articleTitle: "SVG Background Generator",
                articleLink: "https://www.svgbackgrounds.com/#subtle-prism",
                isRead: false,
            },
            {
                articleTitle: "Javascript Array Explorer",
                articleLink: "https://sdras.github.io/array-explorer/",
                isRead: false,
            },
            {
                articleTitle: "Call Backs Explained",
                articleLink: "https://codeburst.io/javascript-what-the-heck-is-a-callback-aba4da2deced",
                isRead: false,
            },
            {
                articleTitle: "Explanation of Array Methods",
                articleLink: "https://medium.com/@timhancodes/javascript-array-methods-cheatsheet-633f761ac250",
                isRead: false,
            },
            {
                articleTitle: "Simplified JS Concepts",
                articleLink: "https://alligator.io/js/",
                isRead: false,
            },
            {
                articleTitle: "Vanilla JS References",
                articleLink: "https://vanillajstoolkit.com/",
                isRead: false,
            },
            {
                articleTitle: "Memorise JS Syntax",
                articleLink: "https://javascript.pythoncheatsheet.org/#Data-types",
                isRead: false,
            },
            {
                articleTitle: "Pre-made tools",
                articleLink: "https://plainjs.com/",
                isRead: false,
            },
            {
                articleTitle: "JS Mini Projects",
                articleLink: "https://jsbeginners.com/javascript-projects-for-beginners/",
                isRead: false,
            },
            {
                articleTitle: "JS Code Analysis Tool",
                articleLink: "https://jshint.com/",
                isRead: false,
            },
            {
                articleTitle: "JS Array CheatSheet",
                articleLink: "https://gist.github.com/ourmaninamsterdam/1be9a5590c9cf4a0ab42",
                isRead: false,
            },
            {
                articleTitle: "Keycode Values",
                articleLink: "https://keycode.info/",
                isRead: false,
            },
            {
                articleTitle: "Icons Library",
                articleLink: "https://fontawesome.com/",
                isRead: false,
            },
            {
                articleTitle: "Can I Use Javascript Feature",
                articleLink: "https://caniuse.com/",
                isRead: false,
            },
            {
                articleTitle: "Check Javascript Method Mutation",
                articleLink: "https://doesitmutate.xyz/",
                isRead: false,
            },  
        ]
    },
    {
        name:"Challenges",
        articleCount:8,
        articleInfo:[
            {
                articleTitle: "Front-End Challenges Club",
                articleLink: "https://piccalil.li/category/front-end%20challenges%20club/",
                isRead: false,
            },
            {
                articleTitle: "Ace Front End",
                articleLink: "https://www.acefrontend.com/challenges/dropdown",
                isRead: false,
            },
            {
                articleTitle: "101 Computing",
                articleLink: "https://www.101computing.net/html-css-javascript-challenges/",
                isRead: false,
            },
            {
                articleTitle: "Le Wagon Challenges",
                articleLink: "https://github.com/lewagon/html-css-challenges",
                isRead: false,
            },
            {
                articleTitle: "HackerEarth",
                articleLink: "https://www.hackerearth.com/challenges/competitive/frontend-practice-challenge/",
                isRead: false,
            },
            {
                articleTitle: "100 Days CSS",
                articleLink: "https://100dayscss.com/",
                isRead: false,
            },
            {
                articleTitle: "Daily UI",
                articleLink: "https://www.dailyui.co/",
                isRead: false,
            }
        ]

    }
]