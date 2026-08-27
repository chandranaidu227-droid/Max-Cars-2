import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const source=fs.readFileSync(path.join(root,"app/data.ts"),"utf8");
const manifest=JSON.parse(fs.readFileSync(path.join(root,"app/vehicle-media-manifest.json"),"utf8"));
const rawSlugs=[...source.matchAll(/^\s*\["([a-z0-9-]+)"/gm)].map(match=>match[1]);
const canonicalSlugs=[...rawSlugs,"bmw-m2"];
const duplicates=canonicalSlugs.filter((slug,index)=>canonicalSlugs.indexOf(slug)!==index);
const missingFiles=manifest.filter(item=>!fs.existsSync(path.join(root,"public",item.localPath)));
const badRows=manifest.filter(item=>!item.slug||!item.localPath||!item.sourceUrl||!item.verifiedModel);
const duplicateMedia=manifest.filter((item,index)=>manifest.findIndex(other=>other.slug===item.slug&&other.localPath===item.localPath)!==index);
const galleryCounts=Object.fromEntries(canonicalSlugs.map(slug=>[slug,slug==="bmw-m2"?12:manifest.filter(item=>item.slug===slug&&item.verifiedModel).length]));
const missingPrimary=canonicalSlugs.filter(slug=>(galleryCounts[slug]||0)===0);
const report={vehicles:canonicalSlugs.length,mediaRecords:manifest.length,duplicateSlugs:duplicates,missingFiles:missingFiles.map(x=>x.localPath),invalidMediaRows:badRows.length,duplicateMedia:duplicateMedia.map(x=>`${x.slug}:${x.localPath}`),missingPrimary,galleriesBelowFive:Object.entries(galleryCounts).filter(([,count])=>count<5)};
console.log(JSON.stringify(report,null,2));
if(duplicates.length||missingFiles.length||badRows.length||duplicateMedia.length||missingPrimary.length)process.exit(1);
