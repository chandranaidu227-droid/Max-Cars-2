import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {cars} from "../../data";
import VehicleDetailV2 from "../../VehicleDetailV2";
import {CatalogueRoute} from "../../RouteTemplates";
const categories=["suv","sedan","hatchback","coupe","convertible","luxury","performance","electric","hybrid","family"];

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params,car=cars.find(x=>x.slug===slug);
  if(categories.includes(slug))return {title:`${slug[0].toUpperCase()+slug.slice(1)} Cars`,description:`Explore ${slug} vehicles in the MAX CARS catalogue.`};
  if(!car)return {title:"Vehicle not found",robots:{index:false,follow:false},openGraph:{images:[]},twitter:{images:[]}};
  const exact=car.image!=="/vehicle-placeholder.svg";
  return {title:`${car.brand} ${car.model}`,description:`Explore the ${car.year} ${car.brand} ${car.model} ${car.variant}, specifications, exact-model media and ownership actions.`,openGraph:{title:`${car.brand} ${car.model} · MAX CARS`,description:`${car.variant} · ${car.power} · ${car.range}`,images:exact?[{url:car.image,alt:`${car.brand} ${car.model}`}]:[]},twitter:{card:"summary_large_image",title:`${car.brand} ${car.model} · MAX CARS`,description:`${car.variant} · ${car.power} · ${car.range}`,images:exact?[car.image]:[]}};
}

export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  if(categories.includes(slug))return <CatalogueRoute category={slug}/>;
  if(!cars.some(x=>x.slug===slug))notFound();
  return <VehicleDetailV2 slug={slug}/>;
}
