import mediaManifest from "./vehicle-media-manifest.json";
import {Car,cars} from "./data";

export type ExperienceKind="full3d"|"interactive360"|"photography";
export type VehicleExperience={kind:ExperienceKind;label:"Full 3D"|"Interactive 360°"|"Photography Only";interior:boolean;ar:boolean;mediaCount:number};

const manifestCounts=mediaManifest.reduce<Record<string,number>>((out,item)=>{if(item.verifiedModel)out[item.slug]=(out[item.slug]||0)+1;return out},{});
export const canonicalCars=Array.from(new Map(cars.map(car=>[car.slug,car])).values());
export function experienceFor(car:Car):VehicleExperience{
  if(car.slug==="bmw-m2")return {kind:"interactive360",label:"Interactive 360°",interior:true,ar:false,mediaCount:12};
  const mediaCount=manifestCounts[car.slug]||0;
  return {kind:mediaCount>=5?"interactive360":"photography",label:mediaCount>=5?"Interactive 360°":"Photography Only",interior:["mclaren-artura","byd-sealion-7"].includes(car.slug),ar:false,mediaCount};
}
export function experienceHref(car:Car){
  const query=new URLSearchParams({vehicleId:car.id,variant:car.variant,paint:"Catalogue colour",wheel:"Standard alloy",interior:"Standard interior",price:String(car.price),location:car.location});
  return `/max-3d/configurator/${car.slug}?${query}`;
}
export function uniqueStoredIds(value:string|null){
  try{return Array.from(new Set((JSON.parse(value||"[]") as string[]).filter(id=>canonicalCars.some(car=>car.id===id))))}catch{return []}
}
