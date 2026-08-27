import {LocationDetailV3} from "../../LocationExperienceV3";export default async function Page({params}:{params:Promise<{id:string}>}){return <LocationDetailV3 id={(await params).id}/>} 
