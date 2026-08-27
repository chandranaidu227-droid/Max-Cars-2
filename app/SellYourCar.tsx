"use client";
import {useEffect,useMemo,useState} from "react";
type Listing={id:string;registration:string;brand:string;model:string;variant:string;year:string;fuel:string;transmission:string;km:string;owners:string;condition:string;service:string;accident:string;insurance:string;location:string;price:string;name:string;phone:string;email:string;status:string;valuation:number;created:string};
const empty={registration:"",brand:"",model:"",variant:"",year:"",fuel:"Petrol",transmission:"Automatic",km:"",owners:"1",condition:"Excellent",service:"Full service history",accident:"No declared accident",insurance:"Comprehensive — active",location:"Hyderabad",price:"",name:"",phone:"",email:""};
export default function SellYourCar(){const [step,setStep]=useState(1),[form,setForm]=useState(empty),[photos,setPhotos]=useState<string[]>([]),[docs,setDocs]=useState<string[]>([]),[preview,setPreview]=useState(false),[saved,setSaved]=useState(false),[submitted,setSubmitted]=useState<Listing|null>(null);useEffect(()=>{const d=JSON.parse(localStorage.getItem("max-listing-draft")||"null");if(d){setForm({...empty,...d});setSaved(true)}},[]);const set=(k:keyof typeof empty,v:string)=>setForm(x=>({...x,[k]:v}));const valuation=useMemo(()=>{const age=Math.max(0,2026-Number(form.year||2026)),base=Number(form.price||0)||1200000,condition=form.condition==="Excellent"?1:form.condition==="Good"?.9:.76,history=form.accident==="No declared accident"?1:.84;return Math.max(0,Math.round(base*Math.pow(.88,age)*condition*history/1000)*1000)},[form]);const files=(list:FileList|null,setter:(v:string[])=>void)=>{if(!list)return;setter([...list].slice(0,10).filter(f=>f.size<=8e6&&/^image\//.test(f.type)).map(URL.createObjectURL))};const saveDraft=()=>{localStorage.setItem("max-listing-draft",JSON.stringify(form));setSaved(true)};const finish=(status:string)=>{const listing:Listing={...form,id:`MC-LST-${Date.now().toString().slice(-7)}`,status,valuation,created:new Date().toISOString()};const all=JSON.parse(localStorage.getItem("max-listings")||"[]") as Listing[];localStorage.setItem("max-listings",JSON.stringify([listing,...all.filter(x=>x.registration!==listing.registration)]));localStorage.removeItem("max-listing-draft");dispatchEvent(new Event("max-state"));setSubmitted(listing)};if(submitted)return <main className="sell-complete">
<strong className="text-wordmark">MAX <em>CARS</em></strong>
<small>LISTING RECEIVED</small>
<h1>{submitted.id}</h1>
<p>Your {submitted.brand} {submitted.model} is saved with status <b>{submitted.status}</b>. The indicative valuation is not a guaranteed offer and remains subject to document and physical inspection.</p>
<strong>Estimated range: ₹{Math.round(submitted.valuation*.94).toLocaleString("en-IN")} – ₹{Math.round(submitted.valuation*1.06).toLocaleString("en-IN")}</strong>
<div>
<a href="/profile/listings">Track My Car Listings</a>
<a href="/sell">Create another listing</a>
</div>
</main>;
 return <main className="sell-page">
<section className="sell-hero">
<div className="sell-hero-background" role="img" aria-label="Professional mechanic inspecting a real vehicle engine"/>
<div className="sell-hero-content">
<small>SELL YOUR CAR / VERIFIED PROCESS</small>
<h1>Sell Your Car with Confidence</h1>
<p>Get an estimated value, create a verified listing and connect with interested buyers through MAX CARS.</p>
<nav className="sell-hero-actions">
<a href="#sell-workspace">Start Selling</a>
<a href="#valuation">Get Car Valuation</a>
<a href="/profile/listings">View My Listings</a>
</nav>
<dl>
<span>
<b>01</b>Describe</span>
<span>
<b>02</b>Document</span>
<span>
<b>03</b>Inspect</span>
<span>
<b>04</b>List</span>
</dl>
</div>
</section>
<section className="service-story-grid sell-story-grid" aria-label="How MAX CARS prepares a vehicle listing">
<a href="#sell-workspace"><img src="/sell-inspection-engine.jpg" alt="Mechanic reviewing a real vehicle engine during an inspection" loading="lazy"/><span><small>01 / CONDITION</small><b>Inspect the real vehicle</b><em>Start vehicle details →</em></span></a>
<a href="#sell-workspace"><img src="/sell-inspection-check.jpg" alt="Automotive technician checking components under an open bonnet" loading="lazy"/><span><small>02 / VERIFICATION</small><b>Record condition clearly</b><em>Add ownership details →</em></span></a>
<a href="#valuation"><img src="/sell-inspection-verify.jpg" alt="Professional technician completing an automotive inspection" loading="lazy"/><span><small>03 / VALUATION</small><b>Review an estimated value</b><em>Open valuation →</em></span></a>
</section>
<section className="sell-workspace" id="sell-workspace">
<aside>
<small>YOUR PROGRESS</small>
<h2>{String(step).padStart(2,"0")} / 05</h2>{["Vehicle identity","Condition & ownership","Media & documents","Contact & inspection","Review & publish"].map((x,i)=>
<button className={step===i+1?"active":step>i+1?"done":""} onClick={()=>setStep(i+1)} key={x}>
<span>{i+1}</span>{x}</button>)}<div className="valuation-live" id="valuation">
<small>INDICATIVE VALUE</small>
<b>{valuation?`₹${valuation.toLocaleString("en-IN")}`:"Complete vehicle details"}</b>
<p>Final value follows inspection.</p>
</div>
</aside>
<form onSubmit={e=>e.preventDefault()}>
<header>
<small>MAX CARS LISTING STUDIO</small>
<h2>{["Tell us exactly what you drive.","Condition changes everything.","Show the real vehicle.","Choose how we reach you.","Review before verification."][step-1]}</h2>{saved&&<span>Draft saved on this device</span>}</header>{step===1&&<fieldset>
<label>Registration number<input value={form.registration} onChange={e=>set("registration",e.target.value.toUpperCase())} required placeholder="TS 09 AB 1234"/>
</label>
<label>Brand<input value={form.brand} onChange={e=>set("brand",e.target.value)} required/>
</label>
<label>Model<input value={form.model} onChange={e=>set("model",e.target.value)} required/>
</label>
<label>Variant<input value={form.variant} onChange={e=>set("variant",e.target.value)} required/>
</label>
<label>Model year<input type="number" min="1990" max="2026" value={form.year} onChange={e=>set("year",e.target.value)} required/>
</label>
<label>Fuel type<select value={form.fuel} onChange={e=>set("fuel",e.target.value)}>{["Petrol","Diesel","CNG","Hybrid","Electric"].map(x=>
<option key={x}>{x}</option>)}</select>
</label>
<label>Transmission<select value={form.transmission} onChange={e=>set("transmission",e.target.value)}>
<option>Automatic</option>
<option>Manual</option>
</select>
</label>
<label>Kilometres driven<input type="number" min="0" value={form.km} onChange={e=>set("km",e.target.value)} required/>
</label>
</fieldset>}{step===2&&<fieldset>
<label>Ownership count<select value={form.owners} onChange={e=>set("owners",e.target.value)}>
<option>1</option>
<option>2</option>
<option>3</option>
<option>4+</option>
</select>
</label>
<label>Vehicle condition<select value={form.condition} onChange={e=>set("condition",e.target.value)}>
<option>Excellent</option>
<option>Good</option>
<option>Fair</option>
<option>Needs repair</option>
</select>
</label>
<label>Service history<select value={form.service} onChange={e=>set("service",e.target.value)}>
<option>Full service history</option>
<option>Partial history</option>
<option>Not available</option>
</select>
</label>
<label>Accident history<select value={form.accident} onChange={e=>set("accident",e.target.value)}>
<option>No declared accident</option>
<option>Minor repaired damage</option>
<option>Major repaired damage</option>
</select>
</label>
<label>Insurance status<select value={form.insurance} onChange={e=>set("insurance",e.target.value)}>
<option>Comprehensive — active</option>
<option>Third-party — active</option>
<option>Expired</option>
</select>
</label>
<label>Expected selling price<input type="number" min="0" value={form.price} onChange={e=>set("price",e.target.value)} placeholder="₹"/>
</label>
</fieldset>}{step===3&&<fieldset className="upload-step">
<label>Vehicle photographs<input type="file" accept="image/*" multiple onChange={e=>files(e.target.files,setPhotos)}/>
<small>Front, rear, both sides, interior and dashboard · JPG/PNG/WebP · max 8 MB</small>
</label>
<div className="upload-previews">{photos.map((src,i)=>
<figure key={src}>
<img src={src} alt={`Vehicle upload ${i+1}`}/>
<button type="button" onClick={()=>setPhotos(x=>x.filter((_,n)=>n!==i))}>×</button>
</figure>)}</div>
<label>Ownership document images<input type="file" accept="image/*,.pdf" multiple onChange={e=>files(e.target.files,setDocs)}/>
<small>Registration certificate and insurance. Preview data remains local in this demonstration.</small>
</label>
<p>{docs.length} ownership document image{docs.length===1?"":"s"} selected</p>
</fieldset>}{step===4&&<fieldset>
<label>Current location<input value={form.location} onChange={e=>set("location",e.target.value)} required/>
</label>
<label>Full name<input value={form.name} onChange={e=>set("name",e.target.value)} required/>
</label>
<label>Phone<input type="tel" pattern="[0-9]{10}" value={form.phone} onChange={e=>set("phone",e.target.value)} required/>
</label>
<label>Email<input type="email" value={form.email} onChange={e=>set("email",e.target.value)} required/>
</label>
<label>Inspection date<input type="date" min={new Date().toISOString().slice(0,10)} required/>
</label>
<label>Inspection preference<select>
<option>MAX CARS inspection centre</option>
<option>Request doorstep inspection</option>
</select>
</label>
</fieldset>}{step===5&&<section className="listing-review">
<div>
<small>VEHICLE</small>
<h3>{form.year} {form.brand} {form.model}</h3>
<p>{form.variant} · {form.fuel} · {form.transmission}<br/>{Number(form.km||0).toLocaleString("en-IN")} km · {form.owners} owner(s)</p>
</div>
<dl>
<span>
<b>{form.condition}</b>Condition</span>
<span>
<b>{form.service}</b>Service history</span>
<span>
<b>{photos.length}</b>Vehicle photos</span>
<span>
<b>{form.location}</b>Location</span>
</dl>
<div className="estimate">
<small>ESTIMATED VALUATION</small>
<b>₹{Math.round(valuation*.94).toLocaleString("en-IN")} – ₹{Math.round(valuation*1.06).toLocaleString("en-IN")}</b>
<p>Indicative only. Physical inspection, documents, market demand and final vehicle condition determine the offer.</p>
</div>
<label className="check">
<input type="checkbox" required/> I confirm these details are accurate and consent to verification.</label>
</section>}<footer>
<div>
<button type="button" onClick={saveDraft}>Save as Draft</button>
<button type="button" onClick={()=>setPreview(true)}>Preview Listing</button>
</div>
<div>{step>1&&<button type="button" onClick={()=>setStep(x=>x-1)}>← Back</button>}{step<5?<button className="primary" type="button" onClick={()=>setStep(x=>x+1)}>Continue →</button>:<>
<button type="button" onClick={()=>finish("Submitted for verification")}>Submit for Verification</button>
<button className="primary" type="button" onClick={()=>finish("Pending verification")}>Publish Listing</button>
</>}</div>
</footer>
</form>
</section>{preview&&<div className="listing-preview-modal" role="dialog" aria-modal="true" onClick={e=>e.target===e.currentTarget&&setPreview(false)}>
<article>
<button onClick={()=>setPreview(false)}>×</button>{photos[0]?<img src={photos[0]} alt="Vehicle listing preview"/>:<div className="preview-missing">Vehicle photo preview</div>}<small>PREVIEW / NOT PUBLISHED</small>
<h2>{form.year} {form.brand} {form.model}</h2>
<p>{form.variant} · {form.km||0} km · {form.location}</p>
<strong>{form.price?`₹${Number(form.price).toLocaleString("en-IN")}`:"Price on request"}</strong>
</article>
</div>}</main>}
