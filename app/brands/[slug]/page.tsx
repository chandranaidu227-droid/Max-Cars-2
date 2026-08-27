import {BrandExperience} from "../../Experiences";export default async function Page({params}:{params:Promise<{slug:string}>}){return <BrandExperience slug={(await params).slug}/>}
