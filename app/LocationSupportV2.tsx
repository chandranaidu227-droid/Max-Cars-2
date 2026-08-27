"use client";

import { useEffect, useMemo, useState } from "react";
import { cars } from "./data";
import SupportHeroMedia from "./SupportHeroMedia";

type Centre = {
  id: string;
  name: string;
  city: string;
  state: string;
  postcode: string;
  address: string;
  distance: string;
  rating: string;
  hours: string;
  services: string[];
  availability: string;
  waiting: string;
  phone?: string;
  map: { x: number; y: number };
};
const centres: Centre[] = [
  {
    id: "hyd-jubilee",
    name: "MAX CARS Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    postcode: "500033",
    address: "Road No. 36, Jubilee Hills, Hyderabad",
    distance: "2.4 km",
    rating: "4.7/5",
    hours: "Mon–Sat · 9:30 AM–7:30 PM",
    services: [
      "Test drives",
      "Vehicle inspection",
      "Service coordination",
      "EV charging",
      "Delivery",
    ],
    availability: "Vehicle stock requires confirmation",
    waiting: "Estimated 2–6 weeks by model",
    map: { x: 28, y: 35 },
  },
  {
    id: "mum-worli",
    name: "MAX CARS Worli",
    city: "Mumbai",
    state: "Maharashtra",
    postcode: "400018",
    address: "Dr Annie Besant Road, Worli, Mumbai",
    distance: "8.7 km",
    rating: "4.6/5",
    hours: "Mon–Sat · 9:30 AM–7:30 PM",
    services: [
      "Test drives",
      "Vehicle inspection",
      "Service coordination",
      "Delivery",
    ],
    availability: "Vehicle stock requires confirmation",
    waiting: "Estimated 3–8 weeks by model",
    map: { x: 58, y: 54 },
  },
  {
    id: "blr-lavelle",
    name: "MAX CARS Lavelle Road",
    city: "Bengaluru",
    state: "Karnataka",
    postcode: "560001",
    address: "Lavelle Road, Bengaluru",
    distance: "12.1 km",
    rating: "4.8/5",
    hours: "Mon–Sat · 10:00 AM–7:00 PM",
    services: [
      "Test drives",
      "EV charging",
      "Service coordination",
      "Delivery",
    ],
    availability: "Vehicle stock requires confirmation",
    waiting: "Estimated 2–7 weeks by model",
    map: { x: 72, y: 31 },
  },
  {
    id: "del-aerocity",
    name: "MAX CARS Aerocity",
    city: "Delhi",
    state: "Delhi",
    postcode: "110037",
    address: "Aerocity, New Delhi",
    distance: "18.2 km",
    rating: "4.5/5",
    hours: "Mon–Sat · 10:00 AM–7:00 PM",
    services: [
      "Test drives",
      "Vehicle inspection",
      "Service coordination",
      "EV charging",
    ],
    availability: "Vehicle stock requires confirmation",
    waiting: "Estimated 3–8 weeks by model",
    map: { x: 44, y: 70 },
  },
];

export function LocationV2() {
  const [q, setQ] = useState(""),
    [state, setState] = useState(""),
    [selected, setSelected] = useState(centres[0].id),
    [view, setView] = useState<"list" | "map">("list"),
    [notice, setNotice] = useState("");
  useEffect(() => {
    const saved = localStorage.getItem("max-location");
    if (saved) setQ(saved);
  }, []);
  const visible = useMemo(
    () =>
      centres.filter(
        (c) =>
          (!q ||
            `${c.name} ${c.city} ${c.postcode} ${c.address}`
              .toLowerCase()
              .includes(q.toLowerCase())) &&
          (!state || c.state === state),
      ),
    [q, state],
  );
  const save = () => {
    const value = q || centres.find((c) => c.id === selected)?.city || "";
    localStorage.setItem("max-location", value);
    setNotice(`${value} saved as your preferred location.`);
  };
  const locate = () => {
    if (!navigator.geolocation) {
      setNotice(
        "Location is not supported by this browser. Enter a city or postcode instead.",
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setQ("Hyderabad");
        setSelected("hyd-jubilee");
        setNotice(
          "Approximate results shown. Precise coordinates are not stored.",
        );
      },
      () =>
        setNotice(
          "Location permission was not granted. Enter a city or postcode instead.",
        ),
      { enableHighAccuracy: false, timeout: 7000 },
    );
  };
  return (
    <main className="location-v2">
      <header>
        <small>LOCATION / OWNERSHIP NETWORK</small>
        <h1>Everything automotive, closer.</h1>
        <p>
          Search approximate MAX CARS demo-network results for pricing
          assistance, test drives, inspections, service coordination, EV
          charging and delivery.
        </p>
      </header>
      <section className="location-controls">
        <label>
          Enter city or postcode
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Hyderabad or 500033"
          />
        </label>
        <label>
          Select state
          <select value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">All states</option>
            {[...new Set(centres.map((c) => c.state))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <button onClick={locate}>Use Current Location</button>
        <button onClick={save}>Save Preferred Location</button>
        <button
          onClick={() => {
            setQ("");
            setState("");
            setNotice("");
          }}
        >
          Change Location
        </button>
      </section>
      {notice && (
        <p className="location-notice" role="status">
          {notice}
        </p>
      )}
      <div className="location-view-toggle">
        <b>{visible.length} results</b>
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
      </div>
      <section className={`location-results ${view}`}>
        <div className="location-map" aria-label="Synchronized map preview">
          <div className="map-grid" />
          {visible.map((c) => (
            <button
              key={c.id}
              className={selected === c.id ? "active" : ""}
              style={{ left: `${c.map.x}%`, top: `${c.map.y}%` }}
              onClick={() => setSelected(c.id)}
              aria-label={`Select ${c.name}`}
            >
              MC
            </button>
          ))}
          <span>Map preview · select a marker to highlight its list card</span>
        </div>
        <div className="location-list">
          {visible.length ? (
            visible.map((c) => (
              <article
                key={c.id}
                className={selected === c.id ? "active" : ""}
                onClick={() => setSelected(c.id)}
              >
                <header>
                  <span>{c.distance}</span>
                  <b>{c.rating}</b>
                </header>
                <h2>{c.name}</h2>
                <p>
                  {c.address} · {c.postcode}
                </p>
                <dl>
                  <div>
                    <dt>Opening hours</dt>
                    <dd>{c.hours}</dd>
                  </div>
                  <div>
                    <dt>Contact number</dt>
                    <dd>{c.phone || "Available after confirmation"}</dd>
                  </div>
                  <div>
                    <dt>Local availability</dt>
                    <dd>{c.availability}</dd>
                  </div>
                  <div>
                    <dt>Waiting period</dt>
                    <dd>{c.waiting}</dd>
                  </div>
                  <div>
                    <dt>On-road pricing</dt>
                    <dd>Estimate available after vehicle selection</dd>
                  </div>
                </dl>
                <ul>
                  {c.services.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <footer>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(c.address)}`}
                  >
                    Get Directions
                  </a>
                  {c.phone ? (
                    <a href={`tel:${c.phone}`}>Call</a>
                  ) : (
                    <button disabled>Call unavailable</button>
                  )}
                  <a href="/dashboard/bookings">Book Appointment</a>
                  <a href={`/support?topic=Location&centre=${c.id}`}>
                    Send Enquiry
                  </a>
                </footer>
              </article>
            ))
          ) : (
            <div className="location-empty">
              <h2>No matching locations.</h2>
              <p>
                Clear the filters or submit a support request for coverage
                assistance.
              </p>
              <button
                onClick={() => {
                  setQ("");
                  setState("");
                }}
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>
      <footer className="location-disclaimer">
        Distances, availability and waiting periods are estimates—not live stock
        claims. Confirm all details before travel or payment.
      </footer>
    </main>
  );
}

type Ticket = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  category: string;
  subject: string;
  description: string;
  vehicle: string;
  pageUrl: string;
  contact: string;
  fileName: string;
  status: string;
  created: string;
};
const categories = [
  "Account and Login",
  "Explore Cars",
  "Vehicle Images",
  "MAX 3D Viewer",
  "AR and VR Compatibility",
  "Test-Drive Booking",
  "Purchase and Reservation",
  "EMI and Finance",
  "Sell Your Car",
  "Location",
  "Technical Problems",
  "Privacy and Security",
  "Report a Bug",
  "Report Incorrect Vehicle Details",
  "Report Wrong Image",
  "Report Broken Video",
  "Report a Listing",
  "Request Callback",
];
const faqs = [
  [
    "Why is a vehicle angle unavailable?",
    "MAX CARS displays a placeholder whenever exact-model, exact-generation media has not been verified.",
  ],
  [
    "Are prices final?",
    "No. Ex-showroom and on-road values are estimates until confirmed by an authorised provider.",
  ],
  [
    "How do I report a wrong image?",
    "Choose Report Wrong Image, select the related vehicle and include the page URL.",
  ],
  [
    "Where can I track a ticket?",
    "Submitted tickets appear below this form and remain saved to this browser profile.",
  ],
  [
    "Can I request a callback?",
    "Yes. Select Request Callback and choose Phone as your preferred contact method.",
  ],
  [
    "What if MAX 3D does not load?",
    "Choose Performance quality or use the exact-model gallery fallback. Your selected vehicle and configuration controls remain available.",
  ],
  [
    "Why is AR or VR unavailable?",
    "AR and VR require a compatible browser and device. MAX CARS always keeps a standard interactive showroom alternative available.",
  ],
];

export function SupportV2() {
  const [tickets, setTickets] = useState<Ticket[]>([]),
    [done, setDone] = useState<Ticket | null>(null),
    [query, setQuery] = useState(""),
    [topic, setTopic] = useState("Technical Problems");
  useEffect(() => {
    setTickets(JSON.parse(localStorage.getItem("max-tickets") || "[]"));
    const p = new URLSearchParams(location.search);
    if (p.get("topic")) setTopic(p.get("topic")!);
  }, []);
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      ticket: Ticket = {
        id: `MC-SUP-${Date.now().toString().slice(-7)}`,
        name: String(f.get("name")),
        email: String(f.get("email")),
        mobile: String(f.get("mobile")),
        category: String(f.get("category")),
        subject: String(f.get("subject")),
        description: String(f.get("description")),
        vehicle: String(f.get("vehicle")),
        pageUrl: String(f.get("pageUrl")),
        contact: String(f.get("contact")),
        fileName: (f.get("screenshot") as File)?.name || "",
        status: "Submitted",
        created: new Date().toISOString(),
      },
      next = [ticket, ...tickets];
    localStorage.setItem("max-tickets", JSON.stringify(next));
    setTickets(next);
    setDone(ticket);
    e.currentTarget.reset();
    setTopic("Technical Problems");
  };
  const filtered = faqs.filter((x) =>
    `${x[0]} ${x[1]}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main className="support-v2">
      <section className="support-cinematic-hero">
        <header><small>MAX CARS SUPPORT</small><h1>Welcome to MAX CARS Support</h1><p>We’re here to assist you throughout your journey—from finding the right car to booking, purchasing, delivery and ownership.</p><strong>Tell us what you need, and our support team will guide you to the right solution.</strong><nav><button onClick={()=>{setTopic("Technical Problems");document.getElementById("support-ticket-v2")?.scrollIntoView({behavior:"smooth"})}}>Start Guided Support</button><a href="#support-ticket-v2">Create Support Ticket</a><a href="#support-tracking">Track Existing Ticket</a><a href="#support-help">Browse Help Centre</a></nav><div className="support-contact-actions"><a href="#support-ticket-v2">Submit a support request</a></div><em>Telephone, email and live chat are unavailable until verified support channels are connected. Tickets remain traceable on this device.</em></header>
        <SupportHeroMedia/>
      </section>
      <section className="service-story-grid support-story-grid" aria-label="MAX CARS support services">
        <button onClick={()=>{setTopic("Vehicle Images");document.getElementById("support-ticket-v2")?.scrollIntoView({behavior:"smooth"})}}><img src="/support-vehicle-guidance.jpg" alt="Professional automotive advisor presenting vehicle choices in a showroom" loading="lazy"/><span><small>VEHICLE GUIDANCE</small><b>Choose with confidence</b><em>Ask about a vehicle →</em></span></button>
        <button onClick={()=>{setTopic("Test-Drive Booking");document.getElementById("support-ticket-v2")?.scrollIntoView({behavior:"smooth"})}}><img src="/support-booking-help.jpg" alt="Automotive advisor coordinating a customer booking" loading="lazy"/><span><small>BOOKING ASSISTANCE</small><b>Keep every visit on track</b><em>Get booking help →</em></span></button>
        <button onClick={()=>{setTopic("Technical Problems");document.getElementById("support-ticket-v2")?.scrollIntoView({behavior:"smooth"})}}><img src="/support-advisor-review.jpg" alt="Showroom advisor reviewing automotive support information" loading="lazy"/><span><small>TECHNICAL SUPPORT</small><b>Resolve the issue precisely</b><em>Start troubleshooting →</em></span></button>
      </section>
      <section className="support-priority-grid" aria-label="Support quick actions">
        <article><b>01</b><h2>Vehicle accuracy</h2><p>Report a wrong image, specification or price against the exact vehicle record.</p><button onClick={() => setTopic("Report Wrong Image")}>Report catalogue issue</button></article>
        <article><b>02</b><h2>Booking help</h2><p>Get help with a test drive, inspection, service or reservation request.</p><button onClick={() => setTopic("Test-Drive Booking")}>Booking support</button></article>
        <article><b>03</b><h2>Account security</h2><p>Resolve sign-in, privacy, password and active-session concerns.</p><button onClick={() => setTopic("Account and Login")}>Account support</button></article>
        <article><b>04</b><h2>Track a request</h2><p>Every submitted ticket receives a reference and visible status history.</p><a href="#support-tracking">View my tickets</a></article>
        <article><b>05</b><h2>MAX 3D help</h2><p>Troubleshoot WebGL, reduced mode, missing assets and immersive-device compatibility.</p><button onClick={() => setTopic("MAX 3D Viewer")}>3D viewer support</button></article>
      </section>
      <label className="support-help-search" id="support-help">
        Search Help Articles
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search images, booking, finance or account help"
        />
      </label>
      <section className="support-faq">
        <h2>Frequently Asked Questions</h2>
        {filtered.map((x) => (
          <details key={x[0]}>
            <summary>{x[0]}</summary>
            <p>{x[1]}</p>
          </details>
        ))}
        {!filtered.length && (
          <p>No matching help article. Submit a ticket below.</p>
        )}
      </section>
      <section className="support-categories">
        {categories.map((x) => (
          <button
            className={topic === x ? "active" : ""}
            key={x}
            onClick={() => {
              setTopic(x);
              document
                .getElementById("support-ticket-v2")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {x}
          </button>
        ))}
      </section>
      {done && (
        <div className="support-confirm" role="status">
          <small>TICKET SUBMITTED</small>
          <h2>{done.id}</h2>
          <p>
            Your request is saved with status <b>Submitted</b>. Keep this number
            for tracking.
          </p>
        </div>
      )}
      <section className="support-ticket-v2" id="support-ticket-v2">
        <div>
          <small>SUBMIT SUPPORT TICKET</small>
          <h2>Tell us exactly what needs attention.</h2>
          <p>
            Required fields help route the request correctly. Uploaded
            screenshot names are saved locally in this demonstration; files are
            not transmitted.
          </p>
        </div>
        <form onSubmit={submit}>
          <label>
            Full name
            <input name="name" required minLength={2} />
          </label>
          <label>
            Email
            <input name="email" required type="email" />
          </label>
          <label>
            Mobile number
            <input name="mobile" required type="tel" pattern="[0-9]{10}" />
          </label>
          <label>
            Category
            <select
              name="category"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              {categories.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Subject
            <input name="subject" required />
          </label>
          <label>
            Related vehicle
            <select name="vehicle">
              <option>Not vehicle-specific</option>
              {cars.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.brand} {c.model} · {c.variant}
                </option>
              ))}
            </select>
          </label>
          <label className="full">
            Description
            <textarea name="description" rows={6} required minLength={20} />
          </label>
          <label>
            Page URL
            <input
              name="pageUrl"
              type="url"
              defaultValue={
                typeof location !== "undefined" ? location.href : ""
              }
            />
          </label>
          <label>
            Upload screenshot
            <input
              name="screenshot"
              type="file"
              accept="image/jpeg,image/png,image/webp"
            />
          </label>
          <label>
            Preferred contact method
            <select name="contact">
              <option>Email</option>
              <option>Phone</option>
            </select>
          </label>
          <button className="full" type="submit">
            Create Support Ticket
          </button>
        </form>
      </section>
      <section className="support-tracking" id="support-tracking">
        <header>
          <small>MY SUPPORT TICKETS</small>
          <h2>Track every request.</h2>
        </header>
        {tickets.length ? (
          tickets.map((t) => (
            <article key={t.id}>
              <b>{t.id}</b>
              <span>
                {t.category} · {t.subject}
              </span>
              <small>{new Date(t.created).toLocaleDateString("en-IN")}</small>
              <em>{t.status}</em>
            </article>
          ))
        ) : (
          <p>No support tickets saved on this device.</p>
        )}
        <footer>
          Available statuses: Submitted · In Review · Waiting for User · In
          Progress · Resolved · Closed
        </footer>
      </section>
    </main>
  );
}
