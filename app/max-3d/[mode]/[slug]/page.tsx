import {notFound} from "next/navigation";
import {Max3DWorkspace} from "../../../Max3DExperience";
const modes=["configurator","exterior","interior","xray","lighting","aerodynamics","sound","ar","vr"] as const;
export default async function Page({params}:{params:Promise<{mode:string;slug:string}>}){const {mode,slug}=await params;if(!modes.includes(mode as typeof modes[number]))notFound();return <Max3DWorkspace mode={mode as typeof modes[number]} slug={slug}/>}
