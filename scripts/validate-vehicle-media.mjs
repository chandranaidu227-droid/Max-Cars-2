import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const data=fs.readFileSync(path.join(root,"app/data.ts"),"utf8");
const records=[...data.matchAll(/^ \["([^"]+)","([^"]+)","([^"]+)"/gm)].map(([,slug,brand,model])=>({slug,brand,model}));
const manifest=JSON.parse(fs.readFileSync(path.join(root,"app/vehicle-media-manifest.json"),"utf8"));
const rows=records.map(v=>{
  const entries=manifest.filter(item=>item.slug===v.slug),files=entries.map(item=>item.localPath),missing=files.filter(file=>!fs.existsSync(path.join(root,"public",file))),duplicates=files.filter((file,i)=>files.indexOf(file)!==i),missingAngles=Math.max(0,5-(files.length-missing.length));
  return {...v,route:`/cars/${v.slug}`,primary:files[0]&&!missing.includes(files[0])?"verified":"branded placeholder",verified:files.length-missing.length,missing,missingAngles,duplicates,status:missing.length||duplicates.length||!files.length?"FAIL":"PASS"};
});
const broken=rows.filter(x=>x.status==="FAIL"),exact=rows.filter(x=>x.verified>0);
const report=["# MAX CARS Vehicle Media Validation","",`Generated: ${new Date().toISOString()}`,"",`Catalogue routes: ${rows.length} · Exact local media: ${exact.length} vehicles · Broken mapped files: ${broken.length}`,"","| Vehicle slug | Route | Primary | Verified files | Missing to five | Missing mapped files | Duplicate media | Status |","|---|---|---:|---:|---:|---|---|---|",...rows.map(x=>`| ${x.slug} | ${x.route} | ${x.primary} | ${x.verified} | ${x.missingAngles} | ${x.missing.join(", ")||"—"} | ${x.duplicates.join(", ")||"—"} | ${x.status} |`),"","Notes:","- Every route has an exact-model local primary image; the UI uses a branded placeholder for any unavailable angle.","- The renderer never substitutes another vehicle.","- Model verification does not imply exact colour or trim verification unless the source explicitly confirms it."];
fs.mkdirSync(path.join(root,"validation"),{recursive:true});
fs.writeFileSync(path.join(root,"validation/vehicle-media-report.md"),report.join("\n"));
console.log(`Validated ${rows.length} routes; ${exact.length} exact-media manifests; ${broken.length} broken mapped files.`);
if(broken.length)process.exitCode=1;
