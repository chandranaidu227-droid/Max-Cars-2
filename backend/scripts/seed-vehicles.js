const fs = require("fs");
const path = require("path");
const vm = require("vm");
const mongoose = require("mongoose");
require("dotenv").config({ quiet: true });
const { config } = require("../src/config");
const { Vehicle } = require("../src/models");

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

async function seed() {
  const settings = config();
  const records = readCatalogue();
  await mongoose.connect(settings.mongoUri);
  for (const record of records) {
    await Vehicle.findOneAndUpdate({ slug: record.slug }, { $set: record }, { upsert: true, returnDocument: "after", setDefaultsOnInsert: true });
  }
  console.log(`Seeded ${records.length} vehicles into MongoDB Atlas`);
  await mongoose.disconnect();
}

seed().catch(async error => {
  console.error(`Vehicle seed failed: ${error.message}`);
  if (mongoose.connection.readyState) await mongoose.disconnect();
  process.exitCode = 1;
});
