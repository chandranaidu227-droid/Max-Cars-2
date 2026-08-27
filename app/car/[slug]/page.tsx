import VehicleDetailV2 from "../../VehicleDetailV2";export default async function Page({params}:{params:Promise<{slug:string}>}){return <VehicleDetailV2 slug={(await params).slug}/>}
