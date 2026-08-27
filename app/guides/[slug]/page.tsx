import {GuidesExperience} from "../../Experiences";export default async function Page({params}:{params:Promise<{slug:string}>}){return <GuidesExperience slug={(await params).slug}/>}
