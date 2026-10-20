#!/usr/bin/env python3
"""Builds the MokPixel static site (one folder per page) from shared partials.
Run:  python3 _build/build.py   (from the mokpixel folder)"""
import json, os, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://mokinho.github.io/mokpixel/"
PHONE_DISPLAY = "019-636 9900"
PHONE_INTL = "+60196369900"
WA = "https://wa.me/60196369900"
EMAIL = "muhammadfaiqzharfan.johari@gmail.com"
VER = "5"

ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12L12 4M6 4h6v6"/></svg>'
ARROW_R = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>'
WA_ICON = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-3.9-.5-5.6-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.4c.2.2 2.4 3.6 5.7 5 2.1.9 2.9 1 4 .8.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>'

PAGES = [
    ("home", "", "Home"),
    ("about", "about/", "About"),
    ("services", "services/", "Services"),
    ("projects", "projects/", "Projects"),
    ("process", "process/", "Process"),
    ("contact", "contact/", "Contact"),
]

PROJECTS = [
    # (client, type, image, w, h, categories, alt)
    ("MMHE #KSCCS", "Safety sticker roll", "work-roll-sticker.webp", 1800, 1350, "stickers", "Rolls of round KSCCS safety campaign stickers for MMHE"),
    ("Dapur Ibu", "Menu billboard", "work-dapur-ibu.webp", 1800, 1350, "posters mockups", "Dapur Ibu restaurant menu billboard mockup on a red building"),
    ("Barkoba FC", "Social media feed", "work-barkoba.webp", 563, 563, "social", "Barkoba FC Instagram feed design shown on a phone"),
    ("Lovely Haaniy", "Birthday backdrop", "work-lovely-haaniy.webp", 1489, 973, "posters", "Pastel ice-cream themed birthday backdrop design for Lovely Haaniy"),
    ("Malaysia Olympic", "Jersey mockup", "svc-viz-jersey.webp", 1049, 1049, "mockups", "Black and gold Malaysia Olympic long-sleeve jersey mockup"),
    ("Beckham", "Tribute poster", "svc-poster.webp", 1800, 1350, "posters", "David Beckham tribute poster with neon frame details"),
    ("MMHE #KSCCS", "Circle sticker", "work-circle-sticker.webp", 1800, 1350, "stickers", "Peeling circle sticker for the KSCCS safety campaign"),
    ("Quotes", "Poster series", "work-quotes.webp", 1800, 1350, "posters", "Three framed motivational quote posters on a wooden wall"),
    ("MokPixel", "Brand t-shirt", "home-bg-a.webp", 1800, 1200, "branding mockups", "Neon green t-shirt mockup with the mokpixel wordmark"),
    ("MokPixel", "Paper bag mockup", "g-bag.webp", 1280, 960, "branding mockups", "Black paper bag mockup with the white MokPixel P logo"),
    ("MokPixel", "Logo sticker", "g-sticker-logo.webp", 1280, 1280, "branding stickers", "Round neon sticker with the MokPixel P logo"),
    ("MokPixel", "Sticker rolls", "g-roller-sticker.webp", 1280, 1280, "branding stickers", "Rolls of neon MokPixel logo stickers"),
    ("MokPixel", "Pin badges", "hiw-bg.webp", 1800, 1350, "branding", "Pile of neon and silver MokPixel pin badges"),
    ("MokPixel", "Shipping container", "hiw-mockup.webp", 1800, 883, "branding mockups", "Neon green shipping container branded with MokPixel"),
    ("MokPixel", "Product render", "work-bg.webp", 1800, 1350, "mockups", "Neon green road bike product render"),
    ("MokPixel", "Billboard", "work-x3.webp", 1152, 883, "posters mockups", "Neon billboard reading Bring your designs to life"),
    ("MokPixel", "Keycard mockup", "hero.webp", 1453, 1800, "mockups", "Keycard mockup with a neon illustrated character"),
]

QUOTES = [
    ("Working with Mokpixel was a game-changer. Their team created a stunning logo that perfectly captured our brand’s essence, elevating our market presence. Highly recommended!", "Afiq Iqbal", "MMHE Holdings Berhad", "t-afiq.webp"),
    ("The Mokpixel team was fantastic to work with. They took our ideas and turned them into stunning visuals that helped us achieve our goals.", "Zulhilmi", "MMHE Holdings Berhad", "t-zulhilmi.webp"),
    ("We were absolutely thrilled with the backdrop design for our client’s birthday event. The design was vibrant, creative, and perfectly suited our theme. The attention to detail was exceptional.", "Adila Zulhaidi", "Lovely Haaniy", "t-adila.webp"),
]

STEPS = [
    ("Inquiry & brief", "Tell us about your brand, your audience and what you need. We ask the right questions so we understand your vision and goals.", "Brief"),
    ("Scope & agreement", "You receive a clear proposal with the deliverables, timeline and price. Nothing starts until you’re happy with it.", "Brief"),
    ("Deposit", "We send an invoice for the agreed deposit. Work begins as soon as payment is confirmed.", "Brief"),
    ("Research", "We study your industry, your competitors and current design trends so your visuals stand out for the right reasons.", "Create"),
    ("Initial concepts", "We design two to three directions based on your brief and our research, so you have real options to choose from.", "Create"),
    ("Your feedback", "We present the concepts and walk you through them. You tell us what you love and what to change.", "Create"),
    ("Refine & finalize", "We revise the chosen direction based on your feedback and polish every detail.", "Refine"),
    ("Approval", "You review the final design and sign off only when you’re fully satisfied.", "Refine"),
    ("Final payment", "We invoice the remaining balance and confirm payment before delivery.", "Deliver"),
    ("Delivery", "Your final files arrive secure, organized and ready to use.", "Deliver"),
    ("Follow-up & support", "Need a tweak or a new size later? We’re here to help, and we’d love to hear your feedback.", "Deliver"),
]

FAQ_ALL = {
    "cost": ("How much does a logo design cost in Malaysia with MokPixel?",
             "Logo branding starts from RM25, and mockup and poster design start from RM30. Your final price depends on what you need, and it’s agreed in a written proposal before any work begins, so there are no surprises."),
    "book": ("How do I book a design?",
             "Fill in the booking form or message us on WhatsApp at 019-636 9900. We’ll discuss your brief, send a proposal with deliverables, timeline and price, and start once the deposit is confirmed."),
    "time": ("How long does a design project take?",
             "It depends on the size of the project. We agree the timeline with you in the proposal at the start, so you know exactly when to expect your concepts and final files."),
    "changes": ("Can I ask for changes to my design?",
                "Yes. You’ll see two to three initial concepts, give your feedback, and we refine the chosen direction until you approve the final design."),
    "pay": ("Do I need to pay the full amount upfront?",
            "No. You pay a deposit to start, and the remaining balance before the final files are delivered."),
    "files": ("What will I receive at the end?",
              "Your final design files, delivered securely and neatly organized. Tell us where you’ll use the design (print, social media, signage) and we’ll agree the files you need in the proposal."),
    "who": ("Who have you designed for?",
            "Our clients include teams at MMHE Holdings Berhad, Lovely Haaniy, Dapur Ibu and Barkoba FC, with work ranging from safety campaign stickers to menu billboards, event backdrops and social media feeds."),
}

SERVICES = [
    {
        "key": "Logo branding", "slug": "logo-branding", "num": "01", "title": "Logo branding", "price": "RM25",
        "short": "An original logo that captures who you are and stands out in a crowded market.",
        "h2": "Logo design that becomes the face of your brand",
        "body": [
            "A well-designed logo is the cornerstone of your brand’s identity. At MokPixel we craft logos that look stunning and resonate with your target audience.",
            "We work closely with you to understand your vision and values, so the final mark is a true reflection of your brand. We focus on originality and creativity, so your logo stands out instead of blending in. You’re not just getting a logo, you’re investing in the future of your brand.",
        ],
        "ticks": ["A brief session to understand your brand and audience", "Two to three original logo concepts", "Revisions based on your feedback", "Organized final files ready for print and digital"],
        "gallery": [("g-bag.webp", "MokPixel P logo on a black paper bag", ""), ("g-sticker-logo.webp", "Round neon MokPixel logo sticker", ""), ("hiw-bg.webp", "Neon MokPixel pin badges", "wide")],
    },
    {
        "key": "Design visualizations", "slug": "mockups", "num": "02", "title": "Mockups & design visualization", "price": "RM30",
        "short": "See your design in the real world before you print, launch or pitch it.",
        "h2": "Mockups that bring your design to life",
        "body": [
            "MokPixel designs attention-grabbing mockups that show your brand on real products and real places: apparel, packaging, signage, devices and more.",
            "Whether it’s for an event, a promotion or online advertising, a strong mockup helps you sell the idea, win approval faster and leave a lasting impression on your audience. We balance aesthetics and function to drive engagement.",
        ],
        "ticks": ["Realistic product, apparel and signage mockups", "Ideal for pitches, launches and social media", "Revisions based on your feedback", "High-quality images ready to post or present"],
        "gallery": [("svc-viz-jersey.webp", "Malaysia Olympic jersey mockup", ""), ("g-roller-sticker.webp", "Rolls of neon logo stickers", ""), ("hiw-mockup.webp", "Neon shipping container mockup", "wide")],
    },
    {
        "key": "Poster design", "slug": "poster-design", "num": "03", "title": "Poster design", "price": "RM30",
        "short": "Bold posters for events, campaigns and promotions that get people to show up.",
        "h2": "Poster design that gets your event noticed",
        "body": [
            "Posters are still one of the most powerful ways to promote an event or share a message. Our designers create vibrant, impactful posters that capture your theme and engage your audience.",
            "Whether it’s a concert, a workshop, a menu board or a promotional campaign, we design posters that make your event impossible to miss and help you attract more attendees.",
        ],
        "ticks": ["Event, promotion, menu and campaign posters", "Layouts built around your theme and message", "Revisions based on your feedback", "Print-ready and social-ready versions"],
        "gallery": [("svc-poster.webp", "David Beckham tribute poster", ""), ("work-quotes.webp", "Framed motivational quote posters", ""), ("work-dapur-ibu.webp", "Dapur Ibu menu billboard", "wide")],
    },
]

e = html.escape


def rel(page_path):
    """prefix to reach site root from a page folder"""
    return "../" * page_path.count("/")


def head(meta, path, schema):
    r = rel(path)
    canonical = BASE + path
    out = f"""<!doctype html>
<html lang="en-MY">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{e(meta['title'])}</title>
  <meta name="description" content="{e(meta['desc'])}">
  <link rel="canonical" href="{canonical}">
  <meta name="theme-color" content="#000000">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="MokPixel">
  <meta property="og:locale" content="en_MY">
  <meta property="og:title" content="{e(meta['title'])}">
  <meta property="og:description" content="{e(meta['desc'])}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{BASE}assets/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="{r}assets/favicon.png">
  <link rel="apple-touch-icon" href="{r}assets/apple-touch-icon.png">
  <link rel="preload" href="{r}assets/fonts/mona.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="{r}assets/css/site.css?v={VER}">
  <script>document.documentElement.classList.add("js")</script>
"""
    for s in schema:
        out += '  <script type="application/ld+json">' + json.dumps(s, ensure_ascii=False) + "</script>\n"
    return out + "</head>\n"


def header(active, path):
    r = rel(path)
    links = "".join(
        f'<a href="{r}{p or "./"}"' + (' aria-current="page"' if k == active else "") + f">{label}</a>"
        for k, p, label in PAGES
    )
    return f"""<body>
<a class="skip" href="#main">Skip to content</a>
<div class="gridlines" aria-hidden="true"><div class="wrap"><div></div></div></div>
<header class="hdr">
  <div class="wrap hdr-in">
    <a class="logo" href="{r or './'}" aria-label="MokPixel home"><span class="logo-mark" aria-hidden="true"></span>mokpixel</a>
    <nav class="nav" id="nav" aria-label="Main">{links}<a class="btn btn-neon" href="{r}contact/#book">Book a design {ARROW}</a></nav>
    <a class="btn btn-neon btn-sm hdr-cta" href="{r}contact/#book">Book a design {ARROW}</a>
    <button class="burger" aria-expanded="false" aria-controls="nav" aria-label="Open menu"><span></span><span></span></button>
  </div>
</header>
<main id="main">
"""


def footer(path):
    r = rel(path)
    page_links = "".join(f'<li><a href="{r}{p or "./"}">{label}</a></li>' for k, p, label in PAGES)
    svc_links = "".join(f'<li><a href="{r}services/#{s["slug"]}">{s["title"]}</a></li>' for s in SERVICES)
    track = "".join(f"<span>Book a design</span><i>✦</i>" for _ in range(6))
    return f"""</main>
<a class="cta-marquee" href="{r}contact/#book" aria-label="Book a design"><div class="cta-track" aria-hidden="true">{track}</div></a>
<footer class="ftr">
  <div class="wrap">
    <div class="ftr-top">
      <div>
        <h2 class="h-lg">Let’s make something great together.</h2>
        <a class="btn btn-neon" href="{r}contact/#book">Book a design {ARROW}</a>
      </div>
      <div><h3>Pages</h3><ul>{page_links}</ul></div>
      <div><h3>Services</h3><ul>{svc_links}</ul></div>
      <div><h3>Contact</h3><ul>
        <li><a href="{WA}" target="_blank" rel="noopener">WhatsApp {PHONE_DISPLAY}</a></li>
        <li><a href="tel:{PHONE_INTL}">Call {PHONE_DISPLAY}</a></li>
        <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
        <li class="muted">Pantai Dalam, Kuala Lumpur</li>
      </ul></div>
    </div>
    <div class="ftr-bottom">
      <p>© <span data-year>2026</span> MokPixel. Logo, mockup &amp; poster design in Kuala Lumpur, Malaysia.</p>
      <p>Open 7 days a week</p>
    </div>
  </div>
</footer>
<a class="fab" href="{WA}?text={'Hi%20MokPixel%2C%20I%27d%20like%20to%20book%20a%20design.'}" target="_blank" rel="noopener" aria-label="Book a design on WhatsApp">{WA_ICON}<span>Book on WhatsApp</span></a>
<script src="{r}assets/js/site.js?v={VER}" defer></script>
</body>
</html>
"""


def crumbs(path, label):
    r = rel(path)
    return f'<ol class="crumbs" aria-label="Breadcrumb"><li><a href="{r}">Home</a></li><li aria-current="page">{label}</li></ol>'


def breadcrumb_schema(path, label):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE},
        {"@type": "ListItem", "position": 2, "name": label, "item": BASE + path}]}


def faq_schema(keys):
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": FAQ_ALL[k][0], "acceptedAnswer": {"@type": "Answer", "text": FAQ_ALL[k][1]}} for k in keys]}


BUSINESS = {
    "@context": "https://schema.org", "@type": "ProfessionalService", "@id": BASE + "#business",
    "name": "MokPixel", "url": BASE, "logo": BASE + "assets/apple-touch-icon.png", "image": BASE + "assets/og-image.jpg",
    "description": "MokPixel is a graphic design studio in Kuala Lumpur, Malaysia, offering logo branding, mockup design and poster design.",
    "telephone": PHONE_INTL, "email": EMAIL, "priceRange": "From RM25",
    "address": {"@type": "PostalAddress", "addressLocality": "Kuala Lumpur", "addressRegion": "Wilayah Persekutuan Kuala Lumpur", "addressCountry": "MY"},
    "areaServed": {"@type": "Country", "name": "Malaysia"},
    "openingHoursSpecification": [
        {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "09:00", "closes": "22:00"},
        {"@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "18:00"},
        {"@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "09:00", "closes": "12:00"}],
    "makesOffer": [{"@type": "Offer", "itemOffered": {"@type": "Service", "name": s["title"]}, "priceSpecification": {"@type": "PriceSpecification", "minPrice": float(s["price"][2:]), "priceCurrency": "MYR"}} for s in SERVICES],
}


def quotes_html():
    out = ""
    for q, name, org, img in QUOTES:
        out += f"""<blockquote class="quote reveal">
        <p>“{e(q)}”</p>
        <footer><img src="{{r}}assets/img/{img}" alt="{e(name)}" width="46" height="46" loading="lazy"><span><strong>{e(name)}</strong>{e(org)}</span></footer>
      </blockquote>"""
    return out


def faq_html(keys, open_first=True):
    out = '<div class="faq">'
    for i, k in enumerate(keys):
        q, a = FAQ_ALL[k]
        out += f'<details{" open" if (i == 0 and open_first) else ""}><summary>{e(q)}</summary><p>{e(a)}</p></details>'
    return out + "</div>"


def proj_card(p, r, idx, heading="h3"):
    client, typ, img, w, h, cats, alt = p
    return f"""<figure class="proj reveal" data-cat="{cats}">
        <button class="proj-img" type="button" data-lightbox="{idx}" aria-label="View {e(client)}, {e(typ)}"><img src="{r}assets/img/{img}" alt="{e(alt)}" width="{w}" height="{h}" loading="lazy"></button>
        <figcaption class="proj-cap"><b>{e(client)}</b><span>{e(typ)}</span></figcaption>
      </figure>"""


def lightbox(r):
    data = [{"src": f"{r}assets/img/{p[2]}", "alt": p[6], "client": p[0], "type": p[1]} for p in PROJECTS]
    return f"""<dialog class="lightbox" aria-label="Project preview">
  <button class="lb-close" type="button" aria-label="Close">×</button>
  <img alt="">
  <div class="lb-bar"><p><b></b> <span></span></p><a class="btn btn-neon btn-sm" href="{r}contact/#book">Book a similar design {ARROW}</a></div>
</dialog>
<script>window.MP_PROJECTS={json.dumps(data, ensure_ascii=False)};</script>
"""


def cta_block(r, title="Ready to see your idea as a real visual?", text="Tell us what you need today. You’ll get a clear proposal with deliverables, timeline and price before any work starts."):
    return f"""<section class="section-tight">
    <div class="wrap">
      <div class="cta-box reveal">
        <div class="stack">
          <span class="kicker">Book a design</span>
          <h2 class="h-xl">{title}</h2>
          <p class="lede">{text}</p>
        </div>
        <div class="cta-actions">
          <a class="btn btn-dark" href="{r}contact/#book">Book a design {ARROW}</a>
          <a class="btn btn-dark-line" href="{WA}?text=Hi%20MokPixel%2C%20I%27d%20like%20to%20book%20a%20design." target="_blank" rel="noopener">WhatsApp us</a>
        </div>
      </div>
    </div>
  </section>"""


def facts():
    return """<div class="facts reveal">
        <div class="fact"><b>RM25</b><span>Logo design starting price</span></div>
        <div class="fact"><b>3</b><span>Core design services</span></div>
        <div class="fact"><b>11</b><span>Clear steps, no surprises</span></div>
        <div class="fact"><b>7 days</b><span>Open every day of the week</span></div>
      </div>"""


def burst_svg():
    lines = []
    import math
    n = 72
    for i in range(n):
        a = 2 * math.pi * i / n
        r1, r2 = 30, 96 if i % 2 == 0 else 80
        x1, y1 = 100 + r1 * math.cos(a), 100 + r1 * math.sin(a)
        x2, y2 = 100 + r2 * math.cos(a), 100 + r2 * math.sin(a)
        lines.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}"/>')
    return f'<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="98" fill="#c6f31d"/>{"".join(lines)}</svg>'


# ======================================================================
def page_home():
    path = ""
    r = rel(path)
    meta = {"title": "Logo, Mockup & Poster Design in Kuala Lumpur | MokPixel",
            "desc": "Affordable logo design from RM25, plus mockup and poster design from RM30. MokPixel is a Kuala Lumpur design studio that turns your ideas into visuals. Book a design today."}
    faces = "".join(f'<img src="{r}assets/img/{q[3]}" alt="" width="38" height="38">' for q in QUOTES)
    svc = ""
    for s in SERVICES:
        svc += f"""<article class="svc-card reveal">
          <span class="svc-num" aria-hidden="true">{s['num']}</span>
          <h3 class="h-md">{s['title']}</h3>
          <p>{s['short']}</p>
          <p class="svc-from">From <b>{s['price']}</b></p>
          <a class="arrow-link" href="{r}services/#{s['slug']}">Learn more {ARROW_R}<span class="sr-only"> about {s['title']}</span></a>
        </article>"""
    featured = [0, 1, 2, 3, 4, 5]
    projs = "".join(proj_card(PROJECTS[i], r, i) for i in featured)
    mini = [
        ("Brief & proposal", "Share your idea. Get a clear proposal with deliverables, timeline and price."),
        ("Research & concepts", "We study your market and design two to three concepts for you."),
        ("Refine & approve", "Your feedback shapes the final design. You approve before we finish."),
        ("Deliver & support", "Organized final files, plus follow-up support whenever you need it."),
    ]
    mini_html = "".join(f'<div class="mini-step reveal"><span class="kicker">Step {i+1}</span><h3 class="h-md">{t}</h3><p>{d}</p></div>' for i, (t, d) in enumerate(mini))
    body = f"""
  <section class="hero">
    <div class="burst" aria-hidden="true">{burst_svg()}</div>
    <div class="wrap">
      <span class="hero-word" aria-hidden="true">visuals</span>
      <div class="hero-grid">
        <h1 class="h-display">Logo, mockup &amp; poster design that turns ideas into visuals.</h1>
        <div class="hero-side">
          <p class="lede">Original, affordable design for startups and growing businesses in Malaysia. Logo branding starts from <strong class="neon">RM25</strong>.</p>
          <div class="hero-actions">
            <a class="btn btn-neon" href="{r}contact/#book">Book a design {ARROW}</a>
            <a class="btn btn-line" href="{r}projects/">See our work</a>
          </div>
          <div class="trust"><div class="trust-faces">{faces}</div><p>Trusted by teams at <strong>MMHE Holdings Berhad</strong> and <strong>Lovely Haaniy</strong></p></div>
        </div>
      </div>
      <figure class="hero-photo"><img src="{r}assets/img/home-bg-a.webp" alt="Neon green MokPixel brand t-shirt mockup" width="1800" height="1200" fetchpriority="high"></figure>
    </div>
  </section>

  <section class="section-tight">
    <div class="wrap">
      <div class="clients reveal">
        <p class="muted">Brands we’ve designed for</p>
        <ul><li>MMHE Holdings Berhad</li><li>Lovely Haaniy</li><li>Dapur Ibu</li><li>Barkoba FC</li></ul>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="split">
        <h2 class="h-xl reveal">Design that works as hard as you do.</h2>
        <div class="stack reveal prose">
          <p>MokPixel is a design studio in Kuala Lumpur that creates <strong>logos, mockups and posters</strong> for startups and established businesses. We take the time to understand your vision, then translate it into visuals that resonate with your audience.</p>
          <p>The result: a brand people recognise, promotions that get noticed, and designs you’re proud to put your name on, at prices that make sense for growing businesses.</p>
          <a class="dot-link" href="{r}about/">About MokPixel</a>
        </div>
      </div>
      <div style="margin-top: clamp(48px,6vw,88px)">{facts()}</div>
    </div>
  </section>

  <section class="section band">
    <div class="wrap">
      <div class="sec-head">
        <div><span class="kicker">Services</span><h2 class="h-xl">What we can design for you</h2></div>
        <a class="dot-link" href="{r}services/">All services &amp; pricing</a>
      </div>
      <div class="svc-grid">{svc}</div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="sec-head">
        <div><span class="kicker">Selected projects</span><h2 class="h-xl">Real work for real brands</h2></div>
        <a class="dot-link" href="{r}projects/">Explore all projects</a>
      </div>
      <div class="proj-grid">{projs}</div>
    </div>
  </section>

  <section class="section band">
    <div class="wrap">
      <div class="sec-head">
        <div><span class="kicker">How it works</span><h2 class="h-xl">From idea to final files in four stages</h2><p class="lede">A clear, step-by-step process with the price agreed upfront. You always know what happens next.</p></div>
        <a class="dot-link" href="{r}process/">See the full process</a>
      </div>
      <div class="mini-steps">{mini_html}</div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="sec-head"><div><span class="kicker">Client reviews</span><h2 class="h-xl">What our clients say</h2></div></div>
      <div class="quotes">{quotes_html().replace('{r}', r)}</div>
    </div>
  </section>

  <section class="section band">
    <div class="wrap split">
      <div class="stack"><span class="kicker">FAQ</span><h2 class="h-xl">Questions before you book?</h2><p class="lede">Quick answers about pricing, timing and how booking works. Still unsure? Message us on WhatsApp.</p><a class="btn btn-line" href="{WA}" target="_blank" rel="noopener">Ask on WhatsApp</a></div>
      {faq_html(['cost', 'book', 'time', 'changes', 'pay'])}
    </div>
  </section>

  {cta_block(r)}
  {lightbox(r)}
"""
    schema = [BUSINESS, {"@context": "https://schema.org", "@type": "WebSite", "name": "MokPixel", "url": BASE}, faq_schema(['cost', 'book', 'time', 'changes', 'pay'])]
    return path, head(meta, path, schema) + header("home", path) + body + footer(path)


def page_about():
    path = "about/"
    r = rel(path)
    meta = {"title": "About MokPixel | Graphic Design Studio in Kuala Lumpur",
            "desc": "MokPixel is a Kuala Lumpur graphic design studio creating original logos, mockups and posters for startups and established businesses. Meet the studio and book a design."}
    values = [
        ("We listen first", "Every project starts with understanding your vision, your values and your audience. Great design begins with the right questions."),
        ("Original, every time", "No templates passed off as custom work. We focus on originality and creativity so your brand stands out in a crowded market."),
        ("Quality you can afford", "Professional design shouldn’t be out of reach. Logos start from RM25, and the price is agreed upfront in your proposal."),
    ]
    vals = "".join(f'<article class="svc-card reveal"><span class="svc-num" aria-hidden="true">0{i+1}</span><h3 class="h-md">{t}</h3><p>{d}</p></article>' for i, (t, d) in enumerate(values))
    body = f"""
  <section class="page-hero">
    <div class="wrap">
      {crumbs(path, 'About')}
      <div class="page-hero-row">
        <h1 class="h-display">A Kuala Lumpur design studio that turns ideas into visuals.</h1>
        <a class="btn btn-neon" href="{r}contact/#book">Book a design {ARROW}</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap split">
      <figure class="split-media reveal" style="aspect-ratio:4/5"><img src="{r}assets/img/hero.webp" alt="MokPixel keycard mockup with a neon illustrated character" width="1453" height="1800" loading="lazy"></figure>
      <div class="stack prose reveal">
        <span class="kicker">Our story</span>
        <h2 class="h-lg">Visuals that elevate your brand</h2>
        <p>MokPixel specialises in creating stunning visuals that elevate your brand. From our studio in Kuala Lumpur, we craft captivating <strong>logos</strong>, eye-catching <strong>mockups</strong> and impactful <strong>posters</strong>.</p>
        <p>We understand that behind every brief is a business with real goals: a launch, an event, a campaign, a fresh start. So we take the time to understand your vision and translate it into designs that resonate with your audience.</p>
        <p>Whether you’re a startup finding your identity or an established business ready for a refresh, we help you stand out in the market.</p>
        <a class="dot-link" href="{r}projects/">See our projects</a>
      </div>
    </div>
  </section>

  <section class="section band">
    <div class="wrap">
      <div class="sec-head"><div><span class="kicker">What we believe</span><h2 class="h-xl">Three promises on every project</h2></div></div>
      <div class="svc-grid">{vals}</div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      {facts()}
      <blockquote class="big-quote reveal">
        <p>“Mockups breathe life into your designs, transforming abstract concepts into tangible realities.”</p>
        <footer>MokPixel</footer>
      </blockquote>
    </div>
  </section>

  <section class="section band">
    <div class="wrap">
      <div class="sec-head"><div><span class="kicker">Client reviews</span><h2 class="h-xl">Brands that trust MokPixel</h2></div><a class="dot-link" href="{r}projects/">See the work</a></div>
      <div class="quotes">{quotes_html().replace('{r}', r)}</div>
    </div>
  </section>

  {cta_block(r, "Let’s design something your customers remember.")}
"""
    schema = [BUSINESS, breadcrumb_schema(path, "About"), {"@context": "https://schema.org", "@type": "AboutPage", "name": meta["title"], "url": BASE + path}]
    return path, head(meta, path, schema) + header("about", path) + body + footer(path)


def page_services():
    path = "services/"
    r = rel(path)
    meta = {"title": "Logo Design, Mockup & Poster Design Services Malaysia | MokPixel",
            "desc": "Logo branding from RM25, mockups and poster design from RM30. Original designs, revisions based on your feedback and organized final files. Book a design with MokPixel in Kuala Lumpur."}
    details = ""
    for s in SERVICES:
        gal = "".join(f'<figure class="{cls}"><img src="{r}assets/img/{img}" alt="{e(alt)}" loading="lazy"></figure>' for img, alt, cls in s["gallery"])
        ticks = "".join(f"<li>{t}</li>" for t in s["ticks"])
        q = s["key"].replace(" ", "%20")
        details += f"""<article class="svc-detail" id="{s['slug']}">
        <div class="stack">
          <span class="svc-num" aria-hidden="true">{s['num']}</span>
          <span class="kicker">{s['title']}</span>
          <h2 class="h-lg">{s['h2']}</h2>
          <div class="prose">{''.join(f'<p>{p}</p>' for p in s['body'])}</div>
          <h3 class="h-md" style="margin-top:8px">What you get</h3>
          <ul class="ticks">{ticks}</ul>
          <p class="svc-from">Starting from <b>{s['price']}</b></p>
          <a class="btn btn-neon" href="{r}contact/?service={q}#book">Book {s['title'].lower()} {ARROW}</a>
        </div>
        <div class="gallery reveal">{gal}</div>
      </article>"""
    plans = ""
    for i, s in enumerate(SERVICES):
        q = s["key"].replace(" ", "%20")
        plans += f"""<div class="plan reveal{' featured' if i == 0 else ''}">
          {'<span class="plan-tag">Lowest starting price</span>' if i == 0 else ''}
          <h3 class="h-md">{s['title']}</h3>
          <p class="plan-price"><small>From</small>{s['price']}</p>
          <p class="muted">{s['short']}</p>
          <ul>{''.join(f'<li>{t}</li>' for t in s['ticks'])}</ul>
          <a class="btn {'btn-neon' if i == 0 else 'btn-line'}" href="{r}contact/?service={q}#book">Book this design {ARROW}</a>
        </div>"""
    body = f"""
  <section class="page-hero">
    <div class="wrap">
      {crumbs(path, 'Services')}
      <div class="page-hero-row">
        <div><h1 class="h-display">Logo, mockup &amp; poster design services</h1>
        <p class="lede">Three focused services, one standard: original work that fits your audience. Logos from RM25, mockups and posters from RM30.</p></div>
        <a class="btn btn-neon" href="{r}contact/#book">Book a design {ARROW}</a>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">{details}</div>
  </section>

  <section class="section band" id="pricing">
    <div class="wrap">
      <div class="sec-head"><div><span class="kicker">Pricing</span><h2 class="h-xl">Simple, upfront pricing</h2><p class="lede">Starting prices below. Your exact price is confirmed in a written proposal before any work begins.</p></div></div>
      <div class="plans">{plans}</div>
    </div>
  </section>

  <section class="section">
    <div class="wrap split">
      <div class="stack"><span class="kicker">FAQ</span><h2 class="h-xl">Good to know before you book</h2></div>
      {faq_html(['cost', 'changes', 'files', 'time', 'pay'])}
    </div>
  </section>

  {cta_block(r, "Pick a service. We’ll handle the rest.")}
"""
    service_schema = [{"@context": "https://schema.org", "@type": "Service", "name": s["title"], "serviceType": s["title"], "provider": {"@id": BASE + "#business"},
                       "areaServed": "Malaysia", "description": s["short"], "url": BASE + path + "#" + s["slug"],
                       "offers": {"@type": "Offer", "priceCurrency": "MYR", "price": s["price"][2:], "description": "Starting price"}} for s in SERVICES]
    schema = [BUSINESS, breadcrumb_schema(path, "Services"), faq_schema(['cost', 'changes', 'files', 'time', 'pay'])] + service_schema
    return path, head(meta, path, schema) + header("services", path) + body + footer(path)


def page_projects():
    path = "projects/"
    r = rel(path)
    meta = {"title": "Design Portfolio: Logos, Mockups & Posters | MokPixel",
            "desc": "Browse MokPixel’s design portfolio: logo branding, product mockups, posters, stickers and social media designs for brands like MMHE Holdings Berhad, Dapur Ibu and Barkoba FC."}
    cards = "".join(proj_card(p, r, i) for i, p in enumerate(PROJECTS))
    filters = [("all", "All work"), ("branding", "Branding"), ("mockups", "Mockups"), ("posters", "Posters"), ("stickers", "Stickers"), ("social", "Social media")]
    fhtml = "".join(f'<button type="button" data-filter="{k}" aria-pressed="{"true" if k == "all" else "false"}">{l}</button>' for k, l in filters)
    body = f"""
  <section class="page-hero">
    <div class="wrap">
      {crumbs(path, 'Projects')}
      <div class="page-hero-row">
        <div><h1 class="h-display">Our design projects</h1>
        <p class="lede">Logos, mockups, posters, stickers and social media designs made for real Malaysian brands. Tap any project to take a closer look.</p></div>
        <a class="btn btn-neon" href="{r}contact/#book">Book a design {ARROW}</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="filters" role="group" aria-label="Filter projects">{fhtml}</div>
      <div class="proj-grid three">{cards}</div>
    </div>
  </section>

  <section class="section band">
    <div class="wrap">
      <div class="sec-head"><div><span class="kicker">Client reviews</span><h2 class="h-xl">The people behind the projects</h2></div></div>
      <div class="quotes">{quotes_html().replace('{r}', r)}</div>
    </div>
  </section>

  {cta_block(r, "Like what you see? Your brand could be next.")}
  {lightbox(r)}
"""
    schema = [BUSINESS, breadcrumb_schema(path, "Projects"), {"@context": "https://schema.org", "@type": "CollectionPage", "name": meta["title"], "url": BASE + path,
              "hasPart": [{"@type": "CreativeWork", "name": f"{p[0]}: {p[1]}", "image": BASE + "assets/img/" + p[2]} for p in PROJECTS]}]
    return path, head(meta, path, schema) + header("projects", path) + body + footer(path)


def page_process():
    path = "process/"
    r = rel(path)
    meta = {"title": "Our 11-Step Design Process | MokPixel Kuala Lumpur",
            "desc": "See exactly how MokPixel designs your logo, mockup or poster: brief, proposal, research, concepts, feedback, approval and delivery. Clear pricing upfront, no surprises."}
    steps = "".join(f"""<li class="step reveal"><span class="step-n" aria-hidden="true">{i+1:02d}</span><div><h3 class="h-md">{t}</h3><p>{d}</p><span class="phase">{ph}</span></div></li>""" for i, (t, d, ph) in enumerate(STEPS))
    body = f"""
  <section class="page-hero">
    <div class="wrap">
      {crumbs(path, 'Process')}
      <div class="page-hero-row">
        <div><h1 class="h-display">Our 11-step design process</h1>
        <p class="lede">Clear steps, a price agreed upfront and your approval before anything is final. Here’s exactly what happens after you book a design.</p></div>
        <a class="btn btn-neon" href="{r}contact/#book">Start step 1 {ARROW}</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <ol class="steps">{steps}</ol>
    </div>
  </section>

  <section class="section band">
    <div class="wrap">
      <blockquote class="big-quote reveal">
        <p>“Mockups breathe life into your designs, transforming abstract concepts into tangible realities.”</p>
        <footer>MokPixel</footer>
      </blockquote>
    </div>
  </section>

  <section class="section">
    <div class="wrap split">
      <div class="stack"><span class="kicker">FAQ</span><h2 class="h-xl">Questions about the process</h2></div>
      {faq_html(['pay', 'changes', 'time', 'files'])}
    </div>
  </section>

  {cta_block(r, "Step one takes two minutes.", "Tell us about your project and we’ll come back with a clear proposal. No commitment until you approve it.")}
"""
    howto = {"@context": "https://schema.org", "@type": "HowTo", "name": "How MokPixel designs your logo, mockup or poster",
             "step": [{"@type": "HowToStep", "position": i + 1, "name": t, "text": d} for i, (t, d, ph) in enumerate(STEPS)]}
    schema = [BUSINESS, breadcrumb_schema(path, "Process"), howto, faq_schema(['pay', 'changes', 'time', 'files'])]
    return path, head(meta, path, schema) + header("process", path) + body + footer(path)


def page_contact():
    path = "contact/"
    r = rel(path)
    meta = {"title": "Book a Design | Contact MokPixel, Kuala Lumpur",
            "desc": "Book a logo, mockup or poster design with MokPixel. Send your brief by WhatsApp or email and get a clear proposal with timeline and price. Call 019-636 9900."}
    chips = "".join(f'<label><input type="checkbox" name="service" value="{s["key"]}"><span>{s["title"]}</span></label>' for s in SERVICES)
    chips += '<label><input type="checkbox" name="service" value="Something else"><span>Something else</span></label>'
    nxt = [("We reply", "We read your brief and get back to you with any questions."),
           ("You get a proposal", "Deliverables, timeline and price, in writing."),
           ("We start designing", "Once the deposit is confirmed, your concepts are on the way.")]
    nxt_html = "".join(f'<div class="mini-step"><span class="kicker">Step {i+1}</span><h3 class="h-md">{t}</h3><p>{d}</p></div>' for i, (t, d) in enumerate(nxt))
    body = f"""
  <section class="page-hero">
    <div class="wrap">
      {crumbs(path, 'Contact')}
      <h1 class="h-display">Book a design</h1>
      <p class="lede">Tell us what you need. We’ll reply with a clear proposal covering deliverables, timeline and price, before any work starts.</p>
    </div>
  </section>

  <section class="section" id="book">
    <div class="wrap contact-grid">
      <div class="stack">
        <h2 class="h-lg">Talk to us directly</h2>
        <ul class="info-list" style="width:100%">
          <li><span>WhatsApp</span><a href="{WA}?text=Hi%20MokPixel%2C%20I%27d%20like%20to%20book%20a%20design." target="_blank" rel="noopener">{PHONE_DISPLAY}</a></li>
          <li><span>Call</span><a href="tel:{PHONE_INTL}">{PHONE_DISPLAY}</a></li>
          <li><span>Email</span><a href="mailto:{EMAIL}">{EMAIL}</a></li>
          <li><span>Studio</span><p>Pantai Dalam, Kuala Lumpur, Malaysia</p></li>
        </ul>
        <table class="hours">
          <caption>Opening hours</caption>
          <tbody>
            <tr data-day="week"><th scope="row">Monday – Friday</th><td>9:00am – 10:00pm</td></tr>
            <tr data-day="sat"><th scope="row">Saturday</th><td>9:00am – 6:00pm</td></tr>
            <tr data-day="sun"><th scope="row">Sunday</th><td>9:00am – 12:00pm</td></tr>
          </tbody>
        </table>
      </div>

      <form class="form" id="book-form" novalidate>
        <h2 class="h-md">Your project</h2>
        <div class="field"><label for="f-name">Your name *</label><input id="f-name" name="name" type="text" autocomplete="name" required></div>
        <div class="form-row">
          <div class="field"><label for="f-email">Email *</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
          <div class="field"><label for="f-phone">Phone / WhatsApp *</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" required></div>
        </div>
        <fieldset class="field"><legend>What would you like designed?</legend><div class="chips">{chips}</div></fieldset>
        <div class="field"><label for="f-budget">Budget</label>
          <select id="f-budget" name="budget"><option value="">Not sure yet</option><option>Below RM50</option><option>RM50 – RM100</option><option>RM100 – RM300</option><option>Above RM300</option></select></div>
        <div class="field"><label for="f-msg">Tell us about your project</label><textarea id="f-msg" name="message" placeholder="Your brand, what you need, where it will be used, and any deadline"></textarea></div>
        <p class="form-error" id="form-error" role="alert" hidden></p>
        <div class="form-actions">
          <button class="btn btn-neon" type="submit" data-via="whatsapp">Book on WhatsApp {ARROW}</button>
          <button class="btn btn-line" type="submit" data-via="email">Send by email</button>
        </div>
        <p class="form-note">Your booking opens in WhatsApp or your email app, ready to send. No payment needed until you approve the proposal.</p>
      </form>
    </div>
  </section>

  <section class="section band">
    <div class="wrap">
      <div class="sec-head"><div><span class="kicker">After you book</span><h2 class="h-xl">What happens next</h2></div><a class="dot-link" href="{r}process/">The full process</a></div>
      <div class="mini-steps three">{nxt_html}</div>
    </div>
  </section>

  <section class="section">
    <div class="wrap split">
      <div class="stack"><span class="kicker">FAQ</span><h2 class="h-xl">Before you book</h2></div>
      {faq_html(['book', 'cost', 'pay', 'who'])}
    </div>
  </section>
"""
    schema = [BUSINESS, breadcrumb_schema(path, "Contact"), {"@context": "https://schema.org", "@type": "ContactPage", "name": meta["title"], "url": BASE + path}, faq_schema(['book', 'cost', 'pay', 'who'])]
    return path, head(meta, path, schema) + header("contact", path) + body + footer(path)


def write(path, content):
    folder = os.path.join(ROOT, path)
    os.makedirs(folder, exist_ok=True)
    with open(os.path.join(folder, "index.html"), "w") as f:
        f.write(content)


if __name__ == "__main__":
    for fn in (page_home, page_about, page_services, page_projects, page_process, page_contact):
        p, c = fn()
        write(p, c)
        print("built", p or "/")
    # sitemap
    urls = "".join(f"<url><loc>{BASE}{p}</loc><changefreq>monthly</changefreq><priority>{'1.0' if not p else '0.8'}</priority></url>" for k, p, l in PAGES)
    with open(os.path.join(ROOT, "sitemap.xml"), "w") as f:
        f.write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>\n')
    print("built sitemap.xml")
