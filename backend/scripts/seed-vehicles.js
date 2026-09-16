const fs = require("fs");
const path = require("path");
const vm = require("vm");

function readCatalogue() {
  const source = fs.readFileSync(path.join(__dirname, "../../app/data.ts"), "utf8");
  const match = source.match(/const raw:Array<[^>]+>=([\s\S]*?);\nconst catalogueCars/);
  if (!match) throw new Error("Could not locate the frontend vehicle catalogue");
  const raw = vm.runInNewContext(`(${match[1]})`);
  const records = raw.map((item, index) => ({
    id: `mc-${String(index + 1).padStart(3, "0")}`,
    slug: item[0],
    brand: item[1],
    model: item[2],
    variant: item[3],
    fuel: item[4],
    body: item[5],
    price: item[6],
    power: item[7],
    range: item[8],
    drive: item[9],
    image: "/vehicle-placeholder.svg",
    seats: item[11],
    safety: item[12],
    rating: item[13],
    variants: item[14],
    transmission: item[15],
    condition: index === 25 ? "used" : "new",
    category: ["Ferrari", "Lamborghini", "Porsche", "McLaren", "Aston Martin"].includes(item[1]) ? "performance" : ["Audi", "BMW", "Mercedes-Benz", "Volvo", "Jaguar", "Land Rover", "Lexus", "Bentley", "Rolls-Royce"].includes(item[1]) ? "luxury" : "family",
    year: index % 6 === 0 ? 2026 : 2025,
    location: ["Hyderabad", "Mumbai", "Delhi", "Bengaluru", "Chennai"][index % 5],
    badge: item[4] === "electric" ? "EV" : index % 5 === 0 ? "NEW" : "VERIFIED",
    metadata: { sourceImage: item[10], source: "MAX CARS catalogue" },
  }));
  records.push({
    id: "mc-bmw-m2-g87",
    slug: "bmw-m2",
    brand: "BMW",
    model: "M2",
    variant: "G87",
    fuel: "petrol",
    body: "coupe",
    price: 10300000,
    power: "480 PS",
    range: "Not available",
    drive: "RWD",
    image: "/vehicles/bmw-m2-g87/P90553555.jpg",
    seats: 4,
    safety: "Not available",
    rating: 4.8,
    variants: 1,
    transmission: "Automatic",
    condition: "new",
    category: "performance",
    year: 2025,
    location: "Mumbai",
    badge: "360°",
    metadata: { source: "MAX CARS exact BMW M2 record" },
  });
  return records;
}

function generateSql() {
  const records = readCatalogue().map((row, index) => ({
    catalogueId: row.id || `mc-${String(index + 1).padStart(3, "0")}`,
    slug: row.slug, brand: row.brand, model: row.model, variant: row.variant,
    price: row.price, fuel: row.fuel, body: row.body, year: row.year, image: row.image, metadata: row,
  }));
  const json = JSON.stringify(records).replaceAll("'", "''");
  const columns = '"catalogueId", slug, brand, model, variant, price, fuel, body, year, image, metadata';
  return `-- Generated vehicle catalogue; existing slugs are preserved.\ninsert into public.vehicles (${columns})\nselect ${columns} from jsonb_to_recordset('${json}'::jsonb) as v("catalogueId" text, slug text, brand text, model text, variant text, price numeric, fuel text, body text, year integer, image text, metadata jsonb)\non conflict (slug) do nothing;\n`;
}
if (require.main === module) {
  const root = path.join(__dirname, "../../supabase");
  fs.mkdirSync(root, { recursive: true });
  const seed = generateSql();
  fs.writeFileSync(path.join(root, "seed.sql"), seed);
  const migration = fs.readFileSync(path.join(root, "migrations/202609150001_max_cars.sql"), "utf8");
  fs.writeFileSync(path.join(root, "setup.sql"), '-- Run once in the Supabase SQL Editor for this project.\n' + migration + '\n' + seed);
  console.log("Generated supabase/setup.sql with schema, RLS and 32 catalogue vehicles. No database was changed.");
}
module.exports = { readCatalogue, generateSql };
