"use client";

import { useEffect, useMemo, useState } from "react";

export type AutomotiveCentre = {
  id: string;
  name: string;
  city: string;
  state: string;
  postcode: string;
  address: string;
  distanceKm: number;
  rating: number;
  hours: string;
  services: string[];
  brands: string[];
  status: "Open" | "Closed";
  phone: string;
  image: string;
  map: { x: number; y: number };
  description: string;
};

export const automotiveCentres: AutomotiveCentre[] = [
  {
    id: "hyd-jubilee",
    name: "MAX CARS Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    postcode: "500033",
    address: "Road No. 36, Jubilee Hills, Hyderabad",
    distanceKm: 2.4,
    rating: 4.7,
    hours: "Mon–Sat · 9:30 AM–7:30 PM",
    services: [
      "Test drive",
      "Inspection",
      "Service centre",
      "EV charging",
      "Delivery",
    ],
    brands: ["Porsche", "BMW", "Mercedes-Benz"],
    status: "Open",
    phone: "+914040000001",
    image: "/max-cars-luxury-city-poster.jpg",
    map: { x: 28, y: 35 },
    description:
      "A premium discovery and ownership hub for test drives, verified inspections and coordinated after-sales support.",
  },
  {
    id: "mum-worli",
    name: "MAX CARS Worli",
    city: "Mumbai",
    state: "Maharashtra",
    postcode: "400018",
    address: "Dr Annie Besant Road, Worli, Mumbai",
    distanceKm: 8.7,
    rating: 4.6,
    hours: "Mon–Sat · 9:30 AM–7:30 PM",
    services: ["Test drive", "Inspection", "Service centre", "Delivery"],
    brands: ["Audi", "Lamborghini", "Land Rover"],
    status: "Open",
    phone: "+912240000002",
    image: "/max-cars-inspection-poster.jpg",
    map: { x: 58, y: 54 },
    description:
      "Vehicle discovery, inspection and delivery coordination in central Mumbai.",
  },
  {
    id: "blr-lavelle",
    name: "MAX CARS Lavelle Road",
    city: "Bengaluru",
    state: "Karnataka",
    postcode: "560001",
    address: "Lavelle Road, Bengaluru",
    distanceKm: 12.1,
    rating: 4.8,
    hours: "Mon–Sat · 10:00 AM–7:00 PM",
    services: ["Test drive", "EV charging", "Service centre", "Delivery"],
    brands: ["BMW", "Mercedes-Benz", "Audi"],
    status: "Open",
    phone: "+918040000003",
    image: "/max-cars-real-drift-poster.jpg",
    map: { x: 72, y: 31 },
    description:
      "An urban showroom and EV support point with appointment-led test drives.",
  },
  {
    id: "del-aerocity",
    name: "MAX CARS Aerocity",
    city: "Delhi",
    state: "Delhi",
    postcode: "110037",
    address: "Aerocity, New Delhi",
    distanceKm: 18.2,
    rating: 4.5,
    hours: "Mon–Sat · 10:00 AM–7:00 PM",
    services: ["Test drive", "Inspection", "Service centre", "EV charging"],
    brands: ["Tata", "BYD", "Volvo"],
    status: "Closed",
    phone: "+911140000004",
    image: "/max-cars-porsche-drift-poster.jpg",
    map: { x: 44, y: 70 },
    description:
      "Inspection, EV charging and appointment support close to Delhi Aerocity.",
  },
];

const serviceFilters = [
  "All services",
  "Test drive",
  "Inspection",
  "Service centre",
  "EV charging",
];
const remember = (key: string, value: string) => {
  const prior = JSON.parse(localStorage.getItem(key) || "[]") as string[];
  localStorage.setItem(
    key,
    JSON.stringify([value, ...prior.filter((x) => x !== value)].slice(0, 8)),
  );
};

function MapPanel({
  items,
  selected,
  onSelect,
  full,
  setFull,
}: {
  items: AutomotiveCentre[];
  selected: string;
  onSelect: (id: string) => void;
  full: boolean;
  setFull: (x: boolean) => void;
}) {
  const [zoom,setZoom]=useState(1);
  return (
    <div
      className={`location-map-v3 ${full ? "fullscreen" : ""}`}
      aria-label="Synchronized location map"
    >
      <div className="map-viewport" style={{transform:`scale(${zoom})`}}>
        <div className="map-road a" />
        <div className="map-road b" />
        <div className="map-road c" />
        {items.map((c, i) => (
          <button
            key={c.id}
            className={selected === c.id ? "active" : ""}
            style={{ left: `${c.map.x}%`, top: `${c.map.y}%` }}
            onClick={() => onSelect(c.id)}
            aria-label={`Marker ${i + 1}: ${c.name}`}
          >
            <b>{i + 1}</b>
          </button>
        ))}
      </div>
      <div className="map-tools">
        <button onClick={() => setFull(!full)}>
          {full ? "Exit Full Screen" : "Full-Screen Map"}
        </button>
        <button aria-label="Zoom in" disabled={zoom>=1.6} onClick={()=>setZoom(value=>Math.min(1.6,Number((value+.2).toFixed(1))))}>＋</button>
        <button aria-label="Zoom out" disabled={zoom<=1} onClick={()=>setZoom(value=>Math.max(1,Number((value-.2).toFixed(1))))}>−</button>
      </div>
      <small>
        Interactive map preview · directions open in your map provider
      </small>
    </div>
  );
}

export default function LocationExperienceV3() {
  const [q, setQ] = useState(""),
    [state, setState] = useState(""),
    [distance, setDistance] = useState("25"),
    [brand, setBrand] = useState(""),
    [service, setService] = useState("All services"),
    [openNow, setOpenNow] = useState(false),
    [minRating, setMinRating] = useState("0"),
    [selected, setSelected] = useState(automotiveCentres[0].id),
    [view, setView] = useState<"split" | "list" | "map">("split"),
    [notice, setNotice] = useState(""),
    [fullMap, setFullMap] = useState(false),
    [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    const preferred = localStorage.getItem("max-location") || "";
    setQ(preferred);
    setSaved(JSON.parse(localStorage.getItem("max-saved-locations") || "[]"));
  }, []);
  const visible = useMemo(
    () =>
      automotiveCentres.filter(
        (c) =>
          (!q ||
            `${c.name} ${c.city} ${c.postcode} ${c.address}`
              .toLowerCase()
              .includes(q.toLowerCase())) &&
          (!state || c.state === state) &&
          c.distanceKm <= Number(distance) &&
          (!brand || c.brands.includes(brand)) &&
          (service === "All services" || c.services.includes(service)) &&
          (!openNow || c.status === "Open") &&
          c.rating >= Number(minRating),
      ),
    [q, state, distance, brand, service, openNow, minRating],
  );
  useEffect(() => {
    if (visible.length && !visible.some((c) => c.id === selected))
      setSelected(visible[0].id);
  }, [visible, selected]);
  const choose = (id: string) => {
    setSelected(id);
    if (view !== "map")
      document
        .getElementById(`location-card-${id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  const locate = () => {
    if (!navigator.geolocation) {
      setNotice("Location is not supported. Enter a city or postcode instead.");
      return;
    }
    setNotice("Requesting location permission…");
    navigator.geolocation.getCurrentPosition(
      () => {
        setQ("Hyderabad");
        setState("Telangana");
        setSelected("hyd-jubilee");
        setNotice(
          "Approximate Hyderabad results shown. Precise coordinates are not stored.",
        );
      },
      () =>
        setNotice(
          "Permission was not granted. Search by city or postcode instead.",
        ),
      { enableHighAccuracy: false, timeout: 7000 },
    );
  };
  const savePreferred = () => {
    const value =
      q || automotiveCentres.find((c) => c.id === selected)?.city || "";
    localStorage.setItem("max-location", value);
    remember("max-recent-locations", value);
    setNotice(`${value} saved as your preferred location.`);
  };
  const saveCentre = (id: string) => {
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    setSaved(next);
    localStorage.setItem("max-saved-locations", JSON.stringify(next));
    dispatchEvent(new Event("max-state"));
  };
  const reset = () => {
    setQ("");
    setState("");
    setDistance("25");
    setBrand("");
    setService("All services");
    setOpenNow(false);
    setMinRating("0");
    setNotice("");
  };
  return (
    <main className="location-page-v3">
      <section className="location-hero-v3">
        <figure className="location-video location-image-hero">
          <img src="/max-cars-luxury-city-poster.jpg" alt="Premium car arriving in a modern city near automotive services"/>
          <div className="location-image-features"><span><b>Test drives</b>Nearby appointments</span><span><b>Service</b>Verified centres</span><span><b>EV charging</b>Local charging points</span></div>
          <figcaption>City arrival and automotive-services discovery</figcaption>
        </figure>
        <div className="location-hero-copy">
          <small>LOCATION / OWNERSHIP NETWORK</small>
          <h1>Find Automotive Services Near You</h1>
          <p>
            Discover vehicles, test drives, inspections, service centres and
            charging locations in your area.
          </p>
          <div className="hero-location-actions">
            <button onClick={locate}>Use My Current Location</button>
            <a href="#location-search">Search Manually</a>
          </div>
          <em>
            Location permission is requested only when you choose to use it.
          </em>
        </div>
      </section>
      <section className="location-service-rail" aria-label="Available automotive services">
        <article><b>01</b><span>Test drives</span><small>Choose a vehicle and appointment centre</small></article>
        <article><b>02</b><span>Vehicle inspections</span><small>Schedule a pre-sale condition review</small></article>
        <article><b>03</b><span>Service centres</span><small>Find brand-supported ownership help</small></article>
        <article><b>04</b><span>EV charging</span><small>Filter nearby charging destinations</small></article>
        <article><b>05</b><span>Delivery areas</span><small>Check estimated local fulfilment</small></article>
      </section>
      <section className="location-search-v3" id="location-search">
        <header>
          <div>
            <small>01 / SET YOUR AREA</small>
            <h2>Where should we look?</h2>
          </div>
          <p>
            Search manually or use approximate device location. Demo facility
            data and estimated distances are clearly labelled.
          </p>
        </header>
        <div className="location-form-grid">
          <label>
            Enter city
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Hyderabad"
            />
          </label>
          <label>
            Enter postcode
            <input
              value={q.match(/^\d/) ? q : ""}
              onChange={(e) => setQ(e.target.value)}
              inputMode="numeric"
              placeholder="500033"
            />
          </label>
          <label>
            Select state
            <select value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">All states</option>
              {[...new Set(automotiveCentres.map((c) => c.state))].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <button onClick={savePreferred}>Save Preferred Location</button>
          <button className="quiet" onClick={reset}>
            Change / Clear
          </button>
        </div>
        {notice && (
          <p className="location-notice-v3" role="status">
            {notice}
          </p>
        )}
      </section>
      <section className="location-discovery-v3">
        <header>
          <div>
            <small>02 / LOCAL DISCOVERY</small>
            <h2>
              {q
                ? `Automotive services near ${q}`
                : "Explore the MAX CARS network"}
            </h2>
            <p>
              {visible.length} estimated result{visible.length === 1 ? "" : "s"}{" "}
              · selected area and filters applied
            </p>
          </div>
          <nav>
            <button
              className={view === "split" ? "active" : ""}
              onClick={() => setView("split")}
            >
              List + Map
            </button>
            <button
              className={view === "list" ? "active" : ""}
              onClick={() => setView("list")}
            >
              List
            </button>
            <button
              className={view === "map" ? "active" : ""}
              onClick={() => setView("map")}
            >
              Map
            </button>
          </nav>
        </header>
        <div className="location-filter-grid">
          <label>
            Distance
            <select
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            >
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km</option>
              <option value="100">Within 100 km</option>
            </select>
          </label>
          <label>
            Brand
            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">All brands</option>
              {[...new Set(automotiveCentres.flatMap((c) => c.brands))]
                .sort()
                .map((x) => (
                  <option key={x}>{x}</option>
                ))}
            </select>
          </label>
          <label>
            Service type
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              {serviceFilters.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Minimum rating
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="0">Any rating</option>
              <option value="4.6">4.6+</option>
              <option value="4.8">4.8+</option>
            </select>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={openNow}
              onChange={(e) => setOpenNow(e.target.checked)}
            />{" "}
            Open now
          </label>
          <button onClick={reset}>Clear filters</button>
        </div>
        <div className={`location-layout-v3 ${view}`}>
          {view !== "list" && (
            <MapPanel
              items={visible}
              selected={selected}
              onSelect={choose}
              full={fullMap}
              setFull={setFullMap}
            />
          )}{" "}
          {view !== "map" && (
            <div className="location-card-list-v3">
              {visible.map((c, i) => (
                <article
                  id={`location-card-${c.id}`}
                  key={c.id}
                  className={selected === c.id ? "active" : ""}
                  onClick={() => setSelected(c.id)}
                >
                  <img
                    src={c.image}
                    alt={`${c.name} automotive facility reference`}
                  />
                  <div className="location-card-body">
                    <header>
                      <span>
                        MARKER {i + 1} · {c.distanceKm} KM
                      </span>
                      <b className={c.status === "Open" ? "open" : "closed"}>
                        {c.status}
                      </b>
                    </header>
                    <h3>{c.name}</h3>
                    <p>
                      {c.address} · {c.postcode}
                    </p>
                    <div className="location-meta">
                      <span>
                        <b>{c.rating}/5</b>Rating
                      </span>
                      <span>
                        <b>{c.hours}</b>Opening hours
                      </span>
                      <span>
                        <b>{c.phone}</b>Demo contact
                      </span>
                    </div>
                    <ul>
                      {c.services.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                    <p className="location-brands">
                      Brands: {c.brands.join(" · ")}
                    </p>
                    <nav>
                      <a href={`/location/${c.id}`}>View Details</a>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(c.address)}`}
                      >
                        Get Directions
                      </a>
                      <a href={`tel:${c.phone}`}>Call</a>
                      <a href={`/dashboard/bookings?centre=${c.id}`}>
                        Book Test Drive
                      </a>
                      <a href={`/sell?centre=${c.id}#inspection`}>
                        Schedule Inspection
                      </a>
                      <a href={`/support?topic=Location&centre=${c.id}`}>
                        Send Enquiry
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveCentre(c.id);
                        }}
                      >
                        {saved.includes(c.id) ? "Saved ✓" : "Save Location"}
                      </button>
                    </nav>
                  </div>
                </article>
              ))}
              {!visible.length && (
                <div className="location-empty-v3">
                  <h3>No locations match every filter.</h3>
                  <p>
                    Clear filters to view the complete list. MAX CARS will not
                    invent live availability.
                  </p>
                  <button onClick={reset}>Clear filters</button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <p className="location-legal">
        Demo facilities, phone numbers, distances, availability and waiting
        periods are illustrative estimates. Confirm details before travel,
        booking or payment.
      </p>
    </main>
  );
}

export function LocationDetailV3({ id }: { id: string }) {
  const c = automotiveCentres.find((x) => x.id === id);
  if (!c)
    return (
      <main className="location-detail-v3 missing">
        <h1>Location not found.</h1>
        <a href="/location">Return to Location</a>
      </main>
    );
  return (
    <main className="location-detail-v3">
      <section>
        <img src={c.image} alt={`${c.name} facility`} />
        <div>
          <small>LOCATION / {c.city.toUpperCase()}</small>
          <h1>{c.name}</h1>
          <p>{c.description}</p>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(c.address)}`}
          >
            Get Directions
          </a>
        </div>
      </section>
      <div className="location-detail-grid">
        <article>
          <h2>Visit information</h2>
          <dl>
            <div>
              <dt>Address</dt>
              <dd>
                {c.address}, {c.state} {c.postcode}
              </dd>
            </div>
            <div>
              <dt>Opening hours</dt>
              <dd>{c.hours}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>{c.phone} · demo number</dd>
            </div>
            <div>
              <dt>Rating</dt>
              <dd>{c.rating}/5 · illustrative</dd>
            </div>
          </dl>
        </article>
        <article>
          <h2>Available services</h2>
          <ul>
            {c.services.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p>Supported brands: {c.brands.join(", ")}</p>
        </article>
        <MapPanel
          items={[c]}
          selected={c.id}
          onSelect={() => {}}
          full={false}
          setFull={() => {}}
        />
      </div>
      <nav>
        <a href={`/dashboard/bookings?centre=${c.id}`}>Book Test Drive</a>
        <a href={`/sell?centre=${c.id}#inspection`}>Schedule Inspection</a>
        <a href={`/support?topic=Location&centre=${c.id}`}>Send Enquiry</a>
        <a href="/location">Back to all locations</a>
      </nav>
    </main>
  );
}
