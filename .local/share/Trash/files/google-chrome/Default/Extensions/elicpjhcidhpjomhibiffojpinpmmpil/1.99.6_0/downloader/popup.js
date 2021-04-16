var aTxt=['idvideo','idTL','idaddvideo','idsimilar','idVDL','idYT','idYT3','idYT2','idnovideo','idwhy',"idwait1","idwait2","idcc","iddownload","idmb","more"];

var t = {};
for ( var i = 0; i <aTxt.length;i++)
	t[aTxt[i]] = chrome.i18n.getMessage(aTxt[i]);
 
function GetFileExtension( ob)
{
    var ext = ["flv","mp4","3g","wmv","mpg","m4p","m4v","m3u8","webm"];
    for ( var j = 0; j<ext.length;j++)
    {
        if ( ob.mime.indexOf( ext[j])>=0)
        {
            return ext[j];
        }
    }
    
    for ( var j = 0; j<ext.length;j++)
    {
        if ( ob.url & ob.url.toLowerCase().indexOf( ext[j])>=0)
        {
            return ext[j];
        }
    }
    return "flv";
}

function OnUltimate( mode)
{    
	if ( mode != "m3u8")
		chrome.tabs.create({"url": "https://videodownloaderultimate.com/?p=professional","selected":true}, function(tab){});    
	else
		chrome.tabs.create({"url": "https://videodownloaderultimate.com/?p=m3u8","selected":true}, function(tab){});    
}


function OnDownloadVideo( ev)
{
    var i = parseInt(ev.srcElement.id.slice(4));
    if ( i < videoUrls.length)
    {	
        window.close();
        var s = getFilename(videoUrls[i]);
		
        chrome.runtime.sendMessage({ msg: "OnDownloadVideo", url: videoUrls[i].url, filename: s }, function (response)
        {
			if (typeof (response) == 'undefined' && chrome.runtime.lastError)
                return;
        });
    }
}

function OnChromecastVideo( ev)
{
    var i = parseInt(ev.id.slice(7));
    if ( i < videoUrls.length)
    {
        window.close();
        var t = videoUrls[i].title;
        var u = videoUrls[i].url;

        var bp = chrome.extension.getBackgroundPage();
        bp.l64.castPlayer.playURI({ url: u, title: t});
    }
}


function OnPlayVideo( ev)
{
    var i = parseInt(ev.id.slice(7));
    if ( i < videoUrls.length)
    {
        //window.close();
        var t = videoUrls[i].title;
        var u = videoUrls[i].url;
        window.open(u, "_blank", 'resizable=yes, scrollbars=no, titlebar=yes, width=800, height=600');
    }
}

function OnSP24NavigateHome()
{
    var url = window.location.href;
    url = url.replace("downloader/popup.html","startpage/index.html");
    window.close();
	chrome.tabs.create({"url": url,"selected":true}, function(tab){});                
    /*chrome.runtime.sendMessage({ msg: "OnSP24NavHome", url: url }, function (response)
    {
    });
	*/
}
 
function OnSP24NavigateAddToplink()
{
    window.close();	
    chrome.runtime.sendMessage({ msg: "OnSP24AddToplink", tabId: curTabId }, function (response)
    {
		if (typeof (response) == 'undefined' && chrome.runtime.lastError)
                return;
    });    
}

function myEncodeURI(q)
{
    var b="";
    var d=0;
    while(d < q.length)
    {
        var e1 = q.charCodeAt(d);
        d++;
        if ( e1 >=48 && e1 <= 57)
            b+=String.fromCharCode(e1);
        else if ( e1 >=97 && e1 <= 122)
            b+=String.fromCharCode(e1);
        else if ( e1 >=65 && e1 <= 90)
            b+=String.fromCharCode(e1);
        else
        {
            b+='('+e1+')';
        }
    }
    return b;
}

function OnSP24NavigateSimilar()
{
    chrome.tabs.get(curTabId, function(tab)
    {
	    if ( tab)
	    {
            var url = "http://webwebweb.com#mode=1&start=0&search="+myEncodeURI(tab.title);
			chrome.tabs.create({"url": url,"selected":true}, function(tab){});                
            //chrome.runtime.sendMessage({ msg: "OnSP24Navigate", url: url }, function (response) { });
            window.close();
        }
    });
}

//OEmbed request
function OnSP24NavigateAddVideo()
{
    window.close();
    L64Oembed.requestAddVideo(curTabId, false);
}

function OnSP24NavigateAddVideo2() // add and Play
{
    window.close();
    L64Oembed.requestAddVideo(curTabId, true);
} 

function OnSP24NavigateVideo()
{
    var url = window.location.href;
    url = url.replace("downloader/popup.html","startpage/index.html?page=video");
    chrome.tabs.create({"url": url,"selected":true}, function(tab){});                
    window.close();
	
    //chrome.runtime.sendMessage({ msg: "OnSP24Navigate", url: url }, function (response)
    //{
    //});     
}
 
 
function getFilename(d)
{
	
    var s = "";
    for ( var j = 0; j<d.title.length;j++)
    {
        var c = d.title.charAt(j);
        if ( c>='A' && c<='Z')
            s+=c;
        else if ( c>='a' && c<='z')
            s+=c;
        else if ( c>='0' && c<='9')
            s+=c;
        else if ( "- _()".indexOf(c)>=0)
            s+=c;
    }   	
    s+="."+GetFileExtension( d);
    return s;
}

 function getTitleFromUrl( d)
 {
    var fname = d.url;
    var j = fname.indexOf( "?");
    if ( j>=0)
        fname = fname.substr(0,j);
    fname = fname.trim("/ ");
    j = fname.lastIndexOf( "/");
    if ( j>=0)
        fname = fname.substr(j+1);

    fname = fname.replace(/%20/g, " ");
    if ( fname == "videoplayback" || fname.length<4)
    {
        if ( !d.title)
            d.title = "video";
        fname = d.title;
    }   
    fname = fname.trim("\n \t\r<>");
    if ( fname.length > 30)      
        fname = fname.substr(0,27)+"...";
    return fname;
}
 
var curTabId=0;
var videoUrls=0;
var showYoutubeMsg=false;

function hideControl(id)
{
    var o = document.getElementById(id); 
    if ( o)
    o.style.display = "none";   
}

var lastBest = false;
var lastBytes = 0;
function markBestResult(id,bytes)
{	

	var o = document.getElementById(id);
	o.bytes = bytes;
		
	if( bytes && bytes > lastBytes)
	{
		//console.log( id+" - "+bytes);
		if ( lastBest)
			lastBest.style.background = '#fff';
		lastBest = o;
		lastBytes = bytes;		
		lastBest.style.background = '#ddd';		
	}
}


function showVideoUrls( )
{
    var sInner="";
 
    if ( showYoutubeMsg)
        sInner+= "<div class='sep'></div><div class='clYT'>"+t["idYT"]+"</div>";
    
    if ( !videoUrls)
    {
        var o = document.getElementById("idNoVideo");
        if ( o)
        {
            o.innerHTML = t["idnovideo"]+"<a id='idNoVideoLink' style='margin-left:10px' href='#'>"+t["idwhy"]+"</a>";
            
            o.innerHTML += "<div id='sep4'></div>";
            o.style.display="block  ";
            
            var o = document.getElementById("idNoVideoLink");
            o.addEventListener('click', function(e)
            {
                e.stopPropagation();
                var w = 500; 
                var h = 220; 
                var left = (screen.width/2)-(w/2);
                var top = (screen.height/2)-(h/2);
                
                chrome.tabs.get(curTabId, function(tab)
                {
	                if ( tab)
	                {
	                    var url = "./novideo.html?url="+escape(tab.url);
                        window.open( url, "_blank", 'resizable=no, scrollbars=no, titlebar=yes, width='+w+', height='+h+', top='+top+', left='+left);
                        window.close();
                    }
                });
                return true;
            });
        }
    }   
    var fDownloadsAvailable=false;
	var hasM3u = false;
    if ( videoUrls)
    {
        //videoUrls.push(videoUrls[0]);
        for ( var i = 0; i < videoUrls.length; i++)
        {
			
            var ob = videoUrls[i];
			
			if (ob.noDL=="m3u8") 
			{
				if ( hasM3u)
					continue; // only one m3u entry
				else
					hasM3u=true;
					
			}
            var url = ob.url;
            var ext = GetFileExtension( ob);
            if ( !i)
                sInner+= "<div class='sep'></div><div class='clHeader'>"+t["idVDL"]+"</div>";
            else
                sInner+= "<div class='sep2'></div>";
            var color = "#aaa";
            if ( ext == "flv")
                color = "#acf";
            else if ( ext == "mp4" || ext == "m4v")
                color = "#af9";
			else if ( ext == "mp4" || ext == "m4v")
                color = "#af1";
            else if ( ext == "3g")
                color = "#faa";
            else if ( ext == "wmv")
                color = "#aff";
            sInner+= "<div class='clItem' id='idd_item_"+i+"'>";
			
			var s = "style='background-color:"+color+"'";
			var s2 ="";
			if ((ext == "mp4" || ext == "mov" || ext == "webm") && ob.url != "CANNOTPLAY")
			{
				s = "id='idd_pp_"+i+"' style='cursor:pointer;background-color:"+color+"'";
				s2 = "<div style='position:absolute;right:4px;top:4px;z-index:1;'><img height='24px' src='./png/pp.png'/></div>";
			}
            if ( ob.res)
                sInner+= "<div class='clFileExt' "+s+">"+s2+"<div style='position:relative;z-index:2;'>"+ext+" "+ob.res+"</div></div>";
            else 
                sInner+= "<div class='clFileExt2' "+s+">"+s2+"<div style='position:relative;z-index:2;'>"+ext+"</div></div>";
            
            if ((ext == "mp4" || ext == "mov" || ext == "webm") && ob.url != "CANNOTPLAY")
            {
                sInner+= "<div title='"+url+"' class='clDownloadVideo' id='idv_"+i+"' style='width:162px'>"+getFilename(ob)+"</div>"
            }
            else if ( ext == "m3u8")
                sInner+= "<div title='"+url+"' class='clDownloadVideo' id='idv_"+i+"' style='width:192px'>"+t["more"]+"</div>"
			else
                sInner+= "<div title='"+url+"' class='clDownloadVideo' id='idv_"+i+"' style='width:192px'>"+getFilename(ob)+"</div>"
            
			if ((ext == "mp4" || ext == "mov" || ext == "webm") && ob.url != "CANNOTPLAY")
            {
                sInner+= "<div class='clCC' id='idd_cc_"+i+"' ";                
                sInner+= "title='"+t["idcc"]+"'";                
                sInner+= "><img width=19 src='./png/cc.png'/></div>";
            }
            if (ob.noDL=="m3u8") 
                sInner += "<div id='idUltimate2' class='clNODownloadButton'><img width=19 src='./png/no.png'/></div>";
			else if (ob.noDL) 
                sInner += "<div id='idUltimate3' class='clNODownloadButton'><img width=19 src='./png/no.png'/></div>";
			else {
                if (ob.bytes) {
                    var mb = Math.floor(ob.bytes * 100 / 1024 / 1024) / 100;
                    sInner += "<div class='clDownloadButton' id='idd_" + i + "'>"+t["idwait2"]+"</div>";
                    //  sInner+= "<div class='clDownloadButton' id='idd_"+i+"'>Download "+mb+"MB</div>";
                }
                else {                    
                    sInner += "<div class='clDownloadButton' title='"+t["idwait1"]+"' id='idd_" + i + "'>"+t["idwait2"]+"</div>";                    
                }
            }

            
			sInner+= "</div>";
            fDownloadsAvailable=true;
		    
			if ( ob.bytes>0)
			{
				markBestResult("idd_item_"+i, ob.bytes);							
			}
            if ( !ob.bytes && !ob.noDL)
            {				
                var client = new XMLHttpRequest();
                client.idControl = i;
                client.ob = ob;
				
                client.onreadystatechange = function() 
                {					
                    if(this.readyState >= 2) 
                    {                      						
                        var o = document.getElementById("idd_"+this.idControl);
                        if ( o)
                        {
                            var bytes = parseInt(this.getResponseHeader("Content-Length"));
							if ( this.status>=400)
							{
								o.innerHTML = "Forbidden<br/>"+this.status;
								var o = document.getElementById("idd_item_"+this.idControl);
								o.style.display="none";								
								//o.style.opacity=0.4;	
								bytes = 0;
								
							}
							else if ( !bytes)
							{
								bytes = 0;
								o.innerHTML = "Download<br/>? MB";
							}
							else
							{
								if (bytes<1000 && this.ob.len > 1000)
									bytes = this.ob.len
								
								this.ob.bytes = bytes;
								
								var mb = Math.floor(bytes*100/1024/1024)/100;
								o.innerHTML = "Download "+mb+"MB";
								o.title = ""
							}
							if ( bytes > 0)
								markBestResult("idd_item_"+this.idControl, bytes);							
                        }
						  client.abort();
                    }
                }
                client.open("HEAD", url);
                client.send();
            }
        }
    }        
    
    
    var o = document.getElementById("idVideos");
    if ( o)
        o.innerHTML = sInner;
        
    var o = document.getElementById("idAdd");
    if (o)
        o.addEventListener('click', OnSP24NavigateAddVideo2);    
        
    if ( videoUrls)        
    {
        for ( var i = 0; i < videoUrls.length; i++)
        {
            var o = document.getElementById("idd_"+i);
            if (o)
                o.addEventListener('click', OnDownloadVideo);    
            var o = document.getElementById("idd_cc_"+i);
            if (o)
                o.addEventListener('click', function(){OnChromecastVideo(this)});    
			var o = document.getElementById("idd_pp_"+i);
            if (o)
                o.addEventListener('click', function(){OnPlayVideo(this)});    
        }
    }

    var o = document.getElementById("idUltimate");
    if (o)
        o.addEventListener('click', function(){OnUltimate("yt")});
	var o = document.getElementById("idUltimate3");
    if (o)
        o.addEventListener('click', function(){OnUltimate("yt")});
	var o = document.getElementById("idUltimate2");
    if (o)
        o.addEventListener('click', function(){OnUltimate("m3u8")});
}

document.addEventListener('DOMContentLoaded', function ()
{
	SetLanguage();	
	var query = window.location.search.substring(1); 
	if ( query.indexOf("mode=isyoutube") != -1)
	{
		 showYoutubeMsg=true;
		
	}
	 /*
    {	
        chrome.runtime.sendMessage({ msg: "OnYoutubeWarning", fOnce: true }, function (response) { 
			if (typeof (response) == 'undefined' && chrome.runtime.lastError)
                return;
			//alert(JSON.stringify(response));
			OnUltimate( "yt");			
		});
	}*/
    
    hideControl("idTL");  
    hideControl("idSep2");        
	var j = query.indexOf("&tabid=");
	if (  j>=0)
	    curTabId = parseInt(query.slice(j+7));
	
	if ( query.indexOf("canaddvideo=1") < 0)
	{	
        hideControl("idaddvideo"); 
        hideControl("idsimilar"); 
        hideControl("idSep"); 
	}
	else if ( showYoutubeMsg)
	{
		chrome.tabs.get(curTabId, function(tab)
		{
			if ( tab)
			{
				var item = {url: "CANNOTPLAY", noDL:"yt", mime: "mp4", len:0, title:tab.title};				
				 
				videoUrls = [item];
				showVideoUrls();								
			}
		});
	}
 
				
	if ( !showYoutubeMsg)
	{
		chrome.runtime.sendMessage({ msg: "OnSP24GetVideoUrls", tabId: curTabId }, function (response)
		{
			if (typeof (response) == 'undefined' && chrome.runtime.lastError)
					return;			
			videoUrls = response.videoUrls;
			showVideoUrls();
			
		});
	}
    var divs = document.querySelectorAll('div');
   for (var i = 0; i < divs.length; i++) {
    if (divs[i].className == "vdlButton")
    {
        if (divs[i].id == "idaddvideo")
            divs[i].addEventListener('click', OnSP24NavigateAddVideo);  
        else if (divs[i].id == "idsimilar")
            divs[i].addEventListener('click', OnSP24NavigateSimilar);  
    }
    else if (divs[i].className == "ReineckeTL")
        divs[i].addEventListener('click', OnSP24NavigateAddToplink);  
    else if (divs[i].className == "Reinecke24")
    {
        /*if (divs[i].id == "idwebwebweb")
            divs[i].addEventListener('click', OnSP24NavigateWebWebWeb);  
        else */
        if (divs[i].id == "idvideo")
            divs[i].addEventListener('click', OnSP24NavigateVideo);  
        else
            divs[i].addEventListener('click', OnSP24NavigateHome);  
    }
    
  }
});

 
function SetLanguage()
{
    //if ( lang == "de")
    //    t = textDE;
    //chrome.runtime.sendMessage({msg: "GetCurrentSPLanguage"}, function(response) 
    //{
		//alert (response)
		for (var s in t) 
    	{
       		var ob = document.getElementById( s); 
        	if ( ob) 
           	    ob.innerHTML = t[s];
    	}
   // });
}

chrome.runtime.onMessage.addListener(function (details, sender)
{
    if (sender.id != chrome.runtime.id)  // Accept only messages from our extension
        return;

    if ( details.msg == "__L64_NEW_VIDEOLIST")
    {
        if (!videoUrls)
            videoUrls=[];
        for ( var i = 0; i< details.videoUrls.length;i++)
        {
            if ( details.videoUrls[i].rtmp)
            {
                var r = details.videoUrls[i];
                videoUrls.push({url: r.url,site:r.site,rtmp:r.rtmp,mime: "rtmp/mp4", p: 0, len:100000, title:r.title,res:r.q});
            }
            else
            {
                if ( details.videoUrls[i].top)
                    videoUrls.splice(0,0,details.videoUrls[i]);
                else
                    videoUrls.push(details.videoUrls[i]);
            }
        }
        showVideoUrls();
    }
}); 	
