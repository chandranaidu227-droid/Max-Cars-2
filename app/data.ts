import mediaManifest from "./vehicle-media-manifest.json";

export type Car={id:string;slug:string;brand:string;model:string;variant:string;condition:"new"|"used";category:string;body:string;fuel:string;price:number;power:string;range:string;drive:string;image:string;year:number;location:string;badge:string;seats:number;safety:string;rating:number;variants:number;transmission:string};
const exactPrimary=mediaManifest.reduce<Record<string,string>>((map,item)=>{if(!map[item.slug])map[item.slug]=item.localPath;return map},{});
exactPrimary["bmw-m2"]="/vehicles/bmw-m2-g87/P90553555.jpg";
const raw:Array<[string,string,string,string,string,string,number,string,string,string,string,number,string,number,number,string]>=[
 ["tata-curvv-ev","Tata","Curvv EV","Empowered+ A 55","electric","suv",1749000,"167 PS","502 km","FWD","photo-1590362891991-f776e747a588",5,"5★",4.6,7,"Automatic"],
 ["mahindra-xuv700","Mahindra","XUV700","AX7 Luxury Pack","diesel","suv",1399000,"185 PS","16.6 km/l","FWD","photo-1519641471654-76ce0107ad1b",7,"5★",4.5,23,"Automatic"],
 ["maruti-grand-vitara","Maruti Suzuki","Grand Vitara","Alpha+ Strong Hybrid","hybrid","suv",1142000,"116 PS","27.97 km/l","FWD","photo-1533473359331-0135ef1b58bf",5,"Not available",4.4,17,"Automatic"],
 ["hyundai-creta","Hyundai","Creta","SX (O) Knight","petrol","suv",1111000,"160 PS","18.4 km/l","FWD","photo-1550355291-bbee04a92027",5,"3★",4.5,52,"Automatic"],
 ["kia-seltos","Kia","Seltos","X-Line DCT","petrol","suv",1119000,"160 PS","17.9 km/l","FWD","photo-1626668893632-6f3a4466d22f",5,"3★",4.4,31,"Automatic"],
 ["mg-windsor-ev","MG","Windsor EV","Essence Pro","electric","mpv",1399000,"136 PS","449 km","FWD","photo-1605559424843-9e4c228bf1c2",5,"Not available",4.5,5,"Automatic"],
 ["toyota-fortuner","Toyota","Fortuner","Legender 4x4 AT","diesel","suv",3605000,"204 PS","10.0 km/l","4WD","photo-1549317661-bd32c8ce0db2",7,"Not available",4.7,7,"Automatic"],
 ["honda-city","Honda","City","ZX CVT","petrol","sedan",1238000,"121 PS","18.4 km/l","FWD","photo-1609521263047-f8f205293f24",5,"5★",4.5,9,"Automatic"],
 ["skoda-kodiaq","Škoda","Kodiaq","L&K 4x4","petrol","suv",4689000,"204 PS","14.86 km/l","AWD","photo-1597007066704-67bf2068d5b2",7,"5★",4.6,2,"Automatic"],
 ["volkswagen-tiguan-r-line","Volkswagen","Tiguan R-Line","2.0 TSI","petrol","suv",4900000,"204 PS","12.58 km/l","AWD","photo-1625047509168-a7026f36de04",5,"5★",4.6,1,"Automatic"],
 ["renault-kiger","Renault","Kiger","RXZ Turbo CVT","petrol","suv",629000,"100 PS","18.2 km/l","FWD","photo-1542282088-72c9c27ed0cd",5,"4★",4.2,18,"Automatic"],
 ["nissan-magnite","Nissan","Magnite","Tekna+ Turbo CVT","petrol","suv",614000,"100 PS","17.9 km/l","FWD","photo-1539799139339-50c5fe1e2b1b",5,"Not available",4.3,18,"Automatic"],
 ["citroen-aircross","Citroën","Aircross","Max Turbo AT","petrol","suv",849000,"110 PS","17.6 km/l","FWD","photo-1568844293986-8d0400fbc17f",7,"Not available",4.1,10,"Automatic"],
 ["jeep-compass","Jeep","Compass","Model S 4x4 AT","diesel","suv",1899000,"170 PS","14.9 km/l","4WD","photo-1530789253388-582c481c54b0",5,"5★",4.4,13,"Automatic"],
 ["byd-sealion-7","BYD","Sealion 7","Performance","electric","suv",4890000,"530 PS","542 km","AWD","photo-1619767886558-efdc259cde1a",5,"5★",4.6,2,"Automatic"],
 ["audi-rs-etron-gt","Audi","RS e-tron GT","Performance","electric","coupe",19500000,"925 PS","592 km","quattro","photo-1606664515524-ed2f786a0bd6",5,"5★",4.8,2,"Automatic"],
 ["bmw-i7-xdrive60","BMW","i7","xDrive60","electric","sedan",20300000,"544 PS","625 km","AWD","photo-1555215695-3004980ad54e",5,"5★",4.8,2,"Automatic"],
 ["mercedes-amg-gt-63","Mercedes-Benz","AMG GT 4-Door","63 S 4MATIC+","petrol","coupe",33000000,"639 PS","Not available","AWD","photo-1618843479313-40f8afb4b4d8",4,"Not available",4.8,1,"Automatic"],
 ["volvo-ex40","Volvo","EX40","Twin Motor","electric","suv",5690000,"408 PS","418 km","AWD","photo-1612563977249-beb6c82437f4",5,"5★",4.6,2,"Automatic"],
 ["jaguar-f-pace","Jaguar","F-Pace","R-Dynamic S","petrol","suv",7488000,"250 PS","12.9 km/l","AWD","photo-1616788494707-ec28f08d05a1",5,"5★",4.5,2,"Automatic"],
 ["range-rover-sport-dynamic","Land Rover","Range Rover Sport","Dynamic SE","diesel","suv",16400000,"351 PS","11.3 km/l","AWD","photo-1539795845756-4fadad2905ec",5,"5★",4.8,5,"Automatic"],
 ["lexus-lm-350h","Lexus","LM","350h Ultra Luxury","hybrid","mpv",21000000,"250 PS","14.4 km/l","AWD","photo-1541899481282-d53bffe3c35d",4,"5★",4.8,2,"Automatic"],
 ["porsche-taycan-4s","Porsche","Taycan","4S","electric","sedan",18900000,"530 PS","463 km","AWD","photo-1503376780353-7e6692767b70",5,"5★",4.9,5,"Automatic"],
 ["mini-cooper-s","MINI","Cooper S","3-Door","petrol","hatchback",4490000,"204 PS","16.58 km/l","FWD","photo-1530792289916-787e9dce5568",4,"Not available",4.5,1,"Automatic"],
 ["ferrari-296-gtb","Ferrari","296 GTB","Assetto Fiorano","hybrid","coupe",54000000,"830 PS","Not available","RWD","photo-1592198084033-aade902d1aae",2,"Not available",4.9,1,"Automatic"],
 ["lamborghini-huracan-tecnica","Lamborghini","Huracán","Tecnica","petrol","coupe",40400000,"640 PS","7.2 km/l","RWD","photo-1544636331-e26879cd4d9b",2,"Not available",4.9,1,"Automatic"],
 ["bentley-continental-gt","Bentley","Continental GT","Speed","hybrid","coupe",55000000,"782 PS","81 km EV","AWD","photo-1563720223185-11003d516935",4,"Not available",4.8,2,"Automatic"],
 ["rolls-royce-spectre","Rolls-Royce","Spectre","Black Badge","electric","coupe",75000000,"659 PS","530 km","AWD","photo-1631295868223-63265b40d9e4",4,"Not available",4.9,2,"Automatic"],
 ["aston-martin-vantage","Aston Martin","Vantage","4.0 V8","petrol","coupe",39900000,"665 PS","Not available","RWD","photo-1600712242805-5f78671b24da",2,"Not available",4.8,1,"Automatic"],
 ["mclaren-artura","McLaren","Artura","Performance","hybrid","coupe",51000000,"700 PS","31 km EV","RWD","photo-1621135802920-133df287f89c",2,"Not available",4.9,1,"Automatic"],
 ["tesla-model-y","Tesla","Model Y","Long Range AWD","electric","suv",5990000,"Not available","533 km","AWD","photo-1560958089-b8a1929cea89",5,"5★",4.6,2,"Automatic"]
];
const catalogueCars:Car[]=raw.map((x,i)=>({id:`mc-${String(i+1).padStart(3,"0")}`,slug:x[0],brand:x[1],model:x[2],variant:x[3],fuel:x[4],body:x[5],price:x[6],power:x[7],range:x[8],drive:x[9],image:exactPrimary[x[0]]||"/vehicle-placeholder.svg",seats:x[11],safety:x[12],rating:x[13],variants:x[14],transmission:x[15],condition:i===25?"used":"new",category:["Ferrari","Lamborghini","Porsche","McLaren","Aston Martin"].includes(x[1])?"performance":["Audi","BMW","Mercedes-Benz","Volvo","Jaguar","Land Rover","Lexus","Bentley","Rolls-Royce"].includes(x[1])?"luxury":"family",year:i%6===0?2026:2025,location:["Hyderabad","Mumbai","Delhi","Bengaluru","Chennai"][i%5],badge:x[4]==="electric"?"EV":i%5===0?"NEW":"VERIFIED"}));
const bmwM2:Car={id:"mc-bmw-m2-g87",slug:"bmw-m2",brand:"BMW",model:"M2",variant:"G87",condition:"new",category:"performance",body:"coupe",fuel:"petrol",price:10300000,power:"480 PS",range:"Not available",drive:"RWD",image:exactPrimary["bmw-m2"],year:2025,location:"Mumbai",badge:"360°",seats:4,safety:"Not available",rating:4.8,variants:1,transmission:"Automatic"};
export const cars:Car[]=[...catalogueCars,bmwM2];
export const money=(n:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
export const short=(n:number)=>n>=1e7?`₹${(n/1e7).toFixed(2)} Cr`:`₹${(n/1e5).toFixed(1)} L`;
