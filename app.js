(function () {
  "use strict";

  var app = document.getElementById("app");
  var settings = null;
  var categoryCache = {};
  var currentPopupState = null; // { images, index, brand }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fetchJSON(path) {
    // file:// üzerinden çift tıklayarak açılan önizlemede fetch() çalışmaz
    // (tarayıcı CORS engeli koyar). Böyle durumlarda, varsa önceden
    // gömülmüş içeriği (window.__INLINE_CONTENT, bkz. content-inline.js) kullan.
    if (window.__INLINE_CONTENT && window.__INLINE_CONTENT[path]) {
      return Promise.resolve(window.__INLINE_CONTENT[path]);
    }
    return fetch(path, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("Yüklenemedi: " + path);
        return r.json();
      })
      .catch(function (err) {
        if (window.__INLINE_CONTENT && window.__INLINE_CONTENT[path]) {
          return window.__INLINE_CONTENT[path];
        }
        throw err;
      });
  }

  function getSettings() {
    if (settings) return Promise.resolve(settings);
    return fetchJSON("content/settings.json").then(function (data) {
      settings = data;
      return settings;
    });
  }

  function getCategory(id) {
    if (categoryCache[id]) return Promise.resolve(categoryCache[id]);
    return fetchJSON("content/categories/" + id + ".json").then(function (data) {
      categoryCache[id] = data;
      return data;
    });
  }

  function navItemById(nav, id) {
    for (var i = 0; i < nav.length; i++) if (nav[i].id === id) return nav[i];
    return null;
  }

  /* ---------------- Top nav ---------------- */
  function renderTopNav(nav, activeId) {
    var html = '<nav class="topnav">';
    html +=
      '<a class="home-btn" href="#/" aria-label="Ana sayfa">' +
      '<svg viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="m498.195312 222.695312c-.011718-.011718-.023437-.023437-.035156-.035156l-208.855468-208.847656c-8.902344-8.90625-20.738282-13.8125-33.328126-13.8125-12.589843 0-24.425781 4.902344-33.332031 13.808594l-208.746093 208.742187c-.070313.070313-.140626.144531-.210938.214844-18.28125 18.386719-18.25 48.21875.089844 66.558594 8.378906 8.382812 19.445312 13.238281 31.277344 13.746093.480468.046876.964843.070313 1.453124.070313h8.324219v153.699219c0 30.414062 24.746094 55.160156 55.167969 55.160156h81.710938c8.28125 0 15-6.714844 15-15v-120.5c0-13.878906 11.289062-25.167969 25.167968-25.167969h48.195313c13.878906 0 25.167969 11.289063 25.167969 25.167969v120.5c0 8.285156 6.714843 15 15 15h81.710937c30.421875 0 55.167969-24.746094 55.167969-55.160156v-153.699219h7.71875c12.585937 0 24.421875-4.902344 33.332031-13.808594 18.359375-18.371093 18.367187-48.253906.023437-66.636719zm0 0"></path>' +
      "</svg></a>";
    nav.forEach(function (item) {
      var href = item.type === "about" ? "#/about" : item.type === "contact" ? "#/contact" : "#/category/" + item.id;
      var activeClass = item.id === activeId ? " active" : "";
      html += '<a class="' + activeClass.trim() + '" style="--item-color:' + item.color + '" href="' + href + '">' + esc(item.label) + "</a>";
    });
    html += "</nav>";
    return html;
  }

  /* ---------------- Home ---------------- */
  function renderHome() {
    document.title = "aren selvioğlu — portfolio";
    getSettings().then(function (s) {
      var html = '<div class="home-wrap"><div class="home-menu">';
      s.nav.forEach(function (item) {
        var href = item.type === "about" ? "#/about" : item.type === "contact" ? "#/contact" : "#/category/" + item.id;
        var boldClass = item.type === "about" ? " bold" : "";
        html += '<a class="home-menu-item' + boldClass + '" style="--item-color:' + item.color + '" href="' + href + '">' + esc(item.label) + "</a>";
      });
      html += "</div></div>";
      app.innerHTML = html;
    });
  }

  /* ---------------- About ---------------- */
  function renderAbout() {
    getSettings().then(function (s) {
      return fetchJSON("content/about.json").then(function (a) {
        document.title = a.name + " — " + a.title;
        var html = renderTopNav(s.nav, "aren-selvioglu");
        html += '<div class="about-page">';
        html += '<div class="about-hero" style="--cat-color:' + a.color + '">';
        if (a.photo)
          html +=
            '<div class="about-photo-wrap"><img class="about-photo" src="' +
            esc(a.photo) +
            '" alt="' +
            esc(a.name) +
            '"></div>';
        html += '<div class="about-info">';
        html += "<h1>" + esc(a.name) + "</h1>";
        html += '<div class="role">' + esc(a.title) + "<br>" + esc(a.company) + "</div>";
        html += '<div class="email"><a href="mailto:' + esc(a.email) + '">' + esc(a.email) + "</a></div>";
        html += "</div>";
        html += "</div>";
        html += '<div class="about-bio-wrap"><p class="about-bio">' + esc(a.bio) + "</p></div>";
        html += "</div>";
        app.innerHTML = html;
      });
    });
  }

  /* ---------------- Contact ---------------- */
  function renderContact() {
    getSettings().then(function (s) {
      return fetchJSON("content/contact.json").then(function (c) {
        document.title = "contact — aren selvioğlu";
        var html = renderTopNav(s.nav, "contact");
        html += '<div class="contact-page">';
        html += '<div class="contact-hero" style="--cat-color:' + c.color + '"><h1>contact</h1></div>';
        html += '<div class="contact-info-wrap"><div class="contact-info">';
        html += '<div class="label">e-mail</div><a href="mailto:' + esc(c.email) + '">' + esc(c.email) + "</a><br>";
        if (c.phone) html += '<div class="label">phone</div>' + esc(c.phone) + "<br>";
        if (c.address) html += '<div class="label">location</div>' + esc(c.address) + "<br>";
        if (c.social && c.social.length) {
          html += '<div class="label">social</div>';
          c.social.forEach(function (s2) {
            html += '<a href="' + esc(s2.url) + '" target="_blank" rel="noopener" style="margin-right:16px;">' + esc(s2.label) + "</a>";
          });
        }
        html += "</div></div></div>";
        app.innerHTML = html;
      });
    });
  }

  /* ---------------- Category ---------------- */
  function renderCategoryGrid(s, cat, catId) {
    var html = renderTopNav(s.nav, catId);
    html += '<div class="category-page">';
    html += '<div class="category-hero" style="--cat-color:' + cat.color + '"><h1>' + esc(cat.title) + "</h1></div>";
    html += '<div class="category-grid-wrap">';
    if (!cat.brands || !cat.brands.length) {
      html += '<p class="empty-note">Henüz içerik eklenmedi. Kontrol panelinden (/admin) marka ekleyebilirsin.</p>';
    } else {
      html += '<div class="category-grid">';
      cat.brands.forEach(function (b) {
        html += '<button class="brand-tile" data-brand="' + esc(b.id) + '" aria-label="' + esc(b.name) + '">';
        html += b.logo ? '<img src="' + esc(b.logo) + '" alt="' + esc(b.name) + '">' : esc(b.name);
        html += "</button>";
      });
      html += "</div>";
    }
    html += "</div></div>";
    return html;
  }

  function renderCategory(catId, brandId) {
    Promise.all([getSettings(), getCategory(catId)])
      .then(function (res) {
        var s = res[0],
          cat = res[1];
        document.title = cat.title + " — aren selvioğlu";
        app.innerHTML = renderCategoryGrid(s, cat, catId);

        Array.prototype.forEach.call(document.querySelectorAll(".brand-tile"), function (btn) {
          btn.addEventListener("click", function () {
            location.hash = "#/category/" + catId + "/brand/" + btn.getAttribute("data-brand");
          });
        });

        if (brandId) openPopupForBrand(cat, brandId, catId);
      })
      .catch(function (err) {
        app.innerHTML = '<div style="padding:60px;font-family:var(--serif)">Bir hata oluştu: ' + esc(err.message) + "</div>";
      });
  }

  /* ---------------- Popup ---------------- */
  function findBrand(cat, brandId) {
    return (cat.brands || []).filter(function (b) {
      return b.id === brandId;
    })[0];
  }

  // youtube/vimeo linklerini embed edilebilir iframe adresine çevirir;
  // Cloudinary gibi doğrudan .mp4 linkleri olduğu gibi <video> ile oynatılır.
  function toEmbed(url) {
    var yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]+)/);
    if (yt) return { kind: "iframe", src: "https://www.youtube.com/embed/" + yt[1] };
    var vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return { kind: "iframe", src: "https://player.vimeo.com/video/" + vm[1] };
    return { kind: "video", src: url };
  }

  function openPopupForBrand(cat, brandId, catId) {
    var brand = findBrand(cat, brandId);
    if (!brand) return;

    // "entries" varsa (ör. awards): sol tarafta tıklanabilir bir liste
    // gösterilir, her satır kendi görselini sağda açar (galeri modu yerine).
    if (brand.entries && brand.entries.length) {
      var entryMedia = brand.entries.map(function (e) {
        return { type: "image", src: e.image, label: e.label };
      });
      currentPopupState = { media: entryMedia, index: 0, brand: brand, color: cat.color, catId: catId, mode: "entries" };
      renderPopup();
      return;
    }

    var media = [];
    if (brand.video) {
      var v = toEmbed(brand.video);
      media.push({ type: v.kind, src: v.src });
    }
    (brand.images || []).forEach(function (src) {
      media.push({ type: "image", src: src });
    });
    if (!media.length && brand.logo) media.push({ type: "image", src: brand.logo });
    currentPopupState = { media: media, index: 0, brand: brand, color: cat.color, catId: catId, mode: "gallery" };
    renderPopup();
  }

  function resetPopupUI() {
    currentPopupState = null;
    var existing = document.querySelector(".popup-overlay");
    if (existing) existing.remove();
  }

  function closePopup() {
    resetPopupUI();
    var parts = location.hash.split("/brand/");
    if (parts.length > 1) location.hash = parts[0];
  }

  function renderPopup() {
    var existing = document.querySelector(".popup-overlay");
    if (existing) existing.remove();
    if (!currentPopupState) return;
    var st = currentPopupState;
    var b = st.brand;
    var wrap = document.createElement("div");
    wrap.className = "popup-overlay";
    var item = st.media[st.index] || null;
    var mediaHtml = "";
    if (item) {
      if (item.type === "iframe") {
        mediaHtml = '<iframe src="' + esc(item.src) + '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen frameborder="0"></iframe>';
      } else if (item.type === "video") {
        mediaHtml = '<video src="' + esc(item.src) + '" controls playsinline></video>';
      } else {
        mediaHtml = '<img src="' + esc(item.src) + '" alt="' + esc(b.name) + '">';
      }
    }
    var isEntries = st.mode === "entries";
    var entriesHtml = "";
    if (isEntries) {
      entriesHtml = '<ul class="popup-entries">';
      st.media.forEach(function (m, i) {
        entriesHtml +=
          '<li><button class="entry-item' +
          (i === st.index ? " active" : "") +
          '" data-idx="' +
          i +
          '">' +
          esc(m.label || "Öğe " + (i + 1)) +
          "</button></li>";
      });
      entriesHtml += "</ul>";
    }

    wrap.innerHTML =
      '<div class="popup-modal" style="--brand-color:' + st.color + '">' +
      '<button class="popup-close" aria-label="Kapat">&times;</button>' +
      '<div class="popup-info">' +
      "<h2>" + esc(b.name) + "</h2>" +
      (b.subtitle ? '<p class="subtitle">' + esc(b.subtitle) + "</p>" : "") +
      (b.description ? '<p class="desc">' + esc(b.description) + "</p>" : "") +
      entriesHtml +
      "</div>" +
      '<div class="popup-image-wrap">' +
      (!isEntries && st.media.length > 1 ? '<button class="popup-nav-btn prev" aria-label="Önceki">&lsaquo;</button>' : "") +
      mediaHtml +
      (!isEntries && st.media.length > 1 ? '<button class="popup-nav-btn next" aria-label="Sonraki">&rsaquo;</button>' : "") +
      (!isEntries && st.media.length > 1 ? '<span class="popup-counter">' + (st.index + 1) + " / " + st.media.length + "</span>" : "") +
      "</div></div>";

    document.body.appendChild(wrap);

    wrap.addEventListener("click", function (e) {
      if (e.target === wrap) closePopup();
    });
    wrap.querySelector(".popup-close").addEventListener("click", closePopup);
    var prevBtn = wrap.querySelector(".popup-nav-btn.prev");
    var nextBtn = wrap.querySelector(".popup-nav-btn.next");
    if (prevBtn)
      prevBtn.addEventListener("click", function () {
        if (currentPopupState.index > 0) {
          currentPopupState.index--;
          renderPopup();
        }
      });
    if (nextBtn)
      nextBtn.addEventListener("click", function () {
        if (currentPopupState.index < currentPopupState.media.length - 1) {
          currentPopupState.index++;
          renderPopup();
        }
      });
    Array.prototype.forEach.call(wrap.querySelectorAll(".entry-item"), function (btn) {
      btn.addEventListener("click", function () {
        currentPopupState.index = parseInt(btn.getAttribute("data-idx"), 10);
        renderPopup();
      });
    });
  }

  document.addEventListener("keydown", function (e) {
    if (!currentPopupState) return;
    if (e.key === "Escape") closePopup();
    if (e.key === "ArrowRight" && currentPopupState.index < currentPopupState.media.length - 1) {
      currentPopupState.index++;
      renderPopup();
    }
    if (e.key === "ArrowLeft" && currentPopupState.index > 0) {
      currentPopupState.index--;
      renderPopup();
    }
  });

  /* ---------------- Router ---------------- */
  function route() {
    resetPopupUI(); // her rota değişiminde eski popup'ı temizle (varsa yenisi ilgili render fonksiyonunda açılır)
    var hash = location.hash.replace(/^#/, "") || "/";
    var parts = hash.split("/").filter(Boolean); // e.g. ["category","logo-design","brand","coensio"]

    if (parts.length === 0) {
      renderHome();
      return;
    }
    if (parts[0] === "about") {
      renderAbout();
      return;
    }
    if (parts[0] === "contact") {
      renderContact();
      return;
    }
    if (parts[0] === "category" && parts[1]) {
      var catId = parts[1];
      var brandId = parts[2] === "brand" ? parts[3] : null;
      renderCategory(catId, brandId);
      return;
    }
    renderHome();
  }

  window.addEventListener("hashchange", route);
  window.addEventListener("DOMContentLoaded", route);
})();
