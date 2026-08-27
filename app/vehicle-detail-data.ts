import {Car} from "./data";
import mediaManifest from "./vehicle-media-manifest.json";

export type MediaAngle="Front"|"Rear"|"Left side"|"Right side"|"Front three-quarter"|"Rear three-quarter"|"Interior"|"Dashboard"|"Front seats"|"Rear seats"|"Rear cabin"|"Boot space"|"Engine area"|`Exterior reference ${number}`;
export type VehicleMedia={vehicleId:string;slug:string;brand:string;model:string;variant:string;modelYear:number;colour:string;angle:MediaAngle;imageUrl?:string;altText:string;mediaType:"image";verified:boolean;verificationStatus:"verified"|"unavailable";sortOrder:number;sourceUrl?:string;license?:string;attribution?:string};

const angles:MediaAngle[]=["Front","Rear","Left side","Right side","Front three-quarter","Rear three-quarter","Interior","Dashboard","Front seats","Rear seats","Boot space"];
const bydSource="https://www.byd.com/eu/news-list/byd-introduces-sporty-byd-sealion-7-to-european-market";
const arturaSource="https://commons.wikimedia.org/wiki/Category:McLaren_Artura";
const arturaFiles:Partial<Record<MediaAngle,string>>={
  "Front":"front.webp",
  "Rear":"rear.webp",
  "Left side":"left-side.webp",
  "Right side":"right-side.webp",
  "Front three-quarter":"front-three-quarter.webp",
  "Rear three-quarter":"rear-three-quarter.webp",
  "Interior":"interior.webp",
  "Dashboard":"dashboard.webp",
  "Front seats":"front-seats.webp",
  "Engine area":"engine-area.webp"
};

export function vehicleMedia(car:Car,colour:string):VehicleMedia[]{
  const exactRows=mediaManifest.filter(item=>item.slug===car.slug).sort((a,b)=>a.sortOrder-b.sortOrder);
  const requestedAngles=car.slug==="mclaren-artura"?["Front","Rear","Left side","Right side","Front three-quarter","Rear three-quarter","Interior","Dashboard","Front seats","Rear cabin","Engine area"] as MediaAngle[]:angles;
  return requestedAngles.map((angle,index)=>{
    const exactByd=car.slug==="byd-sealion-7"&&colour==="Atlantis Grey";
    const exactArtura=car.slug==="mclaren-artura"&&colour==="McLaren Orange";
    const curatedUrl=exactByd&&angle==="Front"?"/vehicles/byd-sealion-7/front.webp":exactByd&&angle==="Front three-quarter"?"/vehicles/byd-sealion-7/front-three-quarter.webp":exactArtura&&arturaFiles[angle]?`/vehicles/mclaren-artura/${arturaFiles[angle]}`:undefined;
    const record=curatedUrl?undefined:exactRows[index];
    const imageUrl=curatedUrl||record?.localPath;
    const displayAngle=curatedUrl?angle:(record?`Exterior reference ${index+1}` as MediaAngle:angle);
    const sourceUrl=curatedUrl?(exactByd?bydSource:arturaSource):record?.sourceUrl;
    return {vehicleId:car.id,slug:car.slug,brand:car.brand,model:car.model,variant:car.variant,modelYear:car.year,colour,angle:displayAngle,imageUrl,altText:imageUrl?`${car.year} ${car.brand} ${car.model} ${car.variant}, ${displayAngle.toLowerCase()}`:`${angle} image unavailable for ${car.brand} ${car.model}`,mediaType:"image",verified:!!imageUrl,verificationStatus:imageUrl?"verified":"unavailable",sortOrder:index+1,sourceUrl,license:curatedUrl&&exactArtura?"CC BY-SA 4.0":record?.license,attribution:curatedUrl&&exactArtura?(angle==="Interior"||angle==="Dashboard"||angle==="Front seats"?"Aos.1905":"Damian B Oh"):record?.attribution};
  });
}

export type VariantRecord={name:string;price:number;power:string;torque:string;range:string;drive:string;battery:string;charging:string;availability:string};
export function variantsFor(car:Car):VariantRecord[]{
  if(car.slug==="byd-sealion-7")return [
    {name:"Premium",price:4940000,power:"230 kW / 313 PS",torque:"380 Nm",range:"567 km (claimed)",drive:"RWD",battery:"82.56 kWh Blade Battery (LFP)",charging:"150 kW DC · 11 kW AC",availability:"Dealer confirmation required"},
    {name:"Performance",price:5490000,power:"390 kW / 530 PS",torque:"690 Nm",range:"542 km (claimed)",drive:"AWD",battery:"82.56 kWh Blade Battery (LFP)",charging:"150 kW DC · 11 kW AC",availability:"Dealer confirmation required"}
  ];
  return [{name:car.variant,price:car.price,power:car.power,torque:"Not available",range:car.range,drive:car.drive,battery:car.fuel==="electric"?"Not available":"Not applicable",charging:car.fuel==="electric"?"Not available":"Not applicable",availability:"Dealer confirmation required"}];
}

export const coloursFor=(car:Car)=>car.slug==="byd-sealion-7"?["Atlantis Grey","Shark Grey","Cosmos Black","Aurora White"]:car.slug==="mclaren-artura"?["McLaren Orange"]:["Catalogue colour"];
