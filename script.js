let events = [];
const searchBox = document.getElementById("searchBox");
const results = document.getElementById("results");
const resultCount = document.getElementById("resultCount");

// Ambil data dari events.json
fetch("events.json")
  .then((res) => res.json())
  .then((data) => {
    events = data;
    results.innerHTML = "";
    resultCount.textContent = "";
  })
  .catch((err) => {
    console.error("Gagal load events.json", err);
    results.innerHTML = "<p style='color:red'>Gagal memuat data event.</p>";
  });

// Event pencarian
searchBox.addEventListener("input", () => {
  const query = (searchBox.value || "").toLowerCase().trim();

  if (query === "") {
    results.innerHTML = "";
    resultCount.textContent = "";
    return;
  }

  // 🔹 Split query jadi kata-kata
  const keywords = query.split(/\s+/).filter(Boolean);

  const filtered = events.filter((ev) => {
    const charName = (ev.character || ev.name || "").toLowerCase();
    const eventName = (ev.event || ev.title || "").toLowerCase();

    // gabungkan teks dari semua choices juga
    const choiceTexts = (ev.choices || []).map((c) => (c.option || c.text || c.title || "").toLowerCase()).join(" ");

    const combined = `${charName} ${eventName} ${choiceTexts}`;

    // semua keyword harus ada di combined
    return keywords.every((kw) => combined.includes(kw));
  });

  render(filtered);
});

// Render hasil
function render(data) {
  results.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    resultCount.textContent = "Tidak ada event ditemukan";
    return;
  }

  resultCount.textContent = `${data.length} events ditemukan`;

  data.forEach((ev) => {
    const character = ev.character || ev.name || "Unknown Character";
    const eventTitle = ev.event || ev.title || "Untitled Event";
    const choices = Array.isArray(ev.choices) ? ev.choices : [];

    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    title.textContent = `${character} - ${eventTitle}`;
    card.appendChild(title);

    choices.forEach((choice) => {
      const choiceDiv = document.createElement("div");
      choiceDiv.className = "choice";

      // Warna garis dari JSON kalau ada
      if (choice.color) {
        choiceDiv.style.borderLeft = `4px solid ${choice.color}`;
      }

      const textValue = choice.option || choice.text || choice.title || "";
      const choiceText = document.createElement("p");
      choiceText.textContent = textValue;
      choiceDiv.appendChild(choiceText);

      const effectsArray = Array.isArray(choice.effects) ? choice.effects : Array.isArray(choice.effect) ? choice.effect : [];

      effectsArray.forEach((effect) => {
        const span = document.createElement("span");
        span.className = "effect";

        if (typeof effect === "string") {
          span.textContent = effect;
          const lower = effect.toLowerCase();
          const stat = detectStatFromText(lower);
          if (stat) {
            span.classList.add(stat);
          } else {
            span.classList.add("other");
          }
        } else if (effect && typeof effect === "object") {
          const type = (effect.type || "").toString();
          const valueRaw = effect.value ?? effect.amount ?? effect.val ?? "";
          span.textContent = `${type} ${valueRaw}`.trim();

          if (type) {
            const stat = detectStatFromText(type.toLowerCase());
            if (stat) {
              span.classList.add(stat);
            } else {
              span.classList.add("other");
            }
          } else {
            span.classList.add("other");
          }
        } else {
          span.textContent = String(effect);
          span.classList.add("other");
        }

        choiceDiv.appendChild(span);
      });

      card.appendChild(choiceDiv);
    });

    results.appendChild(card);
  });
}

// Deteksi stat
function detectStatFromText(lowerText) {
  const stats = ["speed", "power", "stamina", "guts", "wisdom", "energy"];
  for (const s of stats) {
    if (lowerText.includes(s)) return s;
  }
  return null;
}

// Dark mode toggle
const toggleBtn = document.getElementById("darkToggle");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    toggleBtn.textContent = "☀️ Light Mode";
  } else {
    toggleBtn.textContent = "🌙 Dark Mode";
  }
});
