"use client";
import { useEffect, useMemo, useState } from "react";
import { cars, Car, money, short } from "./data";
const notifyState = () => dispatchEvent(new Event("max-state"));
function useSaved(key: string, seed: string[] = []) {
  const [value, setValue] = useState<string[]>(seed);
  useEffect(() => {
    try {
      setValue(JSON.parse(localStorage.getItem(key) || JSON.stringify(seed)));
    } catch {}
  }, [key]);
  const save = (v: string[]) => {
    setValue(v);
    localStorage.setItem(key, JSON.stringify(v));
    notifyState();
  };
  return [value, save] as const;
}
export function HomeExperience() {
  const [hero, setHero] = useState(cars[0]),
    [signed, setSigned] = useState(false);
  useEffect(() => setSigned(!!localStorage.getItem("max-session")), []);
  return (
    <>
      <section
        className="hero crystal-hero calm"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(3,6,17,.94),rgba(3,6,17,.12)),url(${hero.image})`,
        }}
      >
        <div>
          <p className="eyebrow">MAX CARS / DIGITAL PERFORMANCE ATELIER</p>
          <h1>
            The road,
            <br />
            <em>reimagined.</em>
          </h1>
          <p>
            A considered digital showroom for exceptional cars—discover, compare
            and configure with absolute clarity.
          </p>
          <section className="actions">
            {signed ? (
              <a className="red" href="/cars">
                Explore the collection →
              </a>
            ) : (
              <>
                <a className="red" href="login">
                  Enter showroom
                </a>
                <a className="ghost" href="/location">
                  Find nearby services
                </a>
              </>
            )}
          </section>
          <div className="hero-proof">
            <span>
              <b>01</b> Verified specifications
            </span>
            <span>
              <b>02</b> Connected ownership
            </span>
            <span>
              <b>03</b> Private configuration
            </span>
          </div>
        </div>
        <aside>
          {[
            ["MODEL", hero.model],
            ["POWER", hero.power],
            [hero.fuel === "electric" ? "RANGE" : "EFFICIENCY", hero.range],
          ].map((x) => (
            <span key={x[0]}>
              <b>{x[1]}</b>
              <small>{x[0]}</small>
            </span>
          ))}
        </aside>
        <div className="picker">
          {cars.slice(0, 4).map((c, i) => (
            <button
              className={hero.id === c.id ? "active" : ""}
              key={c.id}
              onClick={() => setHero(c)}
            >
              <small>0{i + 1}</small>
              {c.model}
            </button>
          ))}
        </div>
        <div className="hero-index">
          <span>FEATURED / {hero.brand.toUpperCase()}</span>
          <b>
            {String(cars.findIndex((c) => c.id === hero.id) + 1).padStart(
              2,
              "0",
            )}
            <i>/04</i>
          </b>
        </div>
      </section>
      <section className="trust-rail">
        <span>CURATED INVENTORY</span>
        <span>INDIA-SPECIFIC PRICING</span>
        <span>CONFIGURATION WORKSPACE</span>
        <span>DEALER-CONFIRMED FULFILMENT</span>
      </section>
      <form className="finder" action="/cars">
        <label>
          <small>01 / CONDITION</small>
          <select name="condition">
            <option value="">New & used</option>
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
        </label>
        <label>
          <small>02 / BRAND</small>
          <select name="brand">
            <option value="">All brands</option>
            {[...new Set(cars.map((c) => c.brand))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          <small>03 / BODY</small>
          <select name="body">
            <option value="">All body types</option>
            <option>suv</option>
            <option>sedan</option>
            <option>coupe</option>
          </select>
        </label>
        <label>
          <small>04 / FUEL</small>
          <select name="fuel">
            <option value="">All fuels</option>
            <option>electric</option>
            <option>petrol</option>
            <option>diesel</option>
          </select>
        </label>
        <button className="red">Find my car →</button>
      </form>
      <section className="block">
        <Title
          over="CURATED FOR YOU"
          title="Extraordinary machines. One destination."
        />
        <div className="grid">
          {cars.slice(0, 3).map((c) => (
            <VehicleCard key={c.id} car={c} />
          ))}
        </div>
      </section>
      <section className="professional-matrix">
        <article className="matrix-lead">
          <p className="eyebrow">THE MAX CARS STANDARD</p>
          <h2>
            More signal.
            <br />
            <em>Less sales noise.</em>
          </h2>
          <p>
            Every interaction is designed around a better decision—from the
            first search to a dealer-confirmed handover.
          </p>
          <a href="/cars">Discover the standard →</a>
        </article>
        <article>
          <b>01</b>
          <h3>Evidence before emotion</h3>
          <p>
            Clear specifications, regional pricing labels and unavailable data
            called out honestly.
          </p>
        </article>
        <article>
          <b>02</b>
          <h3>Configuration with continuity</h3>
          <p>
            Your selected car, finish and options remain synchronized through
            quotation and checkout.
          </p>
        </article>
        <article>
          <b>03</b>
          <h3>Human support, connected</h3>
          <p>
            Move from discovery to test drive, dealer and support without losing
            context.
          </p>
        </article>
      </section>
      <section className="collections">
        <p className="eyebrow">FEATURE MATRIX</p>
        <h2>
          Every road has a <em>perfect match.</em>
        </h2>
        <div>
          {[
            ["Electric Future", "A cleaner pulse", "/cars?fuel=electric"],
            ["Luxury Icons", "Crafted calm", "/cars?category=luxury"],
            [
              "Performance Machines",
              "Unfiltered response",
              "/cars?category=performance",
            ],
            ["Family SUVs", "Space, resolved", "/cars?body=suv"],
            ["Certified Used", "Inspected confidence", "/cars?condition=used"],
          ].map((x) => (
            <a key={x[0]} href={x[2]}>
              <b>{x[0]}</b>
              <small>{x[1]}</small>
              <span>Explore ↗</span>
            </a>
          ))}
        </div>
      </section>
      <section className="home-cta">
        <span>YOUR NEXT DRIVE STARTS HERE</span>
        <h2>
          Choose with confidence.
          <br />
          Drive without compromise.
        </h2>
        <div>
          <a className="red" href="/cars">
            Explore cars →
          </a>
          <a className="ghost" href="/dashboard/bookings">
            Book a test drive
          </a>
        </div>
      </section>
    </>
  );
}
export function InventoryExperience() {
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(location.search)
      : new URLSearchParams();
  const [q, setQ] = useState(params.get("q") || ""),
    [fuel, setFuel] = useState(params.get("fuel") || ""),
    [condition, setCondition] = useState(params.get("condition") || ""),
    [sort, setSort] = useState(params.get("sort") || "featured");
  const results = useMemo(
    () =>
      cars
        .filter(
          (c) =>
            (!q ||
              `${c.brand} ${c.model} ${c.category}`
                .toLowerCase()
                .includes(q.toLowerCase())) &&
            (!fuel || c.fuel === fuel) &&
            (!condition || c.condition === condition),
        )
        .sort((a, b) =>
          sort === "low"
            ? a.price - b.price
            : sort === "high"
              ? b.price - a.price
              : 0,
        ),
    [q, fuel, condition, sort],
  );
  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (fuel) p.set("fuel", fuel);
    if (condition) p.set("condition", condition);
    if (sort !== "featured") p.set("sort", sort);
    history.replaceState(null, "", `/cars${p.size ? `?${p}` : ""}`);
  }, [q, fuel, condition, sort]);
  return (
    <Page
      over="EXPLORE CARS"
      title="Your next drive, precisely filtered."
      sub={`${results.length} verified demo vehicles · Indian ex-showroom pricing`}
    >
      <section className="inventory-workspace">
        <aside className="filter-rail">
          <h3>Refine results</h3>
          <label>
            Search
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Brand or model"
            />
          </label>
          <label>
            Condition
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="">All</option>
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </label>
          <label>
            Fuel
            <select value={fuel} onChange={(e) => setFuel(e.target.value)}>
              <option value="">All</option>
              <option value="electric">Electric</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
            </select>
          </label>
          <button
            onClick={() => {
              setQ("");
              setFuel("");
              setCondition("");
              setSort("featured");
            }}
          >
            Clear all
          </button>
        </aside>
        <div>
          <div className="resultbar">
            <span>
              <b>{results.length}</b> results
            </span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
          {results.length ? (
            <div className="grid">
              {results.map((c) => (
                <VehicleCard key={c.id} car={c} />
              ))}
            </div>
          ) : (
            <Empty
              title="No cars match this combination."
              action={() => {
                setQ("");
                setFuel("");
                setCondition("");
              }}
            />
          )}
        </div>
      </section>
    </Page>
  );
}
export function VehicleExperience({ slug }: { slug: string }) {
  const car = cars.find((c) => c.slug === slug) || cars[0],
    [favs, setFavs] = useSaved("max-favs");
  useEffect(() => {
    const r = JSON.parse(localStorage.getItem("max-recent") || "[]").filter(
      (x: string) => x !== car.id,
    );
    localStorage.setItem(
      "max-recent",
      JSON.stringify([car.id, ...r].slice(0, 8)),
    );
  }, [car.id]);
  const add = () => {
    const cart = JSON.parse(localStorage.getItem("max-cart") || "[]");
    if (!cart.some((x: { carId: string }) => x.carId === car.id))
      cart.push({
        carId: car.id,
        colour: "Ice Silver",
        wheels: "21″ Aero",
        interior: "Graphite leather",
        dealer: `MAX CARS ${car.location}`,
        reservation: 100000,
      });
    localStorage.setItem("max-cart", JSON.stringify(cart));
    location.href = "/cart";
  };
  return (
    <Page
      over={`${car.brand.toUpperCase()} / ${car.year}`}
      title={`${car.model} ${car.variant}`}
      sub={`Verified demo record · ${car.location}`}
    >
      <VehicleGallery car={car} />
      <section className="detailhero compact-detail">
        <div>
          <h3>
            {car.condition === "new" ? "New vehicle" : "Pre-owned vehicle"}
          </h3>
          <strong>{short(car.price)}</strong>
          <small>Indicative ex-showroom · {car.location}</small>
          <dl>
            {[
              ["Power", car.power],
              [car.fuel === "electric" ? "Range" : "Efficiency", car.range],
              ["Drivetrain", car.drive],
            ].map((x) => (
              <div key={x[0]}>
                <dt>{x[0]}</dt>
                <dd>{x[1]}</dd>
              </div>
            ))}
          </dl>
          <button className="red wide" onClick={add}>
            Reserve / Add to Cart →
          </button>
          <a className="ghost wide" href={`/dashboard/bookings?car=${car.slug}`}>
            Book a test drive
          </a>
        </div>
        <div className="detail-actions">
          <button
            onClick={() =>
              setFavs(
                favs.includes(car.id)
                  ? favs.filter((x) => x !== car.id)
                  : favs.concat(car.id),
              )
            }
          >
            {favs.includes(car.id) ? "♥ Saved" : "♡ Save vehicle"}
          </button>
          <button onClick={() => navigator.clipboard?.writeText(location.href)}>
            ↗ Share
          </button>
          <button
            onClick={() => {
              localStorage.setItem("max-book-car", car.id);
              location.href = "/dashboard/bookings";
            }}
          >
            ◷ Test drive
          </button>
          <a href={`/finance?car=${car.id}`}>₹ EMI calculator</a>
        </div>
      </section>
      <section className="spec">
        <Title
          over="ESSENTIAL SPECIFICATION"
          title="Engineered without compromise."
        />
        <dl>
          {[
            ["Fuel", car.fuel],
            ["Power", car.power],
            ["Range / mileage", car.range],
            ["Drivetrain", car.drive],
            ["Safety rating", "Not available"],
            ["Warranty", "Manufacturer terms apply"],
          ].map((x) => (
            <div key={x[0]}>
              <dt>{x[0]}</dt>
              <dd>{x[1]}</dd>
            </div>
          ))}
        </dl>
      </section>
    </Page>
  );
}
export function CompareExperience() {
  const [ids, setIds] = useSaved("max-compare", [cars[0].id, cars[2].id]);
  const [differences,setDifferences]=useState(false);
  const [shared,setShared]=useState(false);
  const selected = ids
    .map((id) => cars.find((c) => c.id === id))
    .filter(Boolean) as Car[];
  const add = (id: string) => {
    if (!ids.includes(id) && ids.length < 4) setIds(ids.concat(id));
  };
  const share = async () => {
    await navigator.clipboard?.writeText(location.href);
    setShared(true);
    window.setTimeout(() => setShared(false), 2200);
  };
  return (
    <main className="compare-v2">
      <section className="compare-hero-v2 compare-image-hero"><figure><img src="/max-cars-real-drift-poster.jpg" alt="Two premium performance cars prepared for a side-by-side comparison"/><figcaption>Side-by-side decision workspace</figcaption></figure><div><small>COMPARE / TECHNICAL WORKSPACE</small><h1>Decide with every difference visible.</h1><p>Add up to four exact vehicles, compare normalized specifications and keep the selected set saved on this device.</p><nav><a href="#compare-workspace">Start Comparing</a><a href="/cars">Add Vehicles</a></nav><dl><span><b>4</b>Cars maximum</span><span><b>18+</b>Comparable fields</span><span><b>1</b>Saved shortlist</span></dl></div></section>
      <section className="compare-workspace-v2" id="compare-workspace"><header><div><small>01 / SELECT VEHICLES</small><h2>Compare without compromise.</h2></div><p>Unavailable values stay clearly labelled. No model receives invented safety or performance data.</p></header>
      <div className="compare-picker">
        <select onChange={(e) => add(e.target.value)} value="">
          <option value="">+ Add a vehicle</option>
          {cars
            .filter((c) => !ids.includes(c.id))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.brand} {c.model}
              </option>
            ))}
        </select>
        <button type="button" onClick={() => window.print()}>Print comparison</button>
        <button type="button" onClick={share}>{shared ? "Link copied" : "Share"}</button>
        <button type="button" className={differences?"active":""} aria-pressed={differences} onClick={()=>setDifferences(x=>!x)}>{differences?"Show all specifications":"Show differences only"}</button>
        <button type="button" className="compare-reset" onClick={() => setIds([])} disabled={!selected.length}>Reset comparison</button>
      </div>
      <p className="compare-picker-status" aria-live="polite">{selected.length} of 4 vehicles selected · {differences ? "Showing differences only" : "Showing all specifications"}</p>
      {selected.length ? (
        <>
          <div className="comparecars">
            {selected.map((c) => (
              <article key={c.id}>
                <img src={c.image} alt={`${c.brand} ${c.model}`} />
                <b>
                  {c.brand} {c.model}
                </b>
                <small>{c.variant}</small>
                <button onClick={() => setIds(ids.filter((id) => id !== c.id))}>
                  Remove
                </button>
              </article>
            ))}
          </div>
          <div className="table">
            {[
              ["Price", ...selected.map((c) => short(c.price))],
              ["Power", ...selected.map((c) => c.power)],
              ["Fuel", ...selected.map((c) => c.fuel)],
              ["Range / mileage", ...selected.map((c) => c.range)],
              ["Drivetrain", ...selected.map((c) => c.drive)],
              ["Body style", ...selected.map((c) => c.body)],
              ["Seats", ...selected.map((c) => String(c.seats))],
              ["Transmission", ...selected.map((c) => c.transmission)],
              ["Safety", ...selected.map((c) => c.safety)],
            ].filter(r=>!differences||new Set(r.slice(1)).size>1).map((r) => (
              <div key={r[0]}>
                {r.map((x, i) => (
                  <span className={i === 0 ? "label" : ""} key={i}>
                    {x}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </>
      ) : (
        <Empty
          title="Your comparison canvas is ready."
          action={() => (location.href = "/cars")}
        />
      )}
      </section>
      <section className="compare-proof-v2"><article><b>UP TO 4</b><span>Unique vehicle records</span></article><article><b>SAVED</b><span>Selection preserved locally</span></article><article><b>EXACT</b><span>Catalogue-linked imagery</span></article><article><b>PRINT</b><span>Shareable decision sheet</span></article></section>
    </main>
  );
}
export function SellExperience() {
  const [step, setStep] = useState(1),
    [done, setDone] = useState(false);
  if (done)
    return (
      <Page
        over="VALUATION RECEIVED"
        title="Inspection request created."
        sub="Reference MC-TV-260822. Your indicative valuation follows physical inspection."
      >
        <div className="success-state">
          <b>✓</b>
          <h2>We’ll take it from here.</h2>
          <p>
            Your request is saved on this device. A specialist will confirm an
            inspection time before any valuation is issued.
          </p>
          <a className="red" href="/dashboard/trade-ins">
            Track request →
          </a>
        </div>
      </Page>
    );
  return (
    <Page
      over="SELL OR TRADE"
      title="A clearer path to your next car."
      sub="Six guided steps. No guaranteed price before inspection."
    >
      <form
        className="wizard"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 6) setStep(step + 1);
          else {
            localStorage.setItem("max-trade", "MC-TV-260822");
            setDone(true);
          }
        }}
      >
        <div className="wizard-progress">
          <b style={{ width: `${(step / 6) * 100}%` }} />
          <span>STEP {step} OF 6</span>
        </div>
        {step === 1 && (
          <fieldset>
            <legend>Identify your vehicle</legend>
            <label>
              Registration number
              <input required placeholder="TS 09 AB 1234" />
            </label>
            <label>
              Brand
              <input required />
            </label>
            <label>
              Model
              <input required />
            </label>
          </fieldset>
        )}
        {step === 2 && (
          <fieldset>
            <legend>Condition and ownership</legend>
            <label>
              Model year
              <input required type="number" min="1990" max="2026" />
            </label>
            <label>
              Number of owners
              <select>
                <option>1</option>
                <option>2</option>
                <option>3+</option>
              </select>
            </label>
            <label>
              Accident history
              <select>
                <option>No declared accident</option>
                <option>Minor repair</option>
                <option>Major repair</option>
              </select>
            </label>
          </fieldset>
        )}
        {step === 3 && (
          <fieldset>
            <legend>Usage and service</legend>
            <label>
              Kilometres driven
              <input required type="number" min="0" />
            </label>
            <label>
              Service history
              <select>
                <option>Complete</option>
                <option>Partial</option>
                <option>Not available</option>
              </select>
            </label>
          </fieldset>
        )}
        {step === 4 && (
          <fieldset>
            <legend>Vehicle photographs</legend>
            <label className="upload">
              Upload exterior and interior photos
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                required
              />
              <small>JPG, PNG or WebP · maximum 8 MB each</small>
            </label>
          </fieldset>
        )}
        {step === 5 && (
          <fieldset>
            <legend>Contact details</legend>
            <label>
              Full name
              <input required />
            </label>
            <label>
              Email
              <input required type="email" />
            </label>
            <label>
              Phone
              <input required type="tel" pattern="[0-9]{10}" />
            </label>
          </fieldset>
        )}
        {step === 6 && (
          <fieldset>
            <legend>Inspection preference</legend>
            <label>
              City
              <select>
                <option>Hyderabad</option>
                <option>Mumbai</option>
                <option>Delhi</option>
              </select>
            </label>
            <label>
              Preferred date
              <input
                required
                type="date"
                min={new Date().toISOString().slice(0, 10)}
              />
            </label>
            <label className="check">
              <input type="checkbox" required /> I understand the final value is
              subject to physical inspection.
            </label>
          </fieldset>
        )}
        <div className="wizard-actions">
          {step > 1 && (
            <button type="button" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          )}
          <button className="red">
            {step === 6 ? "Submit inspection request" : "Continue →"}
          </button>
        </div>
      </form>
    </Page>
  );
}
export function DealersExperience() {
  const dealers = [
      { id: "hyd", city: "Hyderabad · Jubilee Hills", d: "2.4 km" },
      { id: "blr", city: "Bengaluru · Lavelle Road", d: "8.1 km" },
      { id: "mum", city: "Mumbai · Worli", d: "12.6 km" },
      { id: "del", city: "Delhi · Aerocity", d: "18.2 km" },
    ],
    [selected, setSelected] = useState("hyd");
  return (
    <Page
      over="DEALER NETWORK"
      title="Closer to your next drive."
      sub="A synchronized location workspace with a list fallback."
    >
      <div className="dealer-layout">
        <section className="dealer-map" aria-label="Dealer map fallback">
          <div className="map-grid" />
          {dealers.map((d, i) => (
            <button
              key={d.id}
              className={selected === d.id ? "active" : ""}
              style={{ left: `${18 + i * 19}%`, top: `${25 + (i % 2) * 34}%` }}
              onClick={() => setSelected(d.id)}
            >
              MC
            </button>
          ))}
          <span>Interactive map adapter · list remains available</span>
        </section>
        <aside>
          <label>
            Search city or postcode
            <input placeholder="Hyderabad" />
          </label>
          {dealers.map((d) => (
            <article
              className={selected === d.id ? "active" : ""}
              key={d.id}
              onClick={() => setSelected(d.id)}
            >
              <small>{d.d}</small>
              <h3>MAX CARS Experience Centre</h3>
              <b>{d.city}</b>
              <p>
                Sales · Service · Test drives
                <br />
                Open today · 9:30 AM–7:30 PM
              </p>
              <a href="tel:+910000000000">Call</a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(d.city)}`}
              >
                Directions ↗
              </a>
            </article>
          ))}
        </aside>
      </div>
    </Page>
  );
}
export function AuthExperience({
  mode,
}: {
  mode: "login" | "signup" | "forgot";
}) {
  const [show, setShow] = useState(false),
    [message, setMessage] = useState("");
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      email = String(f.get("email") || "");
    if (mode === "forgot") {
      setMessage(
        "If an account exists, recovery instructions have been prepared.",
      );
      return;
    }
    if (mode === "signup") {
      if (f.get("password") !== f.get("confirm")) {
        setMessage("Passwords do not match.");
        return;
      }
      localStorage.setItem(
        `max-user:${email}`,
        JSON.stringify({
          name: f.get("name"),
          email,
          password: f.get("password"),
        }),
      );
    } else {
      const user = JSON.parse(
        localStorage.getItem(`max-user:${email}`) || "null",
      );
      if (!user || user.password !== f.get("password")) {
        setMessage("We couldn’t sign you in with those details.");
        return;
      }
    }
    const user = JSON.parse(
      localStorage.getItem(`max-user:${email}`) || "null",
    );
    localStorage.setItem(
      "max-session",
      JSON.stringify({ name: user?.name || "Driver", email }),
    );
    notifyState();
    location.href = "/dashboard";
  };
  return (
    <section className={`auth-page ${mode}`}>
      <div className="auth-copy">
        <p className="eyebrow">MAX CARS IDENTITY</p>
        <h1>
          {mode === "signup"
            ? "Build your private garage."
            : mode === "forgot"
              ? "Recover your journey."
              : "Return to your drive."}
        </h1>
        <p>
          One secure identity connects saved cars, configurations, comparisons
          and appointments.
        </p>
      </div>
      <form className="authcard" onSubmit={submit}>
        <span className="auth-wordmark">MAX <em>CARS</em></span>
        <h2>
          {mode === "signup"
            ? "Create account"
            : mode === "forgot"
              ? "Password recovery"
              : "Log in"}
        </h2>
        {mode === "signup" && (
          <>
            <label>
              Full name
              <input name="name" required minLength={2} />
            </label>
            <label>
              Phone
              <input name="phone" required pattern="[0-9]{10}" />
            </label>
            <label>
              City
              <select>
                <option>Hyderabad</option>
                <option>Bengaluru</option>
                <option>Mumbai</option>
                <option>Delhi</option>
              </select>
            </label>
          </>
        )}
        <label>
          Email address
          <input name="email" type="email" required />
        </label>
        {mode !== "forgot" && (
          <>
            <label>
              Password
              <input
                name="password"
                type={show ? "text" : "password"}
                required
                minLength={8}
              />
            </label>
            {mode === "signup" && (
              <label>
                Confirm password
                <input
                  name="confirm"
                  type={show ? "text" : "password"}
                  required
                  minLength={8}
                />
              </label>
            )}
            <label className="check">
              <input
                type="checkbox"
                onChange={(e) => setShow(e.target.checked)}
              />{" "}
              Show password
            </label>
          </>
        )}
        {mode === "signup" && (
          <label className="check">
            <input type="checkbox" required /> I accept the Terms and Privacy
            Policy.
          </label>
        )}
        {message && (
          <p className="form-message" role="status">
            {message}
          </p>
        )}
        <button className="red">
          {mode === "signup"
            ? "Create secure account"
            : mode === "forgot"
              ? "Send recovery instructions"
              : "Log in securely"}
        </button>
        {mode === "login" && (
          <>
            <a href="/forgot-password">Forgot password?</a>
            <a href="/signup">Create Account</a>
          </>
        )}
        {mode !== "login" && <a href="/login">← Return to Log In</a>}
      </form>
    </section>
  );
}
export function DashboardExperience({
  section = "overview",
}: {
  section?: string;
}) {
  const [favs] = useSaved("max-favs"),
    [compare] = useSaved("max-compare"),
    [session, setSession] = useState<{ name: string } | null>(null);
  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("max-session") || "null");
    if (!s) {
      location.href = `/login?returnTo=${encodeURIComponent(location.pathname)}`;
    } else setSession(s);
  }, []);
  if (!session)
    return (
      <Page
        over="SECURE GARAGE"
        title="Restoring your account…"
        sub="Your intended destination will be preserved."
      >
        <div className="skeleton" />
      </Page>
    );
  const favouriteCars = cars.filter((c) => favs.includes(c.id));
  return (
    <section className="dashboard-page">
      <aside>
        <span className="avatar">{session.name[0]}</span>
        <h2>{session.name}</h2>
        <p>MAX CARS member</p>
        {[
          ["overview", "Dashboard", "/dashboard"],
          ["favourites", "Saved Cars", "/dashboard/favourites"],
          ["bookings", "Test-drive Bookings", "/dashboard/bookings"],
          ["trade-ins", "Trade-In Requests", "/dashboard/trade-ins"],
        ].map((x) => (
          <a
            className={section === x[0] ? "active" : ""}
            key={x[0]}
            href={x[2]}
          >
            {x[1]}
          </a>
        ))}
      </aside>
      <div>
        <p className="eyebrow">PRIVATE GARAGE / {section.toUpperCase()}</p>
        <h1>
          {section === "overview"
            ? `Welcome back, ${session.name}.`
            : section.replace("-", " ")}
        </h1>
        {section === "overview" && (
          <div className="metric-grid">
            <span>
              <b>{favs.length}</b>Saved cars
            </span>
            <span>
              <b>{compare.length}</b>Compared
            </span>
            <span>
              <b>{JSON.parse(localStorage.getItem("max-tickets") || "[]").length}</b>Support tickets
            </span>
            <span>
              <b>{localStorage.getItem("max-trade") ? 1 : 0}</b>Trade-ins
            </span>
          </div>
        )}
        {section === "favourites" &&
          (favouriteCars.length ? (
            <div className="grid">
              {favouriteCars.map((c) => (
                <VehicleCard key={c.id} car={c} />
              ))}
            </div>
          ) : (
            <Empty
              title="No saved cars yet."
              action={() => (location.href = "/cars")}
            />
          ))}
        {section === "bookings" && <BookingPanel />}
        {section === "trade-ins" &&
          (localStorage.getItem("max-trade") ? (
            <div className="record-list">
              <article>
                <b>{localStorage.getItem("max-trade")}</b>
                <span>Inspection requested · Awaiting confirmation</span>
                <a href="/sell">View request →</a>
              </article>
            </div>
          ) : (
            <Empty
              title="No trade-in requests yet."
              action={() => (location.href = "/sell")}
            />
          ))}
      </div>
    </section>
  );
}
function BookingPanel() {
  const preset =
      cars.find((c) => c.id === localStorage.getItem("max-book-car")) ||
      cars[0],
    [done, setDone] = useState(false);
  return done ? (
    <div className="success-state">
      <b>✓</b>
      <h2>Test drive confirmed.</h2>
      <p>
        Reference MC-TD-260842 · {preset.brand} {preset.model}
      </p>
    </div>
  ) : (
    <form
      className="booking-form"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
        localStorage.setItem("max-booking", "MC-TD-260842");
      }}
    >
      <label>
        Vehicle
        <select defaultValue={preset.id}>
          {cars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.brand} {c.model}
            </option>
          ))}
        </select>
      </label>
      <label>
        Dealer
        <select>
          <option>MAX CARS Experience Centre, {preset.location}</option>
        </select>
      </label>
      <label>
        Date
        <input
          required
          type="date"
          min={new Date().toISOString().slice(0, 10)}
        />
      </label>
      <label>
        Available time
        <select>
          <option>10:30 AM</option>
          <option>12:00 PM</option>
          <option>3:30 PM</option>
        </select>
      </label>
      <label>
        Full name
        <input required />
      </label>
      <label>
        Email
        <input required type="email" />
      </label>
      <label>
        Phone
        <input required pattern="[0-9]{10}" />
      </label>
      <label className="check">
        <input required type="checkbox" /> I hold a valid driving licence and
        consent to contact.
      </label>
      <button className="red">Confirm test drive →</button>
    </form>
  );
}
export function FinanceExperience() {
  const [price, setPrice] = useState(cars[0].price),
    [down, setDown] = useState(20),
    [rate, setRate] = useState(8.75),
    [years, setYears] = useState(5);
  const loan = price * (1 - down / 100),
    m = rate / 1200,
    n = years * 12,
    emi = Math.round((loan * m * (1 + m) ** n) / ((1 + m) ** n - 1));
  return (
    <Page
      over="OWNERSHIP PLANNING"
      title="Finance without fog."
      sub="Transparent estimates for an informed ownership decision."
    >
      <div className="finance">
        <div>
          <label>
            Vehicle price <b>{money(price)}</b>
            <input
              type="range"
              min="2000000"
              max="50000000"
              step="100000"
              value={price}
              onChange={(e) => setPrice(+e.target.value)}
            />
          </label>
          <label>
            Down payment <b>{down}%</b>
            <input
              type="range"
              min="10"
              max="80"
              value={down}
              onChange={(e) => setDown(+e.target.value)}
            />
          </label>
          <label>
            Interest rate <b>{rate}% p.a.</b>
            <input
              type="range"
              min="6"
              max="16"
              step=".25"
              value={rate}
              onChange={(e) => setRate(+e.target.value)}
            />
          </label>
          <label>
            Loan tenure <b>{years} years</b>
            <input
              type="range"
              min="1"
              max="7"
              value={years}
              onChange={(e) => setYears(+e.target.value)}
            />
          </label>
        </div>
        <aside>
          <small>ESTIMATED MONTHLY EMI</small>
          <strong>{money(emi)}</strong>
          <p>
            Loan amount <b>{money(loan)}</b>
          </p>
          <p>
            Total interest <b>{money(emi * n - loan)}</b>
          </p>
          <p>
            Total repayment <b>{money(emi * n)}</b>
          </p>
          <small>
            Estimated values only. Final rates and approval depend on the
            finance provider.
          </small>
        </aside>
      </div>
    </Page>
  );
}
export function GuidesExperience({ slug }: { slug?: string }) {
  const items = [
    {
      slug: "ev-buying-guide",
      t: "EV buying guide",
      d: "Charging, range and ownership explained",
    },
    {
      slug: "right-suv",
      t: "Choosing the right SUV",
      d: "Space, safety and city usability",
    },
    {
      slug: "on-road-price",
      t: "Understanding on-road price",
      d: "Registration, insurance and taxes",
    },
    {
      slug: "used-car-inspection",
      t: "Used-car inspection",
      d: "Documents, tyres and service history",
    },
  ];
  const item = items.find((x) => x.slug === slug);
  if (item)
    return (
      <Page
        over="MAX CARS JOURNAL / 6 MIN READ"
        title={item.t}
        sub="By MAX CARS Editorial · Published and verified 22 August 2026"
      >
        <article className="guide-detail">
          <h2>{item.d}</h2>
          <p>
            Buying well starts with separating verified facts from assumptions.
            Compare equivalent variants, normalize units and confirm
            region-specific pricing with an authorised source.
          </p>
          <h3>What to verify</h3>
          <p>
            Review the complete ownership context: usage, service support,
            warranty terms, insurance, charging or fuel access, and the
            vehicle’s documented history.
          </p>
          <h3>Make the final decision</h3>
          <p>
            Shortlist no more than four cars, test drive them in comparable
            conditions, and request a written quotation before committing.
          </p>
          <a className="red" href="/cars">
            Explore relevant cars →
          </a>
        </article>
      </Page>
    );
  return (
    <Page
      over="MAX CARS JOURNAL"
      title="Knowledge for every kilometre."
      sub="Original, practical automotive guidance for Indian buyers."
    >
      <div className="guides">
        {items.map((x) => (
          <article key={x.slug}>
            <small>6 MIN READ</small>
            <h3>{x.t}</h3>
            <p>{x.d}</p>
            <a href={`/guides/${x.slug}`}>Read guide →</a>
          </article>
        ))}
      </div>
    </Page>
  );
}
export function BrandExperience({ slug }: { slug: string }) {
  const brand =
    cars.find((c) =>
      c.brand
        .toLowerCase()
        .replaceAll("-", " ")
        .includes(slug.replaceAll("-", " ")),
    )?.brand || slug.replaceAll("-", " ");
  return (
    <Page
      over="BRAND COLLECTION"
      title={`${brand}: precision in motion.`}
      sub="A focused collection of verified demo vehicles and configuration experiences."
    >
      <div className="grid">
        {cars
          .filter((c) => c.brand.toLowerCase() === brand.toLowerCase())
          .map((c) => (
            <VehicleCard key={c.id} car={c} />
          ))}
      </div>
      <a className="red" href={`/cars?brand=${encodeURIComponent(brand)}`}>
        Browse all {brand} cars →
      </a>
    </Page>
  );
}
export function AdminExperience() {
  return (
    <Page
      over="ADMINISTRATION PREVIEW"
      title="Platform control centre."
      sub="Read-only operations preview. Connect server-side role authorization before enabling changes."
    >
      <div className="metric-grid">
        <span>
          <b>06</b>Listings
        </span>
        <span>
          <b>04</b>Dealers
        </span>
        <span>
          <b>02</b>Pending verification
        </span>
        <span>
          <b>01</b>Booking
        </span>
      </div>
      <div className="admin-table">
        {cars.map((c) => (
          <article key={c.id}>
            <img src={c.image} alt="" />
            <b>
              {c.brand} {c.model}
            </b>
            <span>{short(c.price)}</span>
            <small>Demo · verified 22 Aug 2026</small>
            <button type="button" disabled title="Requires an authenticated admin service">Edit unavailable</button>
          </article>
        ))}
      </div>
    </Page>
  );
}
export function CartExperience() {
  const [items, setItems] = useState<
    Array<{
      carId: string;
      colour: string;
      wheels: string;
      interior: string;
      dealer: string;
      reservation: number;
    }>
  >([]);
  useEffect(
    () => setItems(JSON.parse(localStorage.getItem("max-cart") || "[]")),
    [],
  );
  const remove = (id: string) => {
    const n = items.filter((x) => x.carId !== id);
    setItems(n);
    localStorage.setItem("max-cart", JSON.stringify(n));
  };
  return (
    <Page
      over="PURCHASE GARAGE"
      title="Your selected vehicles."
      sub="Persistent configuration summary · reservation workflow"
    >
      <div className="cart-list">
        {items.map((item) => {
          const c = cars.find((x) => x.id === item.carId)!;
          return (
            <article key={item.carId}>
              <img src={c.image} alt={c.model} />
              <div>
                <h2>
                  {c.brand} {c.model}
                </h2>
                <p>
                  {c.variant} · {item.colour} · {item.wheels} · {item.interior}
                </p>
                <small>Dealer: {item.dealer}</small>
              </div>
              <dl>
                <dt>Indicative vehicle price</dt>
                <dd>{short(c.price)}</dd>
                <dt>Payable now</dt>
                <dd>{money(item.reservation)}</dd>
              </dl>
              <button onClick={() => remove(item.carId)}>Remove</button>
            </article>
          );
        })}
        {!items.length && (
          <Empty
            title="Your cart is empty."
            action={() => (location.href = "/cars")}
          />
        )}
      </div>
      {items.length > 0 && (
        <section className="cart-summary">
          <p>
            Reservation amount is credited toward the purchase subject to dealer
            terms.
          </p>
          <a className="red" href="/checkout">
            Continue to secure checkout →
          </a>
        </section>
      )}
    </Page>
  );
}
export function CheckoutExperience() {
  const [step, setStep] = useState(1),
    [processing, setProcessing] = useState(false),
    [done, setDone] = useState(false);
  const labels = [
    "Configuration",
    "Dealer",
    "Customer",
    "Address",
    "Trade-In",
    "Payment",
    "Review",
    "Confirmation",
  ];
  const cart =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("max-cart") || "[]")
      : [];
  const finish = () => {
    setProcessing(true);
    setTimeout(() => {
      const id = "MC-ORD-260822";
      localStorage.setItem(
        "max-order",
        JSON.stringify({
          id,
          status: "Dealer Verification",
          created: new Date().toISOString(),
          cart,
        }),
      );
      setProcessing(false);
      setDone(true);
    }, 700);
  };
  if (done)
    return (
      <Page
        over="TEST MODE CONFIRMATION"
        title="Reservation request recorded."
        sub="No live payment was collected. Reference MC-ORD-260822."
      >
        <div className="success-state">
          <b>✓</b>
          <h2>Your dealer verification has started.</h2>
          <p>
            This demonstration does not claim a completed vehicle purchase or
            successful live payment.
          </p>
          <a className="red" href="/orders/MC-ORD-260822">
            View order →
          </a>
        </div>
      </Page>
    );
  return (
    <Page
      over="SECURE CHECKOUT / TEST MODE"
      title="Complete your reservation."
      sub="Live payment is unavailable until a certified gateway is configured."
    >
      <div className="checkout-progress">
        {labels.map((x, i) => (
          <span className={step >= i + 1 ? "active" : ""} key={x}>
            {i + 1}
            <small>{x}</small>
          </span>
        ))}
      </div>
      <form
        className="checkout-card"
        onSubmit={(e) => {
          e.preventDefault();
          if(step < 7) setStep(step + 1); else finish();
        }}
      >
        <h2>{labels[step - 1]}</h2>
        {step === 1 && (
          <p>
            {cart.length} configured vehicle selected. Duplicate configurations
            are prevented.
          </p>
        )}
        {step === 2 && (
          <label>
            Fulfilment dealer
            <select required>
              <option>MAX CARS Experience Centre</option>
            </select>
          </label>
        )}
        {step === 3 && (
          <>
            <label>
              Full name
              <input required />
            </label>
            <label>
              Phone
              <input required pattern="[0-9]{10}" />
            </label>
            <label>
              Email
              <input required type="email" />
            </label>
          </>
        )}
        {step === 4 && (
          <>
            <label>
              Delivery method
              <select>
                <option>Dealer pickup</option>
                <option>Home delivery — subject to dealer confirmation</option>
              </select>
            </label>
            <label>
              Delivery address
              <textarea required />
            </label>
          </>
        )}
        {step === 5 && (
          <label>
            Add a trade-in?
            <select>
              <option>No trade-in</option>
              <option>Use saved inspection request</option>
            </select>
          </label>
        )}
        {step === 6 && (
          <>
            <div className="test-banner">
              TEST MODE · No card number, CVV or UPI PIN is collected.
            </div>
            <label>
              Payment method
              <select>
                <option>UPI test mode</option>
                <option>Card gateway test mode</option>
                <option>Net banking test mode</option>
                <option>Finance application</option>
                <option>Pay authorized dealer</option>
              </select>
            </label>
          </>
        )}
        {step === 7 && (
          <>
            <p>
              Review configuration, dealer, address and the reservation purpose
              before confirming.
            </p>
            <label className="check">
              <input required type="checkbox" /> I accept the reservation and
              refund terms.
            </label>
          </>
        )}
        <div className="wizard-actions">
          {step > 1 && (
            <button type="button" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          )}
          <button className="red" disabled={processing}>
            {processing
              ? "Verifying…"
              : step === 7
                ? "Confirm test reservation"
                : "Continue →"}
          </button>
        </div>
      </form>
    </Page>
  );
}
export function OrdersExperience({ id }: { id?: string }) {
  const order =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("max-order") || "null")
      : null;
  const stages = [
    "Order Created",
    "Payment Confirmed",
    "Dealer Verification",
    "Documents Pending",
    "Vehicle Preparation",
    "Registration",
    "Quality Inspection",
    "Ready for Delivery",
    "Out for Delivery",
    "Delivered",
  ];
  return (
    <Page
      over="ORDER & DELIVERY"
      title={id || "Your orders"}
      sub={
        order
          ? "Reservation order · dealer-managed fulfilment"
          : "No active order has been created."
      }
    >
      {order ? (
        <div className="order-layout">
          <section className="order-card">
            <h2>{order.id}</h2>
            <p>
              Current status: <b>{order.status}</b>
            </p>
            <a className="red" href={`/delivery/${order.id}`}>
              Open delivery tracking →
            </a>
          </section>
          <ol className="timeline">
            {stages.map((x, i) => (
              <li className={i < 3 ? "active" : ""} key={x}>
                <b>{x}</b>
                <span>
                  {i < 3 ? "22 Aug 2026 · recorded" : "Awaiting previous stage"}
                </span>
                <p>
                  {i === 2
                    ? "Dealer is validating configuration, pricing and fulfilment capability."
                    : "Status will update after verified dealer action."}
                </p>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <Empty
          title="No orders yet."
          action={() => (location.href = "/cars")}
        />
      )}
    </Page>
  );
}
export function ProfileExperience({
  section = "profile",
}: {
  section?: string;
}) {
  const [session, setSession] = useState<{
      name: string;
      email: string;
    } | null>(null),
    [avatar, setAvatar] = useState(""),
    [addressEditing,setAddressEditing]=useState(false),
    [address,setAddress]=useState({line:"",city:"",postcode:""});
  useEffect(() => {
    setSession(JSON.parse(localStorage.getItem("max-session") || "null"));
    setAvatar(localStorage.getItem("max-avatar") || "");
    setAddress(JSON.parse(localStorage.getItem("max-address")||'{"line":"","city":"","postcode":""}'));
  }, []);
  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
      f.size > 3 * 1024 * 1024
    ) {
      alert("Choose a JPG, PNG or WebP under 3 MB.");
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      const url = String(r.result);
      localStorage.setItem("max-avatar", url);
      setAvatar(url);
    };
    r.readAsDataURL(f);
  };
  return (
    <Page
      over="IDENTITY STUDIO"
      title={section === "profile" ? "My profile" : section.replace("-", " ")}
      sub="Personal preferences and account controls for this signed-in demo profile."
    >
      <div className="profile-editor">
        <aside>
          {avatar ? (
            <img src={avatar} alt="Profile preview" />
          ) : (
            <span>{session?.name?.[0] || "M"}</span>
          )}
          <label className="ghost">
            Replace photograph
            <input
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={upload}
            />
          </label>
          {avatar && (
            <button
              onClick={() => {
                localStorage.removeItem("max-avatar");
                setAvatar("");
              }}
            >
              Remove
            </button>
          )}
          <small>JPG, PNG or WebP · maximum 3 MB</small>
        </aside>
        {section === "profile" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Profile changes saved on this device");
            }}
          >
            {[
              ["Full name", session?.name || ""],
              ["Email", session?.email || ""],
              ["Phone", ""],
              ["Date of birth", ""],
              ["City", "Hyderabad"],
              ["State", "Telangana"],
              ["Postcode", ""],
              ["Country", "India"],
              ["Preferred language", "English"],
              ["Preferred currency", "INR (₹)"],
              ["Vehicle interests", "Electric, Luxury"],
              ["Budget preference", "₹50 lakh–₹2 crore"],
            ].map((x) => (
              <label key={x[0]}>
                {x[0]}
                <input defaultValue={x[1]} />
              </label>
            ))}
            <button className="red">Save profile</button>
          </form>
        ) : (
          <div className="settings-list">
            {section === "payments" &&
              [
                "UPI provider · Not configured",
                "Card gateway · Not configured",
                "Dealer payment · Available after quotation",
              ].map((x) => (
                <article key={x}>
                  <b>{x}</b>
                  <span>Secure provider token required</span>
                </article>
              ))}
            {section === "addresses" && (
              <article>
                <b>Primary address</b>
                {address.line?<span>{address.line} · {address.city} · {address.postcode}</span>:<span>Add an address during checkout or create one here.</span>}
                {!addressEditing?<button onClick={()=>setAddressEditing(true)}>{address.line?"Edit address":"Add address"}</button>:<form onSubmit={event=>{event.preventDefault();localStorage.setItem("max-address",JSON.stringify(address));setAddressEditing(false)}}><label>Address line<input required value={address.line} onChange={event=>setAddress({...address,line:event.target.value})}/></label><label>City<input required value={address.city} onChange={event=>setAddress({...address,city:event.target.value})}/></label><label>Postcode<input required inputMode="numeric" pattern="[0-9]{6}" value={address.postcode} onChange={event=>setAddress({...address,postcode:event.target.value})}/></label><button type="button" onClick={()=>setAddressEditing(false)}>Cancel</button><button type="submit">Save address</button></form>}
              </article>
            )}
            {section === "security" &&
              [
                "Change password",
                "Two-factor authentication",
                "Active sessions",
                "Login history",
                "Email verification",
                "Phone verification",
                "Download personal data",
                "Delete account request",
              ].map((x) => (
                <article key={x}>
                  <b>{x}</b>
                  <a className="ghost" href={x==="Change password"?"/forgot-password":`/support?topic=${encodeURIComponent(x)}`}>{x==="Change password"?"Change securely":"Open secure request"}</a>
                </article>
              ))}
          </div>
        )}
      </div>
    </Page>
  );
}
export function NotificationsExperience() {
  return (
    <Page
      over="NOTIFICATION CENTRE"
      title="Nothing important gets lost."
      sub="Account, booking, order and dealer updates in one place."
    >
      <div className="record-list">
        <article>
          <b>Welcome to MAX CARS</b>
          <span>Your connected automotive account is ready.</span>
          <small>Today</small>
        </article>
        <article>
          <b>Test-mode payments</b>
          <span>A certified payment gateway is not yet configured.</span>
          <small>System</small>
        </article>
      </div>
    </Page>
  );
}
function VehicleCard({ car }: { car: Car }) {
  const [favs, setFavs] = useSaved("max-favs"),
    [compare, setCompare] = useSaved("max-compare", [cars[0].id, cars[2].id]);
  const fav = favs.includes(car.id),
    comp = compare.includes(car.id);
  return (
    <article className={`card ${car.category}`}>
      <figure>
        <img src={car.image} alt={`${car.year} ${car.brand} ${car.model}`} />
        <span>{car.badge}</span>
        <button
          aria-label={fav ? "Remove favourite" : "Save favourite"}
          onClick={() =>
            setFavs(
              fav ? favs.filter((x) => x !== car.id) : favs.concat(car.id),
            )
          }
        >
          {fav ? "♥" : "♡"}
        </button>
      </figure>
      <div>
        <small>
          {car.brand.toUpperCase()} · {car.year} · {car.location}
        </small>
        <h3>{car.model}</h3>
        <p>{car.variant}</p>
        <section className="chips">
          <span>{car.fuel}</span>
          <span>{car.power}</span>
          <span>{car.range}</span>
        </section>
        <section className="price">
          <b>{short(car.price)}</b>
          <small>Indicative ex-showroom</small>
        </section>
        <section className="cardactions">
          <a href={`/cars/${car.slug}`}>View details →</a>
          <label>
            <input
              type="checkbox"
              checked={comp}
              disabled={!comp && compare.length >= 4}
              onChange={() =>
                setCompare(
                  comp
                    ? compare.filter((x) => x !== car.id)
                    : compare.concat(car.id),
                )
              }
            />{" "}
            Compare
          </label>
        </section>
      </div>
    </article>
  );
}
function Title({ over, title }: { over: string; title: string }) {
  return (
    <div className="title">
      <p className="eyebrow">{over}</p>
      <h2>{title}</h2>
    </div>
  );
}
function Page({
  over,
  title,
  sub,
  children,
}: {
  over: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="page">
      <div className="pagetitle">
        <p className="eyebrow">{over}</p>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {children}
    </section>
  );
}
function Empty({ title, action }: { title: string; action: () => void }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>Adjust your selection or continue exploring the MAX CARS platform.</p>
      <button onClick={action}>Continue exploring →</button>
    </div>
  );
}
export function ExploreHubExperience() {
  const hasQuery = typeof window !== "undefined" && location.search.length > 1;
  if (hasQuery) return <InventoryExperience />;
  const imagePool = cars.map((c) => c.image),
    cats = [
      ["SUVs", "Mountain-ready space", "body=suv"],
      ["Sports Cars", "Focused response", "category=performance"],
      ["Supercars", "Extreme engineering", "category=supercar"],
      ["Sedans", "Business-class balance", "body=sedan"],
      ["Hatchbacks", "Compact urban agility", "body=hatchback"],
      ["Coupés", "Two-door elegance", "body=coupe"],
      ["Convertibles", "Open-air performance", "body=convertible"],
      ["MPVs", "Flexible family space", "body=mpv"],
      ["Pickup Trucks", "Utility without compromise", "body=pickup"],
      ["Luxury Cars", "Crafted comfort", "category=luxury"],
      ["Electric Cars", "Silent electric progress", "fuel=electric"],
      ["Hybrid Cars", "Efficient flexibility", "fuel=hybrid"],
      ["Performance Cars", "Power with precision", "category=performance"],
      ["Family Cars", "Comfort for every seat", "category=family"],
      ["Off-Road Cars", "Terrain capability", "category=off-road"],
      ["Compact Cars", "Easy city ownership", "category=compact"],
      ["Certified Used", "Inspected confidence", "condition=used"],
      ["Recently Launched", "The newest arrivals", "launchStatus=recent"],
      ["Upcoming Cars", "What comes next", "launchStatus=upcoming"],
      ["Under ₹10 Lakh", "Smart-value choices", "budgetMax=1000000"],
      [
        "₹10–20 Lakh",
        "The versatile middle",
        "budgetMin=1000000&budgetMax=2000000",
      ],
      ["Above ₹20 Lakh", "Premium possibilities", "budgetMin=2000000"],
    ];
  return (
    <Page
      over="MAX CARS DISCOVERY"
      title="Explore Every Kind of Drive"
      sub="Six verified demo records are active. The catalogue is ready for a licensed manufacturer or dealer feed."
    >
      <section className="explore-command">
        <label>
          Search vehicles
          <input
            placeholder="Brand, model, body type or fuel"
            onKeyDown={(e) => {
              if (e.key === "Enter")
                location.href = `/cars?q=${encodeURIComponent(e.currentTarget.value)}`;
            }}
          />
        </label>
        <label>
          Location
          <select
            onChange={(e) => {
              if (e.target.value)
                location.href = `/cars?location=${e.target.value}`;
            }}
          >
            <option value="">All India</option>
            <option>Hyderabad</option>
            <option>Mumbai</option>
            <option>Delhi</option>
            <option>Bengaluru</option>
          </select>
        </label>
        <div>
          <b>06</b>
          <small>VERIFIED DEMO RECORDS</small>
        </div>
        <a className="red" href="/cars?condition=new">
          Advanced filters →
        </a>
      </section>
      <div className="recent-searches">
        <span>POPULAR:</span>
        <a href="/cars?fuel=electric">Electric</a>
        <a href="/cars?body=suv">SUV</a>
        <a href="/cars?category=luxury">Luxury</a>
        <a href="/cars?category=performance">Performance</a>
      </div>
      <section className="category-grid">
        {cats.map((x, i) => {
          const count = cars.filter(
            (c) =>
              x[2].includes(`body=${c.body}`) ||
              x[2].includes(`fuel=${c.fuel}`) ||
              x[2].includes(`category=${c.category}`) ||
              x[2].includes(`condition=${c.condition}`),
          ).length;
          return (
            <a key={x[0]} href={`/cars?${x[2]}`}>
              <img src={imagePool[i % imagePool.length]} alt="" />
              <span>
                <small>{String(i + 1).padStart(2, "0")} / CATEGORY</small>
                <h2>{x[0]}</h2>
                <p>{x[1]}</p>
                <b>
                  {count
                    ? `${count} demo match${count > 1 ? "es" : ""}`
                    : "Licensed feed required"}
                </b>
                <em>Explore →</em>
              </span>
            </a>
          );
        })}
      </section>
      <section className="catalogue-notice">
        <h2>Built for a 1,000-vehicle catalogue.</h2>
        <p>
          Server pagination, indexed search, source tracking and image-licence
          fields are architectural requirements. They become active when an
          authorised catalogue feed and image library are connected; MAX CARS
          does not generate duplicate vehicles to inflate the count.
        </p>
      </section>
    </Page>
  );
}
export function LocationExperience({ id }: { id?: string }) {
  const locations = [
      {
        id: "hyd-jubilee",
        name: "MAX CARS Jubilee Hills",
        city: "Hyderabad",
        address: "Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033",
        distance: "2.4 km",
        hours: "9:30 AM–7:30 PM",
        brands: "Porsche · BMW · Mercedes-Benz",
        delivery: "Home delivery subject to confirmation",
      },
      {
        id: "mum-worli",
        name: "MAX CARS Worli",
        city: "Mumbai",
        address: "Dr Annie Besant Road, Worli, Mumbai, Maharashtra 400018",
        distance: "8.7 km",
        hours: "9:30 AM–7:30 PM",
        brands: "Audi · Lamborghini · Land Rover",
        delivery: "Dealer pickup available",
      },
      {
        id: "blr-lavelle",
        name: "MAX CARS Lavelle Road",
        city: "Bengaluru",
        address: "Lavelle Road, Bengaluru, Karnataka 560001",
        distance: "12.1 km",
        hours: "10:00 AM–7:00 PM",
        brands: "BMW · Mercedes-Benz · Audi",
        delivery: "Home delivery subject to confirmation",
      },
    ],
    selected = locations.find((x) => x.id === id);
  const [chosen, setChosen] = useState(selected?.id || locations[0].id),
    [q, setQ] = useState("");
  if (selected)
    return (
      <Page
        over="VERIFIED LOCATION"
        title={selected.name}
        sub={`${selected.address} · updated 22 Aug 2026`}
      >
        <div className="location-detail">
          <div className="dealer-map">
            <div className="map-grid" />
            <span className="active" style={{ left: "48%", top: "42%" }}>
              MC
            </span>
            <span>Map adapter fallback · exact directions open externally</span>
          </div>
          <aside>
            <h2>{selected.city}</h2>
            <p>{selected.address}</p>
            <dl>
              <div>
                <dt>Distance</dt>
                <dd>{selected.distance}</dd>
              </div>
              <div>
                <dt>Opening hours</dt>
                <dd>{selected.hours}</dd>
              </div>
              <div>
                <dt>Supported brands</dt>
                <dd>{selected.brands}</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>{selected.delivery}</dd>
              </div>
              <div>
                <dt>Facilities</dt>
                <dd>Sales · Test drives · Accessible entrance</dd>
              </div>
              <div>
                <dt>Payment</dt>
                <dd>Gateway or authorised dealer payment</dd>
              </div>
            </dl>
            <a
              className="red"
              href={`https://maps.google.com/?q=${encodeURIComponent(selected.address)}`}
            >
              Get directions →
            </a>
            <a className="ghost" href="/dashboard/bookings">
              Book appointment
            </a>
          </aside>
        </div>
      </Page>
    );
  const visible = locations.filter((x) =>
    `${x.name} ${x.city} ${x.address}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <Page
      over="LOCATION DISCOVERY"
      title="Find automotive support near you."
      sub="Location permission is optional. Search manually or use the complete list fallback."
    >
      <section className="location-search">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="City, locality or postcode"
        />
        <button
          onClick={() =>
            navigator.geolocation?.getCurrentPosition(
              () => setQ("Hyderabad"),
              () =>
                alert(
                  "Location permission was not granted. Please search manually.",
                ),
            )
          }
        >
          Use My Location
        </button>
        <select>
          <option>Within 25 km</option>
          <option>Within 50 km</option>
          <option>Within 100 km</option>
        </select>
      </section>
      <div className="dealer-layout">
        <section className="dealer-map">
          <div className="map-grid" />
          {visible.map((d, i) => (
            <button
              key={d.id}
              className={chosen === d.id ? "active" : ""}
              style={{ left: `${22 + i * 26}%`, top: `${30 + (i % 2) * 28}%` }}
              onClick={() => setChosen(d.id)}
            >
              MC
            </button>
          ))}
          <span>Map/list synchronized · list remains available</span>
        </section>
        <aside>
          {visible.map((d) => (
            <article
              className={chosen === d.id ? "active" : ""}
              key={d.id}
              onClick={() => setChosen(d.id)}
            >
              <small>{d.distance}</small>
              <h3>{d.name}</h3>
              <b>{d.address}</b>
              <p>
                Open · {d.hours}
                <br />
                {d.brands}
                <br />
                {d.delivery}
              </p>
              <a href={`/location/${d.id}`}>Full details</a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(d.address)}`}
              >
                Directions ↗
              </a>
            </article>
          ))}
        </aside>
      </div>
    </Page>
  );
}
export function SupportExperience() {
  const [done, setDone] = useState(false),
    [tickets, setTickets] = useState<
      Array<{ id: string; subject: string; status: string }>
    >([]);
  useEffect(
    () => setTickets(JSON.parse(localStorage.getItem("max-tickets") || "[]")),
    [],
  );
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      ticket = {
        id: `MC-SUP-${Date.now().toString().slice(-6)}`,
        subject: String(f.get("subject")),
        status: "Submitted",
      },
      next = [ticket, ...tickets];
    localStorage.setItem("max-tickets", JSON.stringify(next));
    setTickets(next);
    setDone(true);
  };
  const topics = [
    ["Buying Assistance", "Reservations, quotations and pricing"],
    ["Payment Support", "Test-mode and gateway questions"],
    ["Delivery Support", "Pickup, delivery and documents"],
    ["Account Support", "Login, profile and security"],
    ["Dealer Support", "Appointments and contact"],
    ["Vehicle Image Help", "Exact-model galleries and media corrections"],
  ];
  return (
    <Page
      over="MAX CARS SUPPORT"
      title="Answers without the runaround."
      sub="Search guidance, create a support ticket or review your existing requests."
    >
      <label className="support-search">
        Search Help
        <input placeholder="Search buying, payments, delivery or account help" />
      </label>
      <div className="support-grid">
        {topics.map((x, i) => (
          <article key={x[0]}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <h2>{x[0]}</h2>
            <p>{x[1]}</p>
            <button
              onClick={() =>
                document
                  .getElementById("support-ticket")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Get support →
            </button>
          </article>
        ))}
      </div>
      <section id="support-ticket" className="support-ticket">
        <div>
          <p className="eyebrow">SUPPORT TICKET</p>
          <h2>{done ? "Ticket submitted." : "Tell us what happened."}</h2>
          {done && (
            <p>
              Your request is saved with status Submitted. You can follow it
              below.
            </p>
          )}
        </div>
        <form onSubmit={submit}>
          <label>
            Category
            <select name="category">
              <option>Buying Assistance</option>
              <option>Payment Support</option>
              <option>Delivery Support</option>
              <option>Account Support</option>
              <option>Technical Support</option>
            </select>
          </label>
          <label>
            Order ID, if relevant
            <input name="order" />
          </label>
          <label>
            Vehicle
            <select name="vehicle">
              <option>Not vehicle-specific</option>
              {cars.map((c) => (
                <option key={c.id}>
                  {c.brand} {c.model}
                </option>
              ))}
            </select>
          </label>
          <label>
            Subject
            <input name="subject" required />
          </label>
          <label className="full">
            Description
            <textarea name="description" required rows={5} />
          </label>
          <label>
            Attachment
            <input name="attachment" type="file" accept="image/*,.pdf" />
          </label>
          <label>
            Contact preference
            <select>
              <option>Email</option>
              <option>Phone</option>
            </select>
          </label>
          <button className="red full">Create support ticket →</button>
        </form>
      </section>
      {tickets.length > 0 && (
        <div className="record-list">
          {tickets.map((t) => (
            <article key={t.id}>
              <b>{t.id}</b>
              <span>{t.subject}</span>
              <small>{t.status}</small>
            </article>
          ))}
        </div>
      )}
    </Page>
  );
}
function VehicleGallery({ car }: { car: Car }) {
  const media: Array<{ label: string; src?: string }> = [
      { label: "Verified exterior", src: car.image },
      { label: "Front angle" },
      { label: "Rear angle" },
      { label: "Interior" },
      { label: "Dashboard" },
    ],
    [active, setActive] = useState(0),
    [full, setFull] = useState(false);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setActive((x) => (x + 1) % media.length);
      if (e.key === "ArrowLeft")
        setActive((x) => (x + media.length - 1) % media.length);
      if (e.key === "Escape") setFull(false);
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [media.length]);
  const move = (n: number) =>
      setActive((active + n + media.length) % media.length),
    item = media[active];
  return (
    <section className="vehicle-gallery">
      <div className="gallery-main">
        {item.src ? (
          <img
            key={item.src}
            src={item.src}
            alt={`${car.brand} ${car.model} — ${item.label}`}
          />
        ) : (
          <div className="gallery-unavailable">
            <b>{item.label}</b>
            <span>Verified image unavailable</span>
          </div>
        )}
        <span>{item.label}</span>
        <button
          className="gallery-prev"
          onClick={() => move(-1)}
          aria-label="Previous image"
        >
          ‹
        </button>
        <button
          className="gallery-next"
          onClick={() => move(1)}
          aria-label="Next image"
        >
          ›
        </button>
        {item.src && (
          <button className="gallery-full" onClick={() => setFull(true)}>
            ⛶ Fullscreen
          </button>
        )}
      </div>
      <div className="gallery-strip">
        {media.map((m, i) => (
          <button
            className={i === active ? "active" : ""}
            onClick={() => setActive(i)}
            key={m.label}
          >
            {m.src ? <img src={m.src} alt="" /> : <i>Image unavailable</i>}
            <span>{m.label}</span>
          </button>
        ))}
      </div>
      <small>
        Only media verified for this exact listing is shown. MAX CARS does not
        substitute another model’s exterior or interior.
      </small>
      {full && item.src && (
        <div
          className="gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen vehicle gallery"
          onClick={() => setFull(false)}
        >
          <button onClick={() => setFull(false)} aria-label="Close gallery">
            ×
          </button>
          <img
            src={item.src}
            alt={`${car.brand} ${car.model} — ${item.label}`}
          />
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                move(-1);
              }}
            >
              ← Previous
            </button>
            <b>
              {active + 1} / {media.length} · {item.label}
            </b>
            <button
              onClick={(e) => {
                e.stopPropagation();
                move(1);
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
