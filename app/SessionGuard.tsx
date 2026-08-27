"use client";
import {useEffect} from "react";

const publicPrefixes=[
  "/cars","/car","/explore","/search","/max-3d","/compare","/sell",
  "/sell-your-car","/location","/locations","/dealer","/dealers","/support",
  "/contact","/finance","/insurance","/book-test-drive","/request-quote",
  "/buy-online","/brands","/budget","/offers","/new-cars","/used-cars",
  "/upcoming-cars","/recently-launched","/guides","/login","/signup",
  "/forgot-password",
];

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
