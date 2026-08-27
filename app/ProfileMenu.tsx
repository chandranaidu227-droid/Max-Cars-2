"use client";
import {useEffect,useState} from "react";

export default function ProfileMenu({name}:{name:string}){
  const [avatar,setAvatar]=useState("");
  useEffect(()=>{const timer=window.setTimeout(()=>setAvatar(localStorage.getItem("max-avatar")||""),0);return()=>window.clearTimeout(timer)},[]);
  const initials=name.trim().split(/\s+/).map(part=>part[0]).join("").slice(0,2).toUpperCase()||"MC";
  const logout=()=>{localStorage.removeItem("max-session");localStorage.removeItem("max-avatar");dispatchEvent(new Event("max-state"));location.replace("/")};
  return <div className="profile">
    <a className="profile-direct" href="/profile" aria-label={`Open ${name}'s profile`}>
      <span className="profile-avatar">{avatar?<img src={avatar} alt={`${name} profile`}/>:initials}</span>
      <span className="profile-name">{name}<small>View profile</small></span>
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m9 18 6-6-6-6"/></svg>
    </a>
    <section className="profile-dropdown" aria-label="Account menu">
      <a href="/profile">Account</a>
      <a href="/profile/listings">My listings</a>
      <a href="/favourites">Saved cars</a>
      <button type="button" onClick={logout}>Log out</button>
    </section>
  </div>;
}
