"use client";

import {useCallback,useEffect,useRef,useState} from "react";

export default function SellHeroMedia(){
  const videoRef=useRef<HTMLVideoElement>(null);
  const [ready,setReady]=useState(false);
  const [playing,setPlaying]=useState(false);
  const [muted,setMuted]=useState(true);
  const [blocked,setBlocked]=useState(false);
  const [failed,setFailed]=useState(false);

  const attemptPlay=useCallback(async()=>{
    const video=videoRef.current;
    if(!video)return;
    video.defaultMuted=true;
    video.muted=true;
    setMuted(true);
    try{await video.play();setPlaying(true);setBlocked(false);setFailed(false)}
    catch{setPlaying(false);setBlocked(true)}
  },[]);

  useEffect(()=>{void attemptPlay()},[attemptPlay]);
  useEffect(()=>{
    const video=videoRef.current;
    if(!video||!("IntersectionObserver" in window))return;
    const observer=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting){void attemptPlay()}else{video.pause();setPlaying(false)}
    },{threshold:.18});
    observer.observe(video);
    return()=>observer.disconnect();
  },[attemptPlay]);

  const togglePlayback=async()=>{const video=videoRef.current;if(!video)return;if(video.paused)await attemptPlay();else{video.pause();setPlaying(false)}};
  const toggleMute=()=>{const video=videoRef.current;if(!video)return;video.muted=!video.muted;setMuted(video.muted)};
  const retry=()=>{const video=videoRef.current;if(!video)return;setFailed(false);setBlocked(false);setReady(false);video.load();void attemptPlay()};

  return <figure className="sell-hero-media">
    <video ref={videoRef} autoPlay muted loop playsInline preload="metadata" poster="/max-cars-sell-inspection-v2-poster.jpg" aria-label="Professional mechanic inspecting a real vehicle engine" onLoadedMetadata={attemptPlay} onCanPlay={()=>{setReady(true);void attemptPlay()}} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>{setReady(false);setFailed(true)}}>
      <source src="/max-cars-sell-inspection-v2.mp4" type="video/mp4"/>
      Your browser does not support HTML5 video.
    </video>
    {!ready&&!failed&&<span className="sell-media-loading" role="status"><i/>Loading inspection film</span>}
    {(blocked||failed)&&<div className="sell-media-recovery" role="alert"><strong>{failed?"Inspection film unavailable":"Autoplay was blocked"}</strong><button type="button" onClick={failed?retry:attemptPlay}>{failed?"Retry video":"Play video"}</button></div>}
    <div className="sell-media-controls" aria-label="Video controls"><button type="button" onClick={togglePlayback} aria-label={playing?"Pause inspection video":"Play inspection video"}>{playing?"Ⅱ":"▶"}</button><button type="button" onClick={toggleMute} aria-label={muted?"Unmute inspection video":"Mute inspection video"}>{muted?"Muted":"Sound on"}</button></div>
    <figcaption>Real vehicle inspection · Pexels / Artem Podrez</figcaption>
  </figure>
}
