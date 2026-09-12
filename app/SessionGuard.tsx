"use client";
import {useEffect} from "react";

const publicPrefixes=["/login","/signup","/forgot-password"];

export default function SessionGuard({children}:{children:React.ReactNode}){
  useEffect(()=>{
    const path=location.pathname;
    const isPublic=path==="/"||publicPrefixes.some(prefix=>path===prefix||path.startsWith(`${prefix}/`));
    if(!isPublic&&!localStorage.getItem("max-session")){
      const wanted=path+location.search;
      localStorage.setItem("max-return",wanted);
      location.replace(`/login?returnTo=${encodeURIComponent(wanted)}&reason=protected`);
    }
  },[]);
  return children;
}
