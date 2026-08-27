"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { cars, money, short } from "./data";
import VehicleImage from "./VehicleImage";
import { vehicleMedia } from "./vehicle-detail-data";

type CartItem = {
  carId: string;
  colour?: string;
  wheels?: string;
  interior?: string;
  dealer?: string;
  reservation?: number;
};

type CheckoutDraft = {
  dealer: string;
  fullName: string;
  phone: string;
  email: string;
  deliveryMethod: "dealer" | "home";
  address1: string;
  city: string;
  state: string;
  postcode: string;
  hasTradeIn: boolean;
  tradeInRegistration: string;
  tradeInModel: string;
  contactPreference: "phone" | "email" | "whatsapp";
  acceptedTerms: boolean;
};

type FieldErrors = Partial<Record<keyof CheckoutDraft, string>>;

const emptyDraft: CheckoutDraft = {
  dealer: "MAX CARS Experience Centre — Mumbai",
  fullName: "",
  phone: "",
  email: "",
  deliveryMethod: "dealer",
  address1: "",
  city: "",
  state: "Maharashtra",
  postcode: "",
  hasTradeIn: false,
  tradeInRegistration: "",
  tradeInModel: "",
  contactPreference: "phone",
  acceptedTerms: false,
};

const dealers = [
  "MAX CARS Experience Centre — Mumbai",
  "MAX CARS Performance Hub — Bengaluru",
  "MAX CARS Electric Centre — Hyderabad",
  "MAX CARS Luxury Gallery — Delhi",
];

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function digits(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function createReference() {
  const stamp = Date.now().toString(36).slice(-6).toUpperCase();
  return `MC-RES-${stamp}`;
}

export default function CheckoutV2() {
  const [stage, setStage] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [draft, setDraft] = useState<CheckoutDraft>(emptyDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState("");
  const [restored, setRestored] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const submitLockRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let selected: CartItem[] = [];
      try {
        selected = JSON.parse(localStorage.getItem("max-cart") || "[]");
      } catch {}
      const slug = new URLSearchParams(location.search).get("car");
      const requested = slug ? cars.find((car) => car.slug === slug) : undefined;
      if (requested && !selected.some((item) => item.carId === requested.id)) {
        selected = [
          {
            carId: requested.id,
            colour: "Manufacturer colour shown",
            wheels: "Standard alloy wheels",
            interior: "Standard interior",
            dealer: emptyDraft.dealer,
            reservation: 25000,
          },
        ];
      }
      setCart(selected);
      try {
        const saved = JSON.parse(localStorage.getItem("max-checkout-draft") || "null");
        if (saved) {
          setDraft({ ...emptyDraft, ...saved });
          setRestored(true);
        }
      } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (stage < 3) headingRef.current?.focus();
  }, [stage]);

  useEffect(() => {
    if (errors && Object.keys(errors).length) errorRef.current?.focus();
  }, [errors]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem("max-checkout-draft", JSON.stringify(draft));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [draft]);

  const selectedCars = useMemo(
    () =>
      cart
        .map((item) => ({ item, car: cars.find((car) => car.id === item.carId) }))
        .filter((entry): entry is { item: CartItem; car: (typeof cars)[number] } => Boolean(entry.car)),
    [cart],
  );
  const reservationTotal = selectedCars.reduce(
    (sum, entry) => sum + (entry.item.reservation || 25000),
    0,
  );
  const estimatedVehicleTotal = selectedCars.reduce((sum, entry) => sum + entry.car.price, 0);

  const update = <K extends keyof CheckoutDraft>(key: K, value: CheckoutDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validateDetails = () => {
    const next: FieldErrors = {};
    if (draft.fullName.trim().length < 2) next.fullName = "Enter your full name.";
    if (digits(draft.phone).length !== 10) next.phone = "Enter a valid 10-digit mobile number.";
    if (!validEmail(draft.email)) next.email = "Enter a valid email address.";
    if (draft.deliveryMethod === "home") {
      if (draft.address1.trim().length < 5) next.address1 = "Enter a complete delivery address.";
      if (draft.city.trim().length < 2) next.city = "Enter your city.";
      if (!/^\d{6}$/.test(draft.postcode)) next.postcode = "Enter a valid 6-digit postcode.";
    }
    if (draft.hasTradeIn && draft.tradeInRegistration.trim().length < 5)
      next.tradeInRegistration = "Enter the registration number, or turn off trade-in.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goTo = (next: number) => {
    setErrors({});
    setStage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextStage = () => {
    if (stage === 0 && !selectedCars.length) return;
    if (stage === 1 && !validateDetails()) return;
    goTo(Math.min(stage + 1, 2));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!validateDetails()) {
      goTo(1);
      return;
    }
    if (!draft.acceptedTerms) {
      setErrors({ acceptedTerms: "Accept the reservation and dealer-verification terms to continue." });
      return;
    }
    if (submitting || submitLockRef.current) return;
    submitLockRef.current = true;
    setSubmitting(true);
    const id = createReference();
    const record = {
      id,
      status: "Dealer verification requested",
      created: new Date().toISOString(),
      cart,
      customer: {
        fullName: draft.fullName,
        phone: draft.phone,
        email: draft.email,
        contactPreference: draft.contactPreference,
      },
      fulfilment: {
        dealer: draft.dealer,
        deliveryMethod: draft.deliveryMethod,
        address:
          draft.deliveryMethod === "home"
            ? [draft.address1, draft.city, draft.state, draft.postcode].filter(Boolean).join(", ")
            : "Dealer pickup",
      },
      tradeIn: draft.hasTradeIn
        ? { registration: draft.tradeInRegistration, model: draft.tradeInModel }
        : null,
      payment: { mode: "test", collected: false, amount: 0 },
    };
    window.setTimeout(() => {
      localStorage.setItem("max-order", JSON.stringify(record));
      const orders = JSON.parse(localStorage.getItem("max-orders") || "[]");
      localStorage.setItem("max-orders", JSON.stringify([record, ...orders.filter((x: { id: string }) => x.id !== id)]));
      localStorage.removeItem("max-checkout-draft");
      setReference(id);
      submitLockRef.current = false;
      setSubmitting(false);
      setStage(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 550);
  };

  const fieldError = (key: keyof CheckoutDraft) =>
    errors[key] ? <small className="checkout-error">{errors[key]}</small> : null;

  return (
    <main className="smart-checkout">
      <header className="checkout-heading">
        <div>
          <span className="test-mode-badge">TEST MODE</span>
          <p>SECURE CHECKOUT</p>
          <h1 ref={headingRef} tabIndex={-1}>
            {stage === 3 ? "Reservation request received." : "Complete your reservation."}
          </h1>
          <p>
            {stage === 3
              ? "No payment was processed. Your selected dealer can now verify the request and contact you."
              : "Your information is protected during checkout. Live payments are currently unavailable until a certified gateway is configured."}
          </p>
        </div>
        <div className="checkout-trust" aria-label="Checkout status">
          <span aria-hidden="true">✓</span>
          <div><b>No card data collected</b><small>Dealer-verification request only</small></div>
        </div>
      </header>

      <nav className="smart-progress" aria-label="Checkout progress">
        {["Vehicle", "Details", "Payment", "Confirm"].map((label, index) => (
          <button
            type="button"
            key={label}
            className={`${index === stage ? "current" : ""} ${index < stage ? "complete" : ""}`}
            aria-current={index === stage ? "step" : undefined}
            disabled={index > stage || stage === 3}
            onClick={() => index < stage && goTo(index)}
          >
            <i>{index < stage ? "✓" : index + 1}</i><span>{label}</span>
          </button>
        ))}
      </nav>

      {stage === 3 ? (
        <section className="checkout-confirmation" aria-live="polite">
          <div className="confirmation-mark">✓</div>
          <span>RESERVATION CONFIRMED FOR REVIEW</span>
          <h2>{reference}</h2>
          <p>Keep this reference number. A dealer representative will verify availability, price and next steps before requesting any payment.</p>
          <div className="confirmation-grid">
            <article><small>Vehicle</small><b>{selectedCars.map(({ car }) => `${car.brand} ${car.model}`).join(", ") || "Selected vehicle"}</b><span>{selectedCars[0]?.car.variant || "Configuration saved"}</span></article>
            <article><small>Dealer</small><b>{draft.dealer}</b><span>{draft.deliveryMethod === "home" ? "Home delivery requested" : "Dealer pickup"}</span></article>
            <article><small>Customer</small><b>{draft.fullName}</b><span>{draft.phone} · {draft.email}</span></article>
            <article><small>Payment status</small><b>₹0 collected</b><span>Test mode · no payment processed</span></article>
          </div>
          <aside className="next-steps"><b>What happens next?</b><ol><li>The dealer checks the vehicle and configuration.</li><li>You receive availability and confirmed pricing.</li><li>A certified provider is used only when live payment is enabled.</li></ol></aside>
          <div className="confirmation-actions"><Link className="red" href={`/orders/${reference}`}>Track reservation</Link><Link className="ghost" href="/support">Contact support</Link><Link className="ghost" href="/cars">Continue exploring</Link></div>
        </section>
      ) : (
        <form className="checkout-layout" onSubmit={submit} noValidate>
          <section className="checkout-main-card">
            {Object.values(errors).some(Boolean) && (
              <div className="checkout-error-summary" ref={errorRef} tabIndex={-1} role="alert">
                <b>Please check the highlighted information.</b>
                <span>{Object.values(errors).filter(Boolean)[0]}</span>
              </div>
            )}

            {stage === 0 && (
              <div className="checkout-stage">
                <div className="stage-title"><span>01</span><div><h2>Vehicle & dealer</h2><p>Verify the exact configuration and fulfilment location.</p></div></div>
                {selectedCars.length ? selectedCars.map(({ car, item }) => (
                  <article className="checkout-vehicle" key={car.id}>
                    <VehicleImage
                      src={car.image}
                      alternates={vehicleMedia(car, "Catalogue colour").flatMap((media) => media.imageUrl ? [media.imageUrl] : [])}
                      alt={`${car.year} ${car.brand} ${car.model} ${car.variant}`}
                      sizes="190px"
                      loading="eager"
                    />
                    <div><small>{car.year} · {car.condition.toUpperCase()}</small><h3>{car.brand} {car.model}</h3><p>{car.variant}</p><ul><li>{item.colour || "Colour shown"}</li><li>{item.wheels || "Standard wheels"}</li><li>{item.interior || "Standard interior"}</li></ul><Link href={`/cars/${car.slug}`}>Edit configuration</Link></div>
                    <strong>{short(car.price)}<small>Estimated vehicle price</small></strong>
                  </article>
                )) : (
                  <div className="checkout-empty"><h3>No vehicle selected</h3><p>Select a vehicle before starting checkout.</p><Link className="red" href="/cars">Explore cars</Link></div>
                )}
                <label className="checkout-field">Fulfilment dealer<select value={draft.dealer} onChange={(e) => update("dealer", e.target.value)}>{dealers.map((dealer) => <option key={dealer}>{dealer}</option>)}</select><small>Availability and final pricing are confirmed by the selected dealer.</small></label>
              </div>
            )}

            {stage === 1 && (
              <div className="checkout-stage">
                <div className="stage-title"><span>02</span><div><h2>Your details</h2><p>Contact and fulfilment information in one short step.</p></div></div>
                {restored && <div className="draft-restored">✓ Your saved checkout details were restored on this device.</div>}
                <fieldset><legend>Contact details</legend><div className="field-grid">
                  <label className="checkout-field full">Full name *<input autoComplete="name" value={draft.fullName} onChange={(e) => update("fullName", e.target.value)} aria-invalid={Boolean(errors.fullName)} placeholder="e.g. Chandu Naidu" />{fieldError("fullName")}</label>
                  <label className="checkout-field">Mobile number *<div className="phone-input"><span>+91</span><input inputMode="numeric" autoComplete="tel-national" value={draft.phone} onChange={(e) => update("phone", digits(e.target.value))} aria-invalid={Boolean(errors.phone)} placeholder="10-digit number" /></div>{fieldError("phone")}</label>
                  <label className="checkout-field">Email address *<input type="email" autoComplete="email" value={draft.email} onBlur={() => draft.email && !validEmail(draft.email) && setErrors((e) => ({ ...e, email: "Enter a valid email address." }))} onChange={(e) => update("email", e.target.value.trim())} aria-invalid={Boolean(errors.email)} placeholder="name@example.com" />{fieldError("email")}</label>
                  <label className="checkout-field">Preferred contact<select value={draft.contactPreference} onChange={(e) => update("contactPreference", e.target.value as CheckoutDraft["contactPreference"])}><option value="phone">Phone call</option><option value="email">Email</option><option value="whatsapp">WhatsApp</option></select></label>
                </div></fieldset>
                <fieldset><legend>Fulfilment</legend><div className="choice-row"><button type="button" className={draft.deliveryMethod === "dealer" ? "selected" : ""} onClick={() => update("deliveryMethod", "dealer")}><b>Dealer pickup</b><span>Collect after dealer confirmation</span></button><button type="button" className={draft.deliveryMethod === "home" ? "selected" : ""} onClick={() => update("deliveryMethod", "home")}><b>Home delivery</b><span>Subject to location and dealer approval</span></button></div>
                  {draft.deliveryMethod === "home" && <div className="field-grid address-fields"><label className="checkout-field full">Address *<input autoComplete="street-address" value={draft.address1} onChange={(e) => update("address1", e.target.value)} aria-invalid={Boolean(errors.address1)} />{fieldError("address1")}</label><label className="checkout-field">City *<input autoComplete="address-level2" value={draft.city} onChange={(e) => update("city", e.target.value)} aria-invalid={Boolean(errors.city)} />{fieldError("city")}</label><label className="checkout-field">State<select autoComplete="address-level1" value={draft.state} onChange={(e) => update("state", e.target.value)}><option>Maharashtra</option><option>Telangana</option><option>Karnataka</option><option>Delhi</option><option>Tamil Nadu</option><option>Andhra Pradesh</option></select></label><label className="checkout-field">Postcode *<input inputMode="numeric" autoComplete="postal-code" maxLength={6} value={draft.postcode} onChange={(e) => update("postcode", e.target.value.replace(/\D/g, "").slice(0, 6))} aria-invalid={Boolean(errors.postcode)} />{fieldError("postcode")}</label></div>}
                </fieldset>
                <fieldset className="trade-in-fieldset"><legend>Trade-in <em>Optional</em></legend><button type="button" className="trade-toggle" aria-expanded={draft.hasTradeIn} onClick={() => update("hasTradeIn", !draft.hasTradeIn)}><span><b>{draft.hasTradeIn ? "Trade-in added" : "Have a car to trade in?"}</b><small>{draft.hasTradeIn ? "Add the basic vehicle details below." : "Skip this entirely or add it in seconds."}</small></span><i>{draft.hasTradeIn ? "−" : "+"}</i></button>{draft.hasTradeIn && <div className="field-grid trade-fields"><label className="checkout-field">Registration number *<input autoCapitalize="characters" value={draft.tradeInRegistration} onChange={(e) => update("tradeInRegistration", e.target.value.toUpperCase())} aria-invalid={Boolean(errors.tradeInRegistration)} placeholder="MH 01 AB 1234" />{fieldError("tradeInRegistration")}</label><label className="checkout-field">Make and model <span>Optional</span><input value={draft.tradeInModel} onChange={(e) => update("tradeInModel", e.target.value)} placeholder="e.g. Hyundai Creta" /></label><p className="full disclosure">An inspection is required before any final valuation. No guaranteed trade-in value is promised here.</p></div>}</fieldset>
              </div>
            )}

            {stage === 2 && (
              <div className="checkout-stage">
                <div className="stage-title"><span>03</span><div><h2>Payment & review</h2><p>Check everything before sending the reservation request.</p></div></div>
                <div className="payment-test-panel"><span>TEST MODE</span><div><h3>Live payments are currently unavailable.</h3><p>A certified payment gateway must be configured before real payments can be accepted. Submitting this form records a dealer-verification request only.</p></div></div>
                <div className="review-sections">
                  <article><header><h3>Vehicle & dealer</h3><button type="button" onClick={() => goTo(0)}>Edit</button></header><p><b>{selectedCars.map(({ car }) => `${car.brand} ${car.model} ${car.variant}`).join(", ")}</b></p><p>{draft.dealer}</p></article>
                  <article><header><h3>Customer</h3><button type="button" onClick={() => goTo(1)}>Edit</button></header><p><b>{draft.fullName}</b></p><p>+91 {draft.phone} · {draft.email}</p></article>
                  <article><header><h3>Fulfilment & trade-in</h3><button type="button" onClick={() => goTo(1)}>Edit</button></header><p><b>{draft.deliveryMethod === "home" ? "Home delivery requested" : "Dealer pickup"}</b></p><p>{draft.deliveryMethod === "home" ? [draft.address1, draft.city, draft.state, draft.postcode].filter(Boolean).join(", ") : draft.dealer}</p><p>{draft.hasTradeIn ? `Trade-in: ${draft.tradeInRegistration} ${draft.tradeInModel}` : "No trade-in"}</p></article>
                </div>
                <label className="terms-check"><input type="checkbox" checked={draft.acceptedTerms} onChange={(e) => update("acceptedTerms", e.target.checked)} /><span><b>I accept the reservation and dealer-verification terms.</b><small>I understand that prices and availability are estimates until confirmed, and no payment is collected in test mode.</small></span></label>{fieldError("acceptedTerms")}
              </div>
            )}

            <div className="checkout-actions">
              {stage > 0 ? <button type="button" className="checkout-back" onClick={() => goTo(stage - 1)}>← Back</button> : <Link className="checkout-back" href="/cart">← Back to cart</Link>}
              {stage < 2 ? <button type="button" className="red" onClick={nextStage} disabled={stage === 0 && !selectedCars.length}>Continue <span>→</span></button> : <button type="submit" className="red" disabled={submitting}>{submitting ? <><i className="submit-spinner" /> Sending request…</> : "Confirm reservation request"}</button>}
            </div>
          </section>

          <aside className="checkout-summary">
            <small>ORDER SUMMARY</small><h2>{selectedCars.length || 0} vehicle{selectedCars.length === 1 ? "" : "s"}</h2>
            {selectedCars.map(({ car }) => <div className="summary-car" key={car.id}><VehicleImage src={car.image} alternates={vehicleMedia(car, "Catalogue colour").flatMap((media) => media.imageUrl ? [media.imageUrl] : [])} alt={`${car.brand} ${car.model}`} sizes="68px" /><span><b>{car.brand} {car.model}</b><small>{car.variant}</small></span><strong>{short(car.price)}</strong></div>)}
            <dl><div><dt>Estimated vehicle price</dt><dd>{money(estimatedVehicleTotal)}</dd></div><div><dt>Reservation amount</dt><dd>{money(reservationTotal)}</dd></div><div><dt>Collected today</dt><dd>₹0</dd></div></dl>
            <p>Estimated prices only. Taxes, registration, delivery, offers and availability are confirmed by the dealer.</p>
            <div className="secure-note"><span aria-hidden="true">◇</span><div><b>Secure checkout</b><small>No raw payment details are requested or stored.</small></div></div>
          </aside>
        </form>
      )}
    </main>
  );
}
