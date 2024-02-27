let ul=document.getElementById("leftbottom-main-ul");
let song_name=document.querySelector(".song-name");
let currentSong=new Audio();
let songs;
let currentFolder;

async function getSongs(folder)
{
    // get all the songs from the songs folder
    currentFolder=folder;
    let a=await fetch(`${folder}/`);
    let response=await a.text();
    let div=document.createElement("div");
    div.innerHTML=response;    
    let as=div.getElementsByTagName("a"); 
    songs=[];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Show all the songs in the playlist
    ul.innerHTML=" ";
    for (const song of songs) { 
        let a=await fetch(`${folder}/info.json`);
        let response=await a.json();
        let modifiedsong=song.replaceAll("%20"," ");
        ul.innerHTML=ul.innerHTML + 
    `<li>
        <img src="assets/images/music.svg" alt="music" class="invert">

        <div class="song-info">
            <div class="song-name">
               ${modifiedsong.replaceAll(".mp3"," ")} 
            </div>
            <div class="song-artist">
                ${response.artist}
            </div>
        </div>

        <div class="play-song invert">
            <img src="assets/images/play.svg" alt="play" id="playlisong">
        </div> 
    </li>`;
    }

    //Attached an eventlistener to each song 
    Array.from(document.getElementById("leftbottom-main-ul").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            console.log(e.querySelector(".song-info").firstElementChild.innerHTML);
            playmusic(e.querySelector(".song-info").firstElementChild.innerHTML.trim());
        })
    })

    return songs;
}

const playmusic=(track,pause=false)=>{    
    if(track.endsWith(".mp3")){
        currentSong.src=`/${currentFolder}/`+track;
    }
    else{
        currentSong.src=`/${currentFolder}/`+track+".mp3";
    }
    if(!pause){ 
        currentSong.play();
        play.src="assets/images/paused.svg";
    }
    let displaysong=decodeURI(track);
    displaysong=displaysong.replaceAll(".mp3"," ");
    document.querySelector(".songinfo").innerHTML=displaysong;
    document.querySelector(".song-time").innerHTML="00:00/00:00";
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function displayAlbums(){
    let a=await fetch(`songs/`);
    let response=await a.text();
    let div=document.createElement("div");
    div.innerHTML=response;
    let anchor=div.getElementsByTagName("a");
    let array =Array.from(anchor);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs/"))
        {
            let folder=(e.href.split("/").slice(-1)[0]);
            // Get the metadata of the folder
            let a=await fetch(`songs/${folder}/info.json`);
            let response=await a.json(); 
            let cardcontainer=document.querySelector(".cardContainer");
            // populating the cards dynamically using js
            cardcontainer.innerHTML=cardcontainer.innerHTML+`
            <div data-folder="${folder}" class="card">
                <img  src="/songs/${folder}/cover.jpg" alt="lofi-beats" class="songimg">
                <button class="playbutton">
                    <img src="assets/images/play.svg" alt="play">
                </button>
                <h4>${response.title}</h4>
                <p>
                    ${response.description}
                </p>
            </div>
            ` 
        }
    }
    // Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{        
        e.addEventListener("click",async item=>{
            songs=await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playmusic(songs[0]);
        })

    })
}

async function main(){
    // get the list of all the songs from the "songs folder" into the website
    songs=await getSongs("songs/TeriBaatonMeinAisaUljhaJiya");
    playmusic(songs[0].replaceAll("%20"," "),true);

    // Display all the albums on the page
    displayAlbums();

    // Attach an event listener to previous,play and next button
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src="assets/images/paused.svg";
        }
        else{
            currentSong.pause();
            play.src="assets/images/play.svg"
        }
    })

    // Listen for time update event
    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector(".song-time").innerHTML=
        `${secondsToMinutesSeconds(currentSong.currentTime)}/
        ${secondsToMinutesSeconds(currentSong.duration)}` 
        document.querySelector(".seekbar-circle").style.left=(currentSong.currentTime/currentSong.duration)*100+ "%";    
    })

    // add eventlistener to the seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let songper=(e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".seekbar-circle").style.left=songper+"%";
        currentSong.currentTime=((currentSong.duration)*songper)/100;
    })

    // adding event listener on the hamburger
    document.querySelector(".hamburger").addEventListener("click",e=>{
        document.querySelector(".leftbox").style.left="0%"
        document.querySelector(".remove").style.display="block";
    })

    // adding event listener on the cross button
    document.querySelector(".remove").addEventListener("click",e=>{
        document.querySelector(".leftbox").style.left="-100%";
    })

    // add event listener to previous button
    previous.addEventListener("click",e=>{
        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1)>=0){
            playmusic(songs[index-1]);
        }
    })

    // add event listener to next button
    next.addEventListener("click",e=>{
        // currentSong.pause();
        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index+1)<songs.length){
            playmusic(songs[index+1]);
        }
    })

    // add an event listener to the volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log("Setting Volume to:=",e.target.value);
        currentSong.volume=parseInt(e.target.value)/100;
        if(currentSong.volume>0)
        {
            document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("mute.svg","volume.svg");
        }  
    })
 
    // add eventlistener to mute the track
    document.querySelector(".volume>img").addEventListener("click",e=>{
        // let currentvolume=currentSong.volume;
        console.log(e.target);
        if(e.target.src.includes("volume.svg"))
        {
            e.target.src=e.target.src.replace("volume.svg","mute.svg");
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;

        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg");
            currentSong.volume=.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        } 
    })
}
main();







