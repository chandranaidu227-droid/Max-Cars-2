"use client";

import { useEffect, useRef, useState } from "react";
import { cars, short } from "./data";
import {
  coloursFor,
  vehicleMedia,
  variantsFor,
  VehicleMedia,
} from "./vehicle-detail-data";
import VehicleImage from "./VehicleImage";
import {experienceFor,experienceHref} from "./vehicle-experience";

function ActionIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    cart: (
      <>
        <path d="M3 4h2l2 11h10l2-7H7" />
        <circle cx="9" cy="19" r="1.5" />
        <circle cx="17" cy="19" r="1.5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4m10-4v4M3 10h18" />
      </>
    ),
    money: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M15 8.5c-.8-.7-1.8-1-3-1-1.7 0-3 .8-3 2s1 1.8 3 2.5 3 1.2 3 2.5-1.3 2-3 2c-1.2 0-2.4-.4-3.2-1.2M12 5v14" />
      </>
    ),
    heart: (
      <path d="M20 5.8c-2-2-5.2-2-7.2 0L12 6.6l-.8-.8c-2-2-5.2-2-7.2 0s-2 5.2 0 7.2l8 7.2 8-7.2c2-2 2-5.2 0-7.2z" />
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="18" cy="19" r="2" />
        <path d="m8 11 8-5m-8 7 8 5" />
      </>
    ),
    message: (
      <>
        <path d="M4 5h16v12H8l-4 4z" />
        <path d="M8 9h8m-8 4h5" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 13.5v-3l-2-.7a7 7 0 0 0-.7-1.6l.9-1.9-2.1-2.1-1.9.9a7 7 0 0 0-1.7-.7L10.5 2h-3l-.7 2.4a7 7 0 0 0-1.6.7l-1.9-.9-2.1 2.1.9 1.9a7 7 0 0 0-.7 1.6L-1 10.5v3l2.4.7a7 7 0 0 0 .7 1.6l-.9 1.9 2.1 2.1 1.9-.9a7 7 0 0 0 1.6.7l.7 2.4h3l.7-2.4a7 7 0 0 0 1.7-.7l1.9.9 2.1-2.1-.9-1.9a7 7 0 0 0 .7-1.6z" transform="translate(3) scale(.75)" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function MissingMedia({ item }: { item: VehicleMedia }) {
  return (
    <div className="vd-missing">
      <strong aria-hidden="true">MAX CARS</strong>
      <strong>{item.angle}</strong>
      <span>
        Exact {item.brand} {item.model} image unavailable
      </span>
      <small>No substitute vehicle is displayed</small>
    </div>
  );
}

function VehicleGallery({
  records,
  title,
}: {
  records: VehicleMedia[];
  title: string;
}) {
  const [active, setActive] = useState(0),
    [full, setFull] = useState(false),
    [zoom, setZoom] = useState(1),
    [fit, setFit] = useState<"contain" | "cover">("contain");
  const touch = useRef(0),
    item = records[active];
  const move = (n: number) => {
    setActive((x) => (x + n + records.length) % records.length);
    setZoom(1);
  };
  useEffect(() => {
    setActive(0);
    setZoom(1);
  }, [records]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "Escape") setFull(false);
      if (e.key === "+") setZoom((x) => Math.min(2.5, x + 0.25));
      if (e.key === "-") setZoom((x) => Math.max(1, x - 0.25));
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [records.length]);
  const alternates = records
    .filter((x) => x.verified && x.imageUrl !== item.imageUrl)
    .map((x) => x.imageUrl!);
  const image = item.imageUrl ? (
    <VehicleImage
      src={item.imageUrl}
      alternates={alternates}
      alt={item.altText}
      loading="eager"
      draggable={false}
      style={{ objectFit: fit, transform: `scale(${zoom})` }}
      onDoubleClick={() => setZoom((x) => (x === 1 ? 1.6 : 1))}
    />
  ) : (
    <MissingMedia item={item} />
  );
  return (
    <section className="vd-gallery" aria-label={`${title} media gallery`}>
      <div
        className="vd-main"
        onTouchStart={(e) => (touch.current = e.changedTouches[0].clientX)}
        onTouchEnd={(e) => {
          const delta = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
        }}
      >
        {image}
        <span className="vd-angle">
          {item.angle} · {active + 1}/{records.length}
        </span>
        <button
          className="vd-prev"
          onClick={() => move(-1)}
          aria-label="Previous image"
        >
          ‹
        </button>
        <button
          className="vd-next"
          onClick={() => move(1)}
          aria-label="Next image"
        >
          ›
        </button>
        <div className="vd-image-tools">
          <button
            onClick={() =>
              setFit((x) => (x === "contain" ? "cover" : "contain"))
            }
          >
            {fit === "contain" ? "Fill frame" : "Show full car"}
          </button>
          <button onClick={() => setZoom((x) => (x === 1 ? 1.5 : 1))}>
            {zoom === 1 ? "Zoom" : "Reset zoom"}
          </button>
          <button onClick={() => setFull(true)}>View Full Screen</button>
        </div>
      </div>
      <div className="vd-thumbs">
        {records.map((m, i) => (
          <button
            className={i === active ? "active" : ""}
            key={`${m.vehicleId}-${m.angle}`}
            onClick={() => {
              setActive(i);
              setZoom(1);
            }}
            aria-label={`Show ${m.angle} image`}
          >
            {m.imageUrl ? (
              <VehicleImage
                src={m.imageUrl}
                alt={m.altText}
                sizes="(max-width:700px) 135px, 16vw"
              />
            ) : (
              <span>
                {m.angle === "Rear cabin"
                  ? "Not applicable · two-seat cabin"
                  : "Exact image unavailable"}
              </span>
            )}
            <b>{m.angle}</b>
          </button>
        ))}
      </div>
      <footer>
        <span>
          {records.filter((x) => x.verified).length} verified exact-model image
          {records.filter((x) => x.verified).length === 1 ? "" : "s"}
        </span>
        <button onClick={() => window.print()}>Print / Save Brochure</button>
      </footer>
      {full && (
        <div
          className="vd-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen vehicle gallery"
        >
          <button
            className="vd-close"
            onClick={() => setFull(false)}
            aria-label="Close fullscreen gallery"
          >
            ×
          </button>
          <div className="vd-lightbox-stage">
            {item.imageUrl ? (
              <VehicleImage
                src={item.imageUrl}
                alternates={alternates}
                alt={item.altText}
                loading="eager"
                style={{ objectFit: "contain", transform: `scale(${zoom})` }}
              />
            ) : (
              <MissingMedia item={item} />
            )}
          </div>
          <button
            className="vd-prev"
            onClick={() => move(-1)}
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            className="vd-next"
            onClick={() => move(1)}
            aria-label="Next image"
          >
            ›
          </button>
          <div className="vd-lightbox-tools">
            <button onClick={() => setZoom((x) => Math.max(1, x - 0.25))}>
              −
            </button>
            <b>
              {active + 1} / {records.length} · {item.angle}
            </b>
            <button onClick={() => setZoom((x) => Math.min(2.5, x + 0.25))}>
              +
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function VehicleDetailV2({ slug }: { slug: string }) {
  const car = cars.find((c) => c.slug === slug) || cars[0],
    variants = variantsFor(car),
    colours = coloursFor(car);
  const [variant, setVariant] = useState(
      () =>
        variants.find((v) => v.name === car.variant)?.name || variants[0].name,
    ),
    [colour, setColour] = useState(colours[0]),
    [interior, setInterior] = useState("Graphite interior"),
    [wheels, setWheels] = useState("Factory wheels"),
    [selectedLocation, setSelectedLocation] = useState(car.location),
    [saved, setSaved] = useState(false),
    [shared, setShared] = useState(false);
  const current = variants.find((v) => v.name === variant) || variants[0],
    media = (() => {
      const exact = vehicleMedia(car, colour)
        .filter((x) => x.vehicleId === car.id && x.verified && x.imageUrl)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return exact.length
        ? exact
        : vehicleMedia(car, colour)
            .filter((x) => x.vehicleId === car.id)
            .slice(0, 1);
    })();
  const onRoad =
    Math.round(
      (current.price * (car.fuel === "electric" ? 1.055 : 1.115)) / 1000,
    ) * 1000;
  useEffect(() => {
    setSaved(
      (
        JSON.parse(localStorage.getItem("max-favs") || "[]") as string[]
      ).includes(car.id),
    );
    const recent = JSON.parse(
      localStorage.getItem("max-recent") || "[]",
    ) as string[];
    localStorage.setItem(
      "max-recent",
      JSON.stringify(
        [car.id, ...recent.filter((x) => x !== car.id)].slice(0, 8),
      ),
    );
  }, [car.id]);
  const toggleSave = () => {
    const list = JSON.parse(
        localStorage.getItem("max-favs") || "[]",
      ) as string[],
      next = list.includes(car.id)
        ? list.filter((x) => x !== car.id)
        : [...list, car.id];
    localStorage.setItem("max-favs", JSON.stringify(next));
    setSaved(next.includes(car.id));
    dispatchEvent(new Event("max-state"));
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setShared(true);
    } catch {
      setShared(false);
    }
  };
  const reserve = () => {
    const cart = JSON.parse(localStorage.getItem("max-cart") || "[]") as Array<{
      carId: string;
    }>;
    if (!cart.some((x) => x.carId === car.id))
      localStorage.setItem(
        "max-cart",
        JSON.stringify([
          ...cart,
          {
            carId: car.id,
            variant,
            colour,
            interior,
            wheels,
            location: selectedLocation,
            reservation: 100000,
          },
        ]),
      );
    location.href = "/cart";
  };
  const byd = car.slug === "byd-sealion-7",
    artura = car.slug === "mclaren-artura";
  const specs = [
    [
      "Fuel / battery type",
      car.fuel === "electric"
        ? "Battery electric vehicle"
        : artura
          ? "Plug-in hybrid"
          : "Petrol / diesel / hybrid as listed",
    ],
    [
      "Engine / motor",
      byd
        ? variant === "Performance"
          ? "Dual electric motors"
          : "Permanent-magnet electric motor"
        : artura
          ? "3.0-litre twin-turbo V6 with axial-flux electric motor"
          : "Not available",
    ],
    ["Power", current.power],
    ["Torque", artura ? "720 Nm" : current.torque],
    ["Transmission", artura ? "8-speed SSG dual-clutch" : car.transmission],
    ["Drivetrain", current.drive],
    ["Mileage / range", current.range],
    ["Battery capacity", artura ? "7.4 kWh lithium-ion" : current.battery],
    [
      "Charging time",
      byd
        ? "10–80% in approximately 32 minutes (manufacturer EU specification)"
        : artura
          ? "AC charging; market specification varies"
          : current.charging,
    ],
    ["Seating capacity", `${car.seats}`],
    [
      "Boot space",
      byd
        ? "520 L · 1,789 L seats folded"
        : artura
          ? "160 L front luggage compartment"
          : "Not available",
    ],
    ["Ground clearance", "Not available"],
    [
      "Dimensions",
      byd
        ? "4,830 × 1,925 × 1,620 mm"
        : artura
          ? "4,539 × 1,913 × 1,193 mm"
          : "Not available",
    ],
    ["Safety rating", car.safety],
    [
      "Airbags",
      byd
        ? "9 airbags (European specification)"
        : "Manufacturer specification applies",
    ],
    [
      "Exterior features",
      byd
        ? "LED lighting · panoramic roof · flush door handles"
        : artura
          ? "LED lighting · dihedral doors · active rear spoiler"
          : "Not available",
    ],
    [
      "Interior features",
      byd
        ? "Heated and ventilated front seats · panoramic roof"
        : artura
          ? "Two-seat cockpit · Alcantara and leather trim · driver-focused controls"
          : "Not available",
    ],
    [
      "Infotainment",
      byd
        ? "15.6-inch rotating display · Android Auto · Apple CarPlay"
        : artura
          ? "McLaren infotainment and navigation system"
          : "Not available",
    ],
    [
      "Comfort",
      byd
        ? "Dual-zone climate control · electrically adjustable seats"
        : artura
          ? "Dual-zone climate control · configurable driving modes"
          : "Not available",
    ],
    [
      "Warranty",
      byd
        ? "6-year vehicle warranty; 8-year battery and motor warranty (market terms apply)"
        : "Manufacturer market terms apply",
    ],
  ];
  return (
    <main className="vehicle-detail-v2">
      <header className="vd-title">
        <a href="/cars">Explore Cars</a>
        <span>/</span>
        <a href={`/cars?brand=${encodeURIComponent(car.brand)}`}>{car.brand}</a>
        <span>/</span>
        <b>{car.model}</b>
        <small>
          {car.year} ·{" "}
          {car.condition === "new" ? "New vehicle" : "Pre-owned vehicle"}
        </small>
        <h1>
          {car.brand} {car.model}
        </h1>
        <p>
          {variant} · {selectedLocation}
        </p>
      </header>
      <VehicleGallery
        key={`${car.id}-${colour}`}
        records={media}
        title={`${car.brand} ${car.model}`}
      />
      <section className="vd-purchase">
        <div className="vd-summary">
          <small>INDICATIVE EX-SHOWROOM</small>
          <strong>{short(current.price)}</strong>
          <span>
            Estimated on-road in {selectedLocation}: <b>{short(onRoad)}</b>
          </span>
          <p>
            Final price, taxes, insurance, stock and waiting period require
            dealer confirmation.
          </p>
          <dl>
            <div>
              <dt>Power</dt>
              <dd>{current.power}</dd>
            </div>
            <div>
              <dt>{car.fuel === "electric" ? "Range" : "Efficiency"}</dt>
              <dd>{current.range}</dd>
            </div>
            <div>
              <dt>Drive</dt>
              <dd>{current.drive}</dd>
            </div>
            <div>
              <dt>Rating</dt>
              <dd>{car.rating}/5 users</dd>
            </div>
          </dl>
        </div>
        <div className="vd-selectors">
          <label>
            Variant
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
            >
              {variants.map((x) => (
                <option key={x.name}>{x.name}</option>
              ))}
            </select>
          </label>
          <label>
            Exterior colour
            <select value={colour} onChange={(e) => setColour(e.target.value)}>
              {colours.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Interior
            <select
              value={interior}
              onChange={(e) => setInterior(e.target.value)}
            >
              <option>Graphite interior</option>
              <option>Pearl interior</option>
            </select>
          </label>
          <label>
            Wheels
            <select value={wheels} onChange={(e) => setWheels(e.target.value)}>
              <option>Factory wheels</option>
              <option>Performance wheels</option>
            </select>
          </label>
          <label>
            Location
            <select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                localStorage.setItem("max-location", e.target.value);
              }}
            >
              {["Hyderabad", "Mumbai", "Delhi", "Bengaluru", "Chennai"].map(
                (x) => (
                  <option key={x}>{x}</option>
                ),
              )}
            </select>
          </label>
          <small>{current.availability}</small>
        </div>
        <aside className="vd-actions">
          <button className="primary" onClick={reserve}>
            <ActionIcon name="cart" />
            Reserve / Add to Cart
          </button>
          <a href={`/dashboard/bookings?car=${car.slug}`}>
            <ActionIcon name="calendar" />
            Book Test Drive
          </a>
          {experienceFor(car).kind!=="photography"&&<a href={experienceHref(car)}>
            <ActionIcon name="settings" />
            {experienceFor(car).label}
          </a>}
          <a href={`/finance?car=${car.id}&price=${current.price}`}>
            <ActionIcon name="money" />
            Get On-Road Price
          </a>
          <a href={`/finance?car=${car.id}&price=${current.price}#emi`}>
            <ActionIcon name="money" />
            Calculate EMI
          </a>
          <button className={saved ? "selected" : ""} onClick={toggleSave}>
            <ActionIcon name="heart" />
            {saved ? "Saved Vehicle" : "Save Vehicle"}
          </button>
          <button onClick={share}>
            <ActionIcon name="share" />
            {shared ? "Link Copied" : "Share"}
          </button>
          <a href={`/support?topic=Vehicle%20Details&vehicle=${car.slug}`}>
            <ActionIcon name="message" />
            Send Enquiry
          </a>
        </aside>
      </section>
      <section className="vd-specs">
        <header>
          <small>COMPLETE VEHICLE INFORMATION</small>
          <h2>Everything available for this exact record.</h2>
          <p>
            Unavailable fields are labelled instead of being estimated or copied
            from another variant.
          </p>
        </header>
        <dl>
          {specs.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd className={value === "Not available" ? "unavailable" : ""}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="vd-features">
        <article>
          <small>ADVANTAGES</small>
          <h2>What stands out</h2>
          <ul>
            {(byd
              ? [
                  "Strong performance with all-wheel drive option",
                  "Spacious five-seat cabin and 520-litre boot",
                  "Large rotating infotainment display",
                  "Blade Battery and comprehensive assistance systems",
                ]
              : [
                  "Vehicle-specific specification is presented without substituted data",
                  "Configuration remains linked to this vehicle ID",
                ]
            ).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </article>
        <article>
          <small>CONSIDERATIONS</small>
          <h2>What to verify</h2>
          <ul>
            {(byd
              ? [
                  "Real-world range varies with traffic, weather and driving style",
                  "Rear visibility is limited by the coupé-SUV roofline",
                  "Local stock, pricing and waiting period require confirmation",
                ]
              : [
                  "Several detailed specifications are not available in the verified catalogue",
                  "Confirm final specification, warranty and availability before purchase",
                ]
            ).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </article>
        <article className="vd-ratings">
          <small>RATINGS</small>
          <h2>{car.rating}/5</h2>
          <p>User catalogue rating</p>
          <b>Expert rating: Not available</b>
        </article>
      </section>
      {byd && (
        <footer className="vd-source">
          BYD Sealion 7 technical and media references last checked 24 Aug 2026.
          India pricing is indicative.{" "}
          <a href="https://bydautoindia.com/bydsealion7">BYD India</a> ·{" "}
          <a href="https://www.byd.com/eu/news-list/byd-introduces-sporty-byd-sealion-7-to-european-market">
            BYD product release
          </a>
        </footer>
      )}
      {artura && (
        <footer className="vd-source">
          McLaren Artura exterior photography: Damian B Oh; cabin photography:
          Aos.1905. Licensed CC BY-SA 4.0 via{" "}
          <a href="https://commons.wikimedia.org/wiki/Category:McLaren_Artura">
            Wikimedia Commons
          </a>
          . Vehicle specifications:{" "}
          <a href="https://www.mclaren.com/cars/gl_en/artura">McLaren Artura</a>
          . Media and data checked 24 Aug 2026.
        </footer>
      )}
    </main>
  );
}
