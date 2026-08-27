"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { cars, Car, short } from "./data";
import VehicleImage from "./VehicleImage";
import {experienceFor,experienceHref,uniqueStoredIds} from "./vehicle-experience";

const indian = ["Tata", "Mahindra", "Maruti Suzuki"],
  luxury = [
    "Audi",
    "BMW",
    "Mercedes-Benz",
    "Volvo",
    "Jaguar",
    "Land Rover",
    "Lexus",
    "Porsche",
    "MINI",
    "Ferrari",
    "Lamborghini",
    "Bentley",
    "Rolls-Royce",
    "Aston Martin",
    "McLaren",
  ],
  performance = [
    "Porsche",
    "Ferrari",
    "Lamborghini",
    "Aston Martin",
    "McLaren",
    "BMW",
    "Mercedes-Benz",
    "Audi",
  ],
  electric = [
    "Tata",
    "MG",
    "BYD",
    "Audi",
    "BMW",
    "Mercedes-Benz",
    "Volvo",
    "Porsche",
    "Tesla",
  ],
  popular = [
    "Tata",
    "Mahindra",
    "Maruti Suzuki",
    "Hyundai",
    "Kia",
    "Toyota",
    "BMW",
    "Mercedes-Benz",
    "Porsche",
  ];
const categories = [
  "All Brands",
  "Indian Brands",
  "Luxury Brands",
  "Electric Brands",
  "Performance Brands",
  "Popular Brands",
];
const brandIntro = (b: string) =>
  `${b} vehicles selected for design, engineering and ownership appeal. Review current models, variants and indicative India pricing in one focused collection.`;
function updateStored(key: string, id: string) {
  const list = uniqueStoredIds(localStorage.getItem(key));
  if(key==="max-compare"&&!list.includes(id)&&list.length>=4)return false;
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  localStorage.setItem(key, JSON.stringify(next));
  dispatchEvent(new Event("max-state"));
  return next.includes(id);
}
function BrandLogo({ brand }: { brand: string }) {
  return <span className="brand-logo-fallback" aria-label={`${brand} brand wordmark`}>{brand}</span>;
}
function CarCard({
  car,
  onQuick,
  view,
}: {
  car: Car;
  onQuick: (c: Car) => void;
  view: string;
}) {
  const [fav, setFav] = useState(false),
    [compare, setCompare] = useState(false);
  const experience=experienceFor(car);
  useEffect(() => {
    setFav(
      (
        JSON.parse(localStorage.getItem("max-favs") || "[]") as string[]
      ).includes(car.id),
    );
    setCompare(
      (
        JSON.parse(localStorage.getItem("max-compare") || "[]") as string[]
      ).includes(car.id),
    );
  }, [car.id]);
  return (
    <article className={`explorer-car ${view}`}>
      <a className="car-image-link" href={`/cars/${car.slug}`}>
        <figure>
          <VehicleImage
            src={car.image}
            alt={`${car.year} ${car.brand} ${car.model} ${car.variant}`}
            sizes="(max-width:680px) 100vw, 50vw"
          />
          <span>{car.badge}</span>
          <div className="experience-badges"><b>{experience.label}</b>{experience.interior&&<b>Interior View</b>}{experience.ar&&<b>AR Ready</b>}</div>
        </figure>
      </a>
      <div>
        <header className="car-brand-line">
          <BrandLogo brand={car.brand} />
          <small>
            {car.brand.toUpperCase()} · {car.year} · {car.location}
          </small>
          <button
            className={fav ? "selected" : ""}
            onClick={() => setFav(updateStored("max-favs", car.id))}
            aria-label={`${fav ? "Remove from" : "Save to"} favourites`}
          >
            <span aria-hidden="true">♡</span>
          </button>
        </header>
        <h2>{car.model}</h2>
        <p>
          {car.variant} · {car.variants} variant{car.variants === 1 ? "" : "s"}
        </p>
        <dl>
          <span>
            <b>{car.fuel}</b>FUEL
          </span>
          <span>
            <b>{car.transmission}</b>TRANSMISSION
          </span>
          <span><b>{car.power}</b>POWER</span>
          <span>
            <b>{car.range}</b>
            {car.fuel === "electric" ? "RANGE" : "EFFICIENCY"}
          </span>
          <span>
            <b>{car.seats}</b>SEATS
          </span>
          <span>
            <b>{car.safety}</b>SAFETY
          </span>
          <span>
            <b>{car.rating}/5</b>USER RATING
          </span>
        </dl>
        <div className="colour-dots" aria-label="Available colours">
          <i />
          <i />
          <i />
        </div>
        <footer>
          <strong>
            {short(car.price)} <small>indicative ex-showroom*</small>
          </strong>
          <span>
            <label>
              <input
                type="checkbox"
                checked={compare}
                onChange={() => setCompare(updateStored("max-compare", car.id))}
              />{" "}
              Compare
            </label>
            <button onClick={() => onQuick(car)}>Quick View</button>
          </span>
        </footer>
        <nav className="car-actions">
          <a href={`/cars/${car.slug}`}>View Details</a>
          {experience.kind!=="photography"&&<a href={experienceHref(car)}>{experience.label}</a>}
          <button onClick={() => setCompare(updateStored("max-compare", car.id))}>{compare?"Compared ✓":"Compare"}</button>
          <a href={`/book-test-drive?car=${car.slug}&variant=${encodeURIComponent(car.variant)}`}>Test Drive</a>
          <button onClick={async()=>{const url=`${location.origin}/cars/${car.slug}`;try{if(navigator.share)await navigator.share({title:`${car.brand} ${car.model}`,url});else await navigator.clipboard.writeText(url)}catch{}}}>Share</button>
          <a href={`/checkout?car=${car.slug}`}>Buy / Enquire</a>
        </nav>
      </div>
    </article>
  );
}

export default function CarExplorer() {
  const [q, setQ] = useState(""),
    [brand, setBrand] = useState(""),
    [model, setModel] = useState(""),
    [body, setBody] = useState(""),
    [fuel, setFuel] = useState(""),
    [condition, setCondition] = useState(""),
    [locationFilter, setLocation] = useState(""),
    [transmission, setTransmission] = useState(""),
    [seats, setSeats] = useState(""),
    [safety, setSafety] = useState(""),
    [minPrice, setMinPrice] = useState(""),
    [maxPrice, setMaxPrice] = useState(""),
    [recent, setRecent] = useState(false),
    [sort, setSort] = useState("popular"),
    [view, setView] = useState("grid"),
    [quick, setQuick] = useState<Car | null>(null),
    [brandGroup, setBrandGroup] = useState("All Brands"),
    [tab, setTab] = useState("All Models");
  const resultsRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const read = () => {
      const p = new URLSearchParams(window.location.search);
      setQ(p.get("q") || "");
      setBrand(p.get("brand") || "");
      setModel(p.get("model") || "");
      setBody(p.get("body") || "");
      setFuel(p.get("fuel") || "");
      setCondition(p.get("condition") || "");
      setLocation(p.get("location") || "");
      setTransmission(p.get("transmission") || "");
      setSeats(p.get("seats") || "");
      setSafety(p.get("safety") || "");
      setMinPrice(p.get("minPrice") || "");
      setMaxPrice(p.get("maxPrice") || "");
      setRecent(p.get("recent") === "1");
    };
    read();
    addEventListener("popstate", read);
    return () => removeEventListener("popstate", read);
  }, []);
  useEffect(() => {
    const p = new URLSearchParams();
    Object.entries({
      q,
      brand,
      model,
      body,
      fuel,
      condition,
      location: locationFilter,
      transmission,
      seats,
      safety,
      minPrice,
      maxPrice,
    }).forEach(([k, v]) => v && p.set(k, v));
    if (recent) p.set("recent", "1");
    history.replaceState(null, "", `/cars${p.size ? `?${p}` : ""}`);
  }, [
    q,
    brand,
    model,
    body,
    fuel,
    condition,
    locationFilter,
    transmission,
    seats,
    safety,
    minPrice,
    maxPrice,
    recent,
  ]);
  const brandCars = brand ? cars.filter((c) => c.brand === brand) : cars;
  const selected = brandCars[0];
  const results = useMemo(() => {
    let r = cars.filter(
      (c) =>
        (!q ||
          `${c.brand} ${c.model} ${c.variant} ${c.body} ${c.fuel} ${c.transmission}`
            .toLowerCase()
            .includes(q.toLowerCase())) &&
        (!brand || c.brand === brand) &&
        (!model || c.model === model) &&
        (!body || c.body === body) &&
        (!fuel || c.fuel === fuel) &&
        (!condition || c.condition === condition) &&
        (!locationFilter || c.location === locationFilter) &&
        (!transmission || c.transmission === transmission) &&
        (!seats || c.seats === Number(seats)) &&
        (!safety || c.safety === safety) &&
        (!minPrice || c.price >= Number(minPrice)) &&
        (!maxPrice || c.price <= Number(maxPrice)) &&
        (!recent || c.year >= 2026),
    );
    if (tab !== "All Models")
      r = r.filter((c) =>
        tab === "New Cars"
          ? c.condition === "new"
          : tab === "Used Cars"
            ? c.condition === "used"
            : tab === "Electric"
              ? c.fuel === "electric"
              : tab === "Hybrid"
                ? c.fuel === "hybrid"
                : tab === "Luxury"
                  ? c.category === "luxury"
                  : tab === "Performance"
                    ? c.category === "performance"
                    : c.body === tab.toLowerCase().replace("s", ""),
      );
    return [...r].sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : sort === "rating"
            ? b.rating - a.rating
            : sort === "mileage"
              ? parseFloat(b.range) - parseFloat(a.range)
              : b.year - a.year,
    );
  }, [
    q,
    brand,
    model,
    body,
    fuel,
    condition,
    locationFilter,
    transmission,
    seats,
    safety,
    minPrice,
    maxPrice,
    recent,
    sort,
    tab,
  ]);
  const brandList = useMemo(
    () =>
      cars
        .filter((c) => {
          if (brandGroup === "Indian Brands") return indian.includes(c.brand);
          if (brandGroup === "Luxury Brands") return luxury.includes(c.brand);
          if (brandGroup === "Electric Brands")
            return electric.includes(c.brand);
          if (brandGroup === "Performance Brands")
            return performance.includes(c.brand);
          if (brandGroup === "Popular Brands") return popular.includes(c.brand);
          return true;
        })
        .filter(
          (c) =>
            !q ||
            `${c.brand} ${c.model}`.toLowerCase().includes(q.toLowerCase()),
        )
        .filter((car,index,list)=>list.findIndex(x=>x.brand===car.brand)===index),
    [brandGroup, q],
  );
  const selectBrand = (b: string) => {
    setBrand(b);
    setQ("");
    setTab("All Models");
    const p = new URLSearchParams(window.location.search);
    p.set("brand", b);
    history.pushState(null, "", `/cars?${p}`);
    requestAnimationFrame(() =>
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      }),
    );
  };
  const clear = () => {
    setQ("");
    setBrand("");
    setModel("");
    setBody("");
    setFuel("");
    setCondition("");
    setLocation("");
    setTransmission("");
    setSeats("");
    setSafety("");
    setMinPrice("");
    setMaxPrice("");
    setRecent(false);
    setTab("All Models");
  };
  const active = Object.entries({
    brand,
    model,
    body,
    fuel,
    condition,
    locationFilter,
    transmission,
    seats,
    safety,
    minPrice,
    maxPrice,
    recent: recent ? "Recently launched" : "",
  }).filter(([, v]) => v);
  const tabs = [
    "All Models",
    "New Cars",
    "Used Cars",
    "SUVs",
    "Sedans",
    "Hatchbacks",
    "Electric",
    "Hybrid",
    "Luxury",
    "Performance",
  ].filter(
    (t) =>
      t === "All Models" ||
      (t === "New Cars" && brandCars.some((c) => c.condition === "new")) ||
      (t === "Used Cars" && brandCars.some((c) => c.condition === "used")) ||
      (t === "Electric" && brandCars.some((c) => c.fuel === "electric")) ||
      (t === "Hybrid" && brandCars.some((c) => c.fuel === "hybrid")) ||
      (t === "Luxury" && brandCars.some((c) => c.category === "luxury")) ||
      (t === "Performance" &&
        brandCars.some((c) => c.category === "performance")) ||
      brandCars.some((c) => `${c.body}s` === t.toLowerCase()),
  );
  return (
    <main className="explorer-page">
      <section className="explore-hero">
        <div className="explore-film">
          <video autoPlay muted loop playsInline preload="metadata" poster="/explore-cars-cinematic-poster.jpg" aria-label="Real performance cars driving together through a city">
            <source src="/explore-cars-cinematic.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="explore-hero-shade"/>
        <div className="explore-copy">
          <small>MAX CARS / DISCOVERY</small>
          <h1>Find the Car That Fits Your Life</h1>
          <p>
            Explore every brand, body style, fuel type and price range—all in
            one premium showroom.
          </p>
          <label>
            <span>Search by brand or model</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try Tata, BMW, electric SUV or Taycan"
            />
          </label>
          {q && (
            <div className="search-suggestions">
              {cars
                .filter((c) =>
                  `${c.brand} ${c.model}`
                    .toLowerCase()
                    .includes(q.toLowerCase()),
                )
                .slice(0, 5)
                .map((c) => (
                  <button key={c.id} onClick={() => selectBrand(c.brand)}>
                    <BrandLogo brand={c.brand} />
                    <span>
                      {c.brand} {c.model}
                      <small>
                        {c.body} · {short(c.price)}
                      </small>
                    </span>
                  </button>
                ))}
            </div>
          )}
          <nav>
            <button onClick={clear}>Explore All Cars</button>
            <a href="#brands">Search by Brand</a>
            <a href="/finance">Find Cars by Budget</a>
            <a href="/compare">Compare Cars</a>
          </nav>
          <em className="explore-media-credit">Performance-car film · Pexels / Taryn Elliott</em>
        </div>
      </section>
      <section className="brand-discovery" id="brands">
        <header>
          <small>02 / MARQUES</small>
          <h2>Browse Cars by Brand</h2>
          <p>
            Explore cars from the world’s leading automotive brands. Select a
            brand to view its available models, variants, prices and complete
            specifications.
          </p>
        </header>
        <div className="brand-search-row">
          <label>
            Search by brand or model
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search 31 automotive brands"
            />
          </label>
          <div>
            {categories.map((x) => (
              <button
                key={x}
                className={brandGroup === x ? "active" : ""}
                onClick={() => setBrandGroup(x)}
              >
                {x}
              </button>
            ))}
          </div>
        </div>
        <div className="premium-brand-grid">
          {brandList.map((c) => (
            <article
              className={brand === c.brand ? "active" : ""}
              key={c.brand}
            >
              <button
                className="brand-card-main"
                onClick={() => selectBrand(c.brand)}
                aria-pressed={brand === c.brand}
              >
                <figure>
                  <VehicleImage
                    src={c.image}
                    alt={`${c.brand} ${c.model}`}
                    sizes="(max-width:760px) 50vw, 25vw"
                  />
                  <BrandLogo brand={c.brand} />
                </figure>
                <div>
                  <small>
                    {c.variants} AVAILABLE VARIANT{c.variants === 1 ? "" : "S"}
                  </small>
                  <h3>{c.brand}</h3>
                  <p>
                    From {short(c.price)} · {c.body} · {c.fuel}
                  </p>
                  <span>Explore Brand →</span>
                </div>
              </button>
            </article>
          ))}
        </div>
      </section>
      {brand && selected && (
        <section className="brand-showcase">
          <figure>
            <VehicleImage
              src={selected.image}
              alt={`${brand} ${selected.model}`}
              sizes="(max-width:760px) 100vw, 60vw"
            />
          </figure>
          <div>
            <BrandLogo brand={brand} />
            <small>SELECTED MARQUE</small>
            <h2>{brand}</h2>
            <p>{brandIntro(brand)}</p>
            <dl>
              <span>
                <b>{short(Math.min(...brandCars.map((c) => c.price)))}</b>
                Starting price*
              </span>
              <span>
                <b>{brandCars.length}</b>Available model
                {brandCars.length === 1 ? "" : "s"}
              </span>
              <span>
                <b>{brandCars.filter((c) => c.fuel === "electric").length}</b>
                Electric
              </span>
              <span>
                <b>{selected.model}</b>Popular model
              </span>
            </dl>
            <a href={`/brands/${brand.toLowerCase().replaceAll(" ", "-")}`}>
              View All Models →
            </a>
            <button onClick={() => setBrand("")}>Clear Brand</button>
          </div>
        </section>
      )}
      {brand && (
        <nav className="brand-tabs" aria-label={`${brand} model categories`}>
          {tabs.map((x) => (
            <button
              className={tab === x ? "active" : ""}
              onClick={() => setTab(x)}
              key={x}
            >
              {x}
            </button>
          ))}
        </nav>
      )}
      <section className="inventory-tools" ref={resultsRef}>
        <header>
          <div>
            <small>03 / LIVE DISCOVERY</small>
            <h2>
              {brand ? `Vehicles from ${brand}` : "All available vehicles"}
            </h2>
          </div>
          <strong>
            {results.length} result{results.length === 1 ? "" : "s"}
          </strong>
        </header>
        <div className="smart-filters">
          <input
            aria-label="Search vehicles"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Brand, model, variant or feature"
          />
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="">All models</option>
            {cars
              .filter((c) => !brand || c.brand === brand)
              .map((c) => (
                <option key={c.id}>{c.model}</option>
              ))}
          </select>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="">New or used</option>
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
          <select value={fuel} onChange={(e) => setFuel(e.target.value)}>
            <option value="">All fuels</option>
            {["petrol", "diesel", "hybrid", "electric"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select value={body} onChange={(e) => setBody(e.target.value)}>
            <option value="">All body types</option>
            {[...new Set(cars.map((c) => c.body))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
          >
            <option value="">All transmissions</option>
            {[...new Set(cars.map((c) => c.transmission))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select value={seats} onChange={(e) => setSeats(e.target.value)}>
            <option value="">Any seating</option>
            {[...new Set(cars.map((c) => c.seats))].sort().map((x) => (
              <option key={x} value={x}>
                {x} seats
              </option>
            ))}
          </select>
          <select value={safety} onChange={(e) => setSafety(e.target.value)}>
            <option value="">Any safety rating</option>
            {[...new Set(cars.map((c) => c.safety))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <input
            aria-label="Minimum price"
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Minimum price ₹"
          />
          <input
            aria-label="Maximum price"
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Maximum price ₹"
          />
          <select
            value={locationFilter}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">All locations</option>
            {[...new Set(cars.map((c) => c.location))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <label className="recent-filter">
            <input
              type="checkbox"
              checked={recent}
              onChange={(e) => setRecent(e.target.checked)}
            />{" "}
            Recently launched
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="popular">Most Popular</option>
            <option value="recent">Recently Launched</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="mileage">Best Mileage / Range</option>
          </select>
        </div>
        <div className="filter-meta">
          <div>
            {active.map(([k, v]) => (
              <button
                key={k}
                onClick={() => {
                  if(k==="recent"){
                    setRecent(false);
                    return;
                  }
                  const setters: Record<string, React.Dispatch<React.SetStateAction<string>>> = {
                    brand: setBrand,
                    model: setModel,
                    body: setBody,
                    fuel: setFuel,
                    condition: setCondition,
                    location: setLocation,
                    transmission: setTransmission,
                    seats: setSeats,
                    safety: setSafety,
                    minPrice: setMinPrice,
                    maxPrice: setMaxPrice,
                  };
                  setters[k]?.("");
                }}
              >
                {k}: {String(v)} ×
              </button>
            ))}
            {active.length > 0 && (
              <button className="clear" onClick={clear}>
                Clear All Filters
              </button>
            )}
          </div>
          <div className="view-switch">
            {["grid", "list", "compact"].map((x) => (
              <button
                key={x}
                className={view === x ? "active" : ""}
                onClick={() => setView(x)}
              >
                {x === "compact" ? "Compare" : x[0].toUpperCase() + x.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {results.length ? (
          <div className={`explorer-results ${view}`}>
            {results.map((c) => (
              <CarCard key={c.id} car={c} view={view} onQuick={setQuick} />
            ))}
          </div>
        ) : (
          <div className="explorer-empty">
            <h3>No vehicles match every selected filter.</h3>
            <p>
              MAX CARS will never substitute a different model or manufacturer.
            </p>
            <div>
              <button onClick={clear}>Clear filters</button>
              <a href="/guides">View upcoming models</a>
              <a href="/notifications">Request an alert</a>
            </div>
          </div>
        )}
      </section>
      {quick && (
        <div
          className="quick-modal"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => e.target === e.currentTarget && setQuick(null)}
        >
          <article>
            <button
              className="modal-close"
              onClick={() => setQuick(null)}
              aria-label="Close quick view"
            >
              ×
            </button>
            <VehicleImage
              src={quick.image}
              alt={`${quick.brand} ${quick.model}`}
              loading="eager"
            />
            <BrandLogo brand={quick.brand} />
            <small>QUICK VIEW / {quick.year}</small>
            <h2>
              {quick.brand} {quick.model}
            </h2>
            <p>
              {quick.variant} · {quick.variants} variants
            </p>
            <strong>
              {short(quick.price)} <small>indicative ex-showroom</small>
            </strong>
            <dl>
              <span>
                {quick.power}
                <small>Power</small>
              </span>
              <span>
                {quick.range}
                <small>
                  {quick.fuel === "electric" ? "Range" : "Efficiency"}
                </small>
              </span>
              <span>
                {quick.safety}
                <small>Safety</small>
              </span>
            </dl>
            <nav>
              <a href={`/cars/${quick.slug}`}>View Full Details</a>
              <a href="/compare">Add to Compare</a>
            </nav>
          </article>
        </div>
      )}
    </main>
  );
}
