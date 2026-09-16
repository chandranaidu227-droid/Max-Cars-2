"use client";
import {useEffect,useRef,useState} from "react";
import {signOut} from "./supabase-client";

export default function ProfileMenu({name}:{name:string}){
  const [open,setOpen]=useState(false);const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{const close=(event:MouseEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false)};const key=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};addEventListener("mousedown",close);addEventListener("keydown",key);return()=>{removeEventListener("mousedown",close);removeEventListener("keydown",key)}},[]);
  const logout=async()=>{await signOut();localStorage.removeItem("max-avatar");location.replace("/")};
  return <div ref={root} className={`profile-menu ${open?"open":""}`}>
    <button className="profile-trigger" type="button" aria-expanded={open} aria-haspopup="menu" aria-label={`Open ${name}'s profile menu`} onClick={()=>setOpen(value=>!value)}>
      <svg className="profile-mark" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>
      <span className="profile-name">{name}</span>
      <b className="profile-chevron" aria-hidden="true">⌄</b>
    </button>
    <section className="profile-dropdown" role="menu" aria-label="Profile options">
      <a role="menuitem" href="/profile"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>Account</a>
      <button className="profile-logout" role="menuitem" type="button" onClick={logout}><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10"/></svg>Log out</button>
    </section>
  </div>;
}
