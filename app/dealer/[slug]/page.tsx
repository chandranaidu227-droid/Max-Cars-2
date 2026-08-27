import {LocationDetailV3} from "../../LocationExperienceV3";export default async function Page({params}:{params:Promise<{slug:string}>}){return <LocationDetailV3 id={(await params).slug}/>}
