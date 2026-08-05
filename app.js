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

  function openPopupForBrand(cat, brandId, catId) {
    var brand = findBrand(cat, brandId);
    if (!brand) return;
    var images = brand.images && brand.images.length ? brand.images : brand.logo ? [brand.logo] : [];
    currentPopupState = { images: images, index: 0, brand: brand, color: cat.color, catId: catId };
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
    var img = st.images[st.index] || "";
    wrap.innerHTML =
      '<div class="popup-modal" style="--brand-color:' + st.color + '">' +
      '<button class="popup-close" aria-label="Kapat">&times;</button>' +
      '<div class="popup-info">' +
      "<h2>" + esc(b.name) + "</h2>" +
      (b.subtitle ? '<p class="subtitle">' + esc(b.subtitle) + "</p>" : "") +
      (b.description ? '<p class="desc">' + esc(b.description) + "</p>" : "") +
      "</div>" +
      '<div class="popup-image-wrap">' +
      (st.images.length > 1 ? '<button class="popup-nav-btn prev" aria-label="Önceki">&lsaquo;</button>' : "") +
      (img ? '<img src="' + esc(img) + '" alt="' + esc(b.name) + '">' : "") +
      (st.images.length > 1 ? '<button class="popup-nav-btn next" aria-label="Sonraki">&rsaquo;</button>' : "") +
      (st.images.length > 1 ? '<span class="popup-counter">' + (st.index + 1) + " / " + st.images.length + "</span>" : "") +
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
        if (currentPopupState.index < currentPopupState.images.length - 1) {
          currentPopupState.index++;
          renderPopup();
        }
      });
  }

  document.addEventListener("keydown", function (e) {
    if (!currentPopupState) return;
    if (e.key === "Escape") closePopup();
    if (e.key === "ArrowRight" && currentPopupState.index < currentPopupState.images.length - 1) {
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
