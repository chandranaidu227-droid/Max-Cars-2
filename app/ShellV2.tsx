"use client";
import { useEffect, useState } from "react";
import ProfileMenu from "./ProfileMenu";
import { cars, short } from "./data";
import VehicleImage from "./VehicleImage";
type IconName =
  | "home"
  | "explore"
  | "max3d"
  | "compare"
  | "electric"
  | "sell"
  | "location"
  | "support"
  | "search"
  | "heart"
  | "bell"
  | "user"
  | "palette"
  | "menu";
const paths: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V21h13V10.5M9 21v-6h6v6" />
    </>
  ),
  explore: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z" />
    </>
  ),
  max3d: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </>
  ),
  compare: (
    <>
      <path d="M7 5h12m0 0-3-3m3 3-3 3M17 19H5m0 0 3 3m-3-3 3-3" />
      <path d="M9 9h6v6H9z" />
    </>
  ),
  electric: <path d="m13 2-8 12h7l-1 8 8-12h-7z" />,
  sell: (
    <>
      <path d="M4 15.5h16l-1.5-5H5.5zM6 15.5V19M18 15.5V19" />
      <circle cx="7" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
      <path d="M12 3v7m-3-3 3 3 3-3" />
    </>
  ),
  location: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  support: (
    <>
      <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 13v5h3v-5zm16 0v5h-3v-5zM17 19c-1 2-3 2-5 2" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  heart: (
    <path d="M20.8 5.7c-2-2-5.2-2-7.2 0L12 7.3l-1.6-1.6c-2-2-5.2-2-7.2 0s-2 5.2 0 7.2L12 21l8.8-8.1c2-2 2-5.2 0-7.2z" />
  ),
  bell: (
    <>
      <path d="M6 17h12l-1.5-2V10a4.5 4.5 0 0 0-9 0v5z" />
      <path d="M10 20h4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18h1.3a2 2 0 0 0 1.4-3.4l-.5-.5a1.7 1.7 0 0 1 1.2-2.9H17a4 4 0 0 0 4-4C21 6.2 17 3 12 3Z" />
      <circle cx="7.5" cy="10" r=".8" fill="currentColor" stroke="none" />
      <circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="7" r=".8" fill="currentColor" stroke="none" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
};
function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="nav-icon"
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
const links = [
  { n: "Home", h: "/", i: "home" },
  { n: "Explore Cars", h: "/cars", i: "explore" },
  { n: "MAX 3D", h: "/max-3d", i: "max3d" },
  { n: "Compare", h: "/compare", i: "compare" },
  { n: "Electric", h: "/cars/electric", i: "electric" },
  { n: "Sell Your Car", h: "/sell", i: "sell" },
  { n: "Location", h: "/location", i: "location" },
  { n: "Support", h: "/support", i: "support" },
] as const;
const bottomLinks=[...links.filter(x=>["Home","Explore Cars","MAX 3D"].includes(x.n)),{n:"Saved",h:"/favourites",i:"heart" as IconName}];
function routeTheme(path:string){
  if(path==="/") return "home";
  if(path.startsWith("/cars/electric")) return "electric";
  if(path.startsWith("/cars")||path.startsWith("/explore")||path.startsWith("/search")||path.startsWith("/brands")) return "explore";
  if(path.startsWith("/max-3d")) return "max3d";
  if(path.startsWith("/compare")) return "compare";
  if(path.startsWith("/sell")) return "sell";
  if(path.startsWith("/location")||path.startsWith("/dealer")) return "location";
  if(path.startsWith("/support")||path.startsWith("/contact")) return "support";
  if(path.startsWith("/profile")||path.startsWith("/dashboard")) return "profile";
  if(path.startsWith("/finance")||path.startsWith("/insurance")) return "finance";
  return "default";
}
export default function ShellV2({ children }: { children: React.ReactNode }) {
  const [signed, setSigned] = useState(false),
    [name, setName] = useState("Driver"),
    [favs, setFavs] = useState(0),
    [mobile, setMobile] = useState(false),
    [searchOpen, setSearchOpen] = useState(false),
    [themeOpen, setThemeOpen] = useState(false),
    [theme, setTheme] = useState("graphite"),
    [searchQuery, setSearchQuery] = useState(""),
    [scrolled, setScrolled] = useState(false),
    [path, setPath] = useState("/");
  useEffect(() => {
    const sync = () => {
      try {
        const s = JSON.parse(localStorage.getItem("max-session") || "null");
        setSigned(!!s);
        setName(s?.name || "Driver");
        setFavs(JSON.parse(localStorage.getItem("max-favs") || "[]").length);
      } catch {}
    };
    sync();
    setPath(location.pathname);
    const onScroll = () => setScrolled(scrollY > 24);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {setSearchOpen(false);setThemeOpen(false)}
    };
    const onPointer = (e:MouseEvent) => {
      if(!(e.target as Element)?.closest?.(".theme-control")) setThemeOpen(false);
    };
    const savedTheme=localStorage.getItem("max-theme");
    const initialTheme=savedTheme==="titanium"?"graphite":savedTheme||"graphite";
    setTheme(initialTheme);
    document.documentElement.dataset.maxTheme=initialTheme;
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("keydown", onKey);
    addEventListener("mousedown", onPointer);
    addEventListener("storage", sync);
    addEventListener("max-state", sync);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("keydown", onKey);
      removeEventListener("mousedown", onPointer);
      removeEventListener("storage", sync);
      removeEventListener("max-state", sync);
    };
  }, []);
  const chooseTheme=(value:string)=>{
    setTheme(value);
    localStorage.setItem("max-theme",value);
    document.documentElement.setAttribute("data-max-theme",value);
    setThemeOpen(false);
  };
  useEffect(() => {
    document.body.style.overflow = mobile || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile, searchOpen]);
  const go = (h: string, locked?: boolean) =>
    locked && !signed ? `/login?returnTo=${encodeURIComponent(h)}` : h;
  const suggestions = cars
    .filter(
      (c) =>
        !searchQuery ||
        `${c.brand} ${c.model} ${c.variant}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    )
    .slice(0, 6);
  return (
    <>
      <header
        className={`global-nav nav-v2 ${scrolled ? "scrolled" : "at-top"}`}
      >
        <a className="mx-brand" href="/" aria-label="MX CARS home"><span>MX</span></a>
        <a className="logo" href="/">
          <b>
            MAX <em>CARS</em>
          </b>
          <small>PREMIUM AUTOMOTIVE</small>
        </a>
        <nav>
          {links.map((x) => (
            <a
              className={(x.h === "/" ? path === "/" : path.startsWith(x.h)) ? "active" : ""}
              href={go(x.h)}
              key={x.n}
            >
              <span className="nav-symbol" data-tooltip={x.n}><Icon name={x.i} /></span>
              {x.n}
            </a>
          ))}
        </nav>
        <div className="tools">
          <div className="theme-control">
            <button className="theme-button" aria-label="Change website colour theme" aria-expanded={themeOpen} onClick={()=>setThemeOpen(x=>!x)}><Icon name="palette"/></button>
            {themeOpen&&<section className="theme-picker" aria-label="Choose colour theme"><header><small>DISPLAY THEME</small><b>Choose your atmosphere</b></header>{[["graphite","Graphite Grey"],["titanium","Titanium Silver"],["midnight","Midnight Blue"],["burgundy","Burgundy Red"]].map(([value,label])=><button key={value} className={`${value} ${theme===value?"active":""}`} onClick={()=>chooseTheme(value)}><i/><span><b>{label}</b><small>{value==="graphite"?"Professional default":"Apply across MAX CARS"}</small></span>{theme===value&&<em>Selected</em>}</button>)}</section>}
          </div>
          <button
            className="nav-search-button"
            aria-label="Open vehicle search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen(true)}
          >
            <Icon name="search" />
          </button>
          <a
            aria-label="Saved cars"
            href={signed ? "/favourites" : "/login?returnTo=/favourites"}
          >
            <Icon name="heart" />
            <sup>{favs}</sup>
          </a>
          {signed && (
            <>
              <a aria-label="Notifications" href="/notifications">
                <Icon name="bell" />
              </a>
              <ProfileMenu name={name} />
            </>
          )}
          {!signed && (
            <a className="loginbtn" href="/login">
              <Icon name="user" /> Profile
            </a>
          )}
          <button
            className="hamb"
            onClick={() => setMobile(true)}
            aria-label="Open navigation"
          >
            <Icon name="menu" />
          </button>
        </div>
      </header>
      {searchOpen && (
        <div
          className="nav-search-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Search cars"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setSearchOpen(false)
          }
        >
          <section className="nav-search-panel">
            <header>
              <div>
                <small>MAX CARS SEARCH</small>
                <h2>Find your next car.</h2>
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                ×
              </button>
            </header>
            <label>
              <Icon name="search" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand, model or variant"
              />
            </label>
            <div>
              {suggestions.map((c) => (
                <a href={`/cars/${c.slug}`} key={c.id}>
                  <VehicleImage
                    src={c.image}
                    alt={`${c.brand} ${c.model}`}
                    sizes="100px"
                  />
                  <span>
                    <b>
                      {c.brand} {c.model}
                    </b>
                    <small>
                      {c.variant} · {short(c.price)}
                    </small>
                  </span>
                  <em>View →</em>
                </a>
              ))}
            </div>
            <footer>
              <a
                href={`/cars${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`}
              >
                View all search results
              </a>
              <button onClick={() => setSearchQuery("")}>Clear</button>
            </footer>
          </section>
        </div>
      )}
      {mobile && (
        <div
          className="mobile-menu nav-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <button
            onClick={() => setMobile(false)}
            aria-label="Close navigation"
          >
            ×
          </button>
          <a className="mobile-brand" href="/">
            <b>MAX <em>CARS</em></b>
          </a>
          {links.map((x) => (
            <a href={go(x.h)} key={x.n}>
              <span>
                <Icon name={x.i} />
                {x.n}
              </span>
              <span>→</span>
            </a>
          ))}
          <a href={signed ? "/profile" : "/login"}>
            <span>
              <Icon name="user" />
              {signed ? `${name} · My Profile` : "Profile / Log In"}
            </span>
            <span>→</span>
          </a>
        </div>
      )}
      <div className={`route-stage route-${routeTheme(path)}`}>{children}</div>
      <nav className="bottomnav">
        {bottomLinks.map((x) => (
          <a
            className={(x.h === "/" ? path === "/" : path.startsWith(x.h)) ? "active" : ""}
            href={go(x.h)}
            key={x.n}
          >
            <Icon name={x.i} />
            <small>{x.n.replace(" Cars", "").replace(" Your Car", "")}</small>
          </a>
        ))}
        <a href={signed ? "/profile" : "/login"}>
          <Icon name="user" />
          <small>Profile</small>
        </a>
      </nav>
      <footer className="site-footer-v2">
        <div className="footer-brand"><a className="logo" href="/" aria-label="MAX CARS home"><b>MAX <em>CARS</em></b></a><h2>Explore. Configure. Drive.</h2><p>Premium vehicle discovery, configuration and ownership support—connected around one verified vehicle record.</p><a className="footer-primary-action" href="/cars"><span>Start exploring</span><span aria-hidden="true">↗</span></a></div>
        <nav className="footer-links" aria-label="MAX CARS journey shortcuts">
          <section><b>Discover</b><a href="/cars"><Icon name="explore"/><span>Explore Cars<small>Browse the complete range</small></span><i>↗</i></a><a href="/compare"><Icon name="compare"/><span>Compare<small>See every difference</small></span><i>↗</i></a><a href="/cars/electric"><Icon name="electric"/><span>Electric<small>Discover the EV range</small></span><i>↗</i></a><a href="/max-3d"><Icon name="max3d"/><span>MAX Experience<small>Configure supported cars</small></span><i>↗</i></a></section>
          <section><b>Ownership</b><a href="/finance"><span className="footer-symbol">₹</span><span>Finance<small>Estimate your monthly plan</small></span><i>↗</i></a><a href="/sell"><Icon name="sell"/><span>Sell Your Car<small>Value and list your vehicle</small></span><i>↗</i></a><a href="/location"><Icon name="location"/><span>Locations<small>Find nearby automotive services</small></span><i>↗</i></a><a href="/book-test-drive"><span className="footer-symbol">D</span><span>Test Drive<small>Request a preferred time</small></span><i>↗</i></a></section>
          <section><b>Account</b><a href="/profile"><Icon name="user"/><span>My Profile<small>Manage your MAX CARS journey</small></span><i>↗</i></a><a href="/favourites"><Icon name="heart"/><span>Saved Cars<small>Return to your shortlist</small></span><i>↗</i></a><a href="/orders"><span className="footer-symbol">R</span><span>Reservations<small>Review active requests</small></span><i>↗</i></a><a href="/support"><Icon name="support"/><span>Support<small>Get precise assistance</small></span><i>↗</i></a></section>
        </nav>
        <div className="footer-bottom"><small>© 2026 MAX CARS · Demo inventory and indicative ex-showroom pricing.</small><span><a href="/support?topic=Privacy%20and%20Security">Privacy</a><a href="/contact">Contact</a></span></div>
      </footer>
    </>
  );
}
