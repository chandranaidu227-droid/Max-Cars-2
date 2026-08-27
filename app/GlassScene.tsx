"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect,useRef} from "react";
export default function GlassScene({reduced=false}:{reduced?:boolean}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  let stop=false,frame=0,renderer:any,scene:any,camera:any;
  let resize:()=>void=()=>{},onPointer:(event:PointerEvent)=>void=()=>{},onVisibility:()=>void=()=>{};
  const rings:any[]=[];let px=0,py=0;
  (async()=>{
   try{
   if(reduced||!ref.current)return;
   const capabilityCanvas=document.createElement("canvas");
   const canRender=capabilityCanvas.getContext("webgl2")||capabilityCanvas.getContext("webgl");
   if(!canRender){ref.current.style.display="none";return}
   const THREE=await import("three"); if(stop||!ref.current)return;
   renderer=new THREE.WebGLRenderer({canvas:ref.current,alpha:true,antialias:true});
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
   scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(45,1,.1,100); camera.position.z=8;
   scene.add(new THREE.AmbientLight(0x78b7ff,3));
   for(let i=0;i<6;i++){const mesh=new THREE.Mesh(new THREE.TorusGeometry(1.2+i*.55,.025+i*.008,16,96),new THREE.MeshPhysicalMaterial({color:i%2?0x78b7ff:0x37e2d5,transparent:true,opacity:.2,transmission:.7}));mesh.rotation.set(i*.22,i*.4,0);mesh.position.set((i-2.5)*.45,(i%2?1:-1)*.3,-i*.45);scene.add(mesh);rings.push(mesh)}
   resize=()=>{if(!ref.current)return;const w=ref.current.clientWidth,h=ref.current.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};
   onPointer=(event:PointerEvent)=>{px=(event.clientX/innerWidth-.5)*.7;py=(event.clientY/innerHeight-.5)*.45};
   onVisibility=()=>{if(!document.hidden&&!stop){cancelAnimationFrame(frame);frame=requestAnimationFrame(tick)}};
   resize(); addEventListener("resize",resize);addEventListener("pointermove",onPointer,{passive:true});document.addEventListener("visibilitychange",onVisibility);
   const tick=(t:number)=>{if(stop||document.hidden)return;camera.position.x+=(px-camera.position.x)*.018;camera.position.y+=(-py-camera.position.y)*.018;camera.lookAt(0,0,0);rings.forEach((ring,i)=>{ring.rotation.x=t*.000025*(i+1);ring.rotation.y+=.00022*(i+1)});renderer.render(scene,camera);frame=requestAnimationFrame(tick)};
   frame=requestAnimationFrame(tick);
   }catch{if(ref.current)ref.current.style.display="none"}
  })();
  return()=>{stop=true;cancelAnimationFrame(frame);removeEventListener("resize",resize);removeEventListener("pointermove",onPointer);document.removeEventListener("visibilitychange",onVisibility);renderer?.dispose();rings.forEach(ring=>{ring.geometry.dispose();ring.material.dispose()})}
 },[reduced]);
 return <canvas ref={ref} className="glass-scene" aria-hidden="true"/>
}
