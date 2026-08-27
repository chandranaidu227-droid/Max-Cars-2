import {OrdersExperience} from "../../Experiences";export default async function Page({params}:{params:Promise<{orderId:string}>}){return <OrdersExperience id={(await params).orderId}/>}
