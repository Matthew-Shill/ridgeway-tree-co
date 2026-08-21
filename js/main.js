const QUOTE_EMAIL = "";
// Paste Dewey's quote inbox here when you have it, e.g. "quotes@deweystumpgrinding.com"
// Form submissions will then be emailed automatically via FormSubmit.

const PHONE_E164 = "+17165980729";
const PHONE_DISPLAY = "716-598-0729";

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

function setStatus(form, message, kind) {
  const status = form.querySelector(".form-status");
  if (!status) return;
  status.textContent = message;
  status.classList.remove("ok", "err");
  if (kind) status.classList.add(kind);
}

function buildMessage(data) {
  return [
    "New stump grinding quote request",
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email || "not provided"}`,
    `Location: ${data.location}`,
    "",
    data.details,
  ].join("\n");
}

function smsHref(data) {
  const body = encodeURIComponent(buildMessage(data));
  return `sms:${PHONE_E164}?&body=${body}`;
}

async function sendQuote(data) {
  if (!QUOTE_EMAIL) return { emailed: false };

  const response = await fetch(`https://formsubmit.co/ajax/${QUOTE_EMAIL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: `Stump grinding quote — ${data.name} — ${data.location}`,
      name: data.name,
      phone: data.phone,
      email: data.email,
      location: data.location,
      details: data.details,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not send the quote request.");
  }

  return { emailed: true };
}

document.querySelectorAll(".quote-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      company: form.company.value.trim(),
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      location: form.location.value.trim(),
      details: form.details.value.trim(),
    };

    if (payload.company) return;

    if (!payload.name || !payload.phone || !payload.location || !payload.details) {
      setStatus(form, "Please fill in name, phone, location, and job details.", "err");
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    setStatus(form, "Sending your request…");

    try {
      const result = await sendQuote(payload);
      form.reset();

      if (result.emailed) {
        setStatus(
          form,
          `Got it. Dewey will follow up soon — or call/text ${PHONE_DISPLAY} anytime.`,
          "ok"
        );
        return;
      }

      setStatus(
        form,
        `Request saved on this page. Call or text ${PHONE_DISPLAY} now to lock it in — your details are ready to send.`,
        "ok"
      );

      const textLink = document.createElement("a");
      textLink.className = "btn btn-primary btn-full";
      textLink.href = smsHref(payload);
      textLink.textContent = "Text this quote to Dewey";
      textLink.style.marginTop = "8px";
      if (!form.querySelector(".js-text-fallback")) {
        textLink.classList.add("js-text-fallback");
        form.appendChild(textLink);
      }
    } catch (error) {
      setStatus(
        form,
        `Couldn’t send automatically. Call or text ${PHONE_DISPLAY} and we’ll get you a quote.`,
        "err"
      );
    } finally {
      button.disabled = false;
    }
  });
});

const lightbox = document.querySelector(".lightbox");
const lightboxImg = lightbox.querySelector("img");

document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("click", () => {
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.querySelector("img").alt;
    lightbox.hidden = false;
  });
});

lightbox.querySelector(".lightbox-close").addEventListener("click", () => {
  lightbox.hidden = true;
  lightboxImg.src = "";
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.hidden = true;
    lightboxImg.src = "";
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    lightbox.hidden = true;
    lightboxImg.src = "";
  }
});

const mobileCta = document.querySelector(".mobile-cta");
const heroCtas = document.querySelector(".hero-mobile-ctas");
const siteHeader = document.querySelector(".site-header");

function setMobileCtaVisible(visible) {
  if (!mobileCta) return;
  mobileCta.classList.toggle("is-visible", visible);
  mobileCta.toggleAttribute("aria-hidden", !visible);
  mobileCta.inert = !visible;
}

if (mobileCta && heroCtas && "IntersectionObserver" in window) {
  const headerOffset = siteHeader ? siteHeader.offsetHeight : 84;

  const observer = new IntersectionObserver(
    ([entry]) => {
      setMobileCtaVisible(!entry.isIntersecting);
    },
    {
      threshold: 0,
      rootMargin: `-${headerOffset}px 0px 0px 0px`,
    }
  );

  observer.observe(heroCtas);
} else {
  setMobileCtaVisible(true);
}
