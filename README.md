# aren selvioğlu — portfolyo sitesi

Basit, renkli, tek sayfalık (SPA) portfolyo sitesi + kendi kendine yönetebileceğin
bir kontrol paneli (`/admin`). Kod düz HTML/CSS/JS ile yazıldı, herhangi bir build
adımına ihtiyaç duymuyor — Netlify'a bağladığında olduğu gibi yayınlanır.

İçerik (menü renkleri, hakkında metni, markalar, görseller) `content/` klasöründeki
JSON dosyalarında tutulur. Kontrol panelinden yaptığın her değişiklik doğrudan
GitHub reponuza commit olur ve Netlify otomatik olarak siteyi günceller.

---

## 1) GitHub'a yükle (terminal gerekmez)

1. github.com'a gir, sağ üstteki **+** işaretine bas → **New repository**.
2. Repo adı yaz (örn. `aren-portfolio`). Public ya da Private fark etmez.
   **"Add a README file" kutusunu işaretleme** (boş bırak) → **Create repository**.
3. Karşına gelen boş repo sayfasında **"uploading an existing file"** yazan
   linke tıkla (ya da üstteki **Add file → Upload files**).
4. Bilgisayarında zip'i açtığın `aren-portfolio` klasörünü aç. Klasörün
   **kendisini değil, İÇİNDEKİ tüm dosya ve klasörleri** (`index.html`,
   `styles.css`, `app.js`, `content`, `admin`, `netlify.toml` vb.) seçip
   tarayıcıdaki yükleme alanına sürükle-bırak yap.
5. Altta **Commit changes** butonuna bas. Birkaç saniyede dosyalar repo'na
   yüklenmiş olur.

> Repo'nun varsayılan dalı zaten `main` olacaktır — `admin/config.yml` içindeki
> `backend.branch: main` ile uyumlu, ekstra bir şey yapmana gerek yok.

<details>
<summary>Terminal kullanmayı tercih edersen (opsiyonel, aynı sonucu verir)</summary>

```bash
cd aren-portfolio
git init
git add .
git commit -m "ilk kurulum"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/aren-portfolio.git
git push -u origin main
```
</details>

## 2) Netlify'a bağla

1. Netlify hesabına gir → **Add new site → Import an existing project**.
2. GitHub'ı seç, az önce oluşturduğun `aren-portfolio` reposunu seç.
3. Build ayarlarına dokunma (build command boş, publish directory `.`) → **Deploy**.
4. Deploy bitince Netlify sana bir adres verir (örn. `https://aren-portfolio.netlify.app`).
   Bu adresi `admin/config.yml` içindeki `site_url` alanına yazıp tekrar commit'le
   (zorunlu değil ama önizleme için faydalı).

## 3) Kontrol panelini aktifleştir (Netlify Identity + Git Gateway)

Kontrol paneli (`/admin`) senin dışında kimsenin içeriği değiştirememesi için
giriş ister. Bunu Netlify Identity ile ücretsiz kuruyoruz:

1. Netlify'da sitenin sayfasında **Site configuration → Identity → Enable Identity**.
2. Identity ayarlarında **Registration preferences → Invite only** seç (herkes
   kayıt olamasın diye).
3. Aynı sayfada **Services → Git Gateway → Enable Git Gateway** butonuna bas
   (bu, kontrol panelinin senin adına GitHub'a commit atabilmesini sağlar).
4. **Identity → Invite users** ile kendi e-posta adresini
   (`arenselvioglu@dahacreative.com`) davet et. Gelen maildeki linke tıkla,
   şifreni belirle.
5. Artık `https://SITEN.netlify.app/admin/` adresine gidip giriş yapabilirsin.

## 4) Cloudinary'yi bağla (görsel yükleme için)

Panel Cloudinary'ye bağlı: kontrol panelinden logo/görsel eklerken açılan
pencere doğrudan senin Cloudinary hesabını kullanır.

1. Cloudinary hesabına gir, **Dashboard**'da (sol üst) **Cloud name** ve
   **API Key**'i kopyala.
2. `admin/config.yml` dosyasını aç, şu iki satırı kendi bilgilerinle değiştir:

```yaml
media_library:
  name: cloudinary
  config:
    cloud_name: BURAYA_CLOUD_NAME
    api_key: BURAYA_API_KEY
```

3. Değişikliği commit'le, push'la — Netlify otomatik yeniden yayınlar.

> **Önemli:** Cloudinary'de yeni bir "unsigned" upload preset açmana **gerek
> yok**. Hesabında zaten hazır duran `ml_default` preset'i (Upload Presets
> sayfasında "ML image / ML video / ML raw" etiketli olan) tam olarak bu
> widget için var ve Signed olması normal — dokunma. Panelde bir görsel
> eklemeye çalıştığında Cloudinary seni hesabına giriş yapmaya
> yönlendirebilir; giriş yaptıktan sonra yükleme/seçme ekranını görürsün.
> Video için de aynı pencereden Cloudinary'ye video yükleyip oradan
> seçebilirsin, ya da videoyu Cloudinary'ye elle yükleyip linkini her
> markanın **Video Linki** alanına yapıştırabilirsin.

## 5) İçerik ekleme / çıkarma

`/admin` adresine girdiğinde solda şu bölümleri göreceksin:

- **Ayarlar (Menü & Renkler):** Ana sayfadaki 7 menü öğesinin etiketi ve hover
  renkleri.
- **aren selvioğlu (Hakkında):** Fotoğraf, unvan, biyografi, panel rengi.
- **İletişim:** E-posta, telefon, adres, sosyal medya linkleri.
- **Kategoriler & Markalar:** `logo design`, `advertising design`,
  `motion graphics`, `personal works`, `awards` — her biri için istediğin kadar
  marka/iş ekleyebilir, her markaya kapak logosu + açıklama + istediğin kadar
  galeri görseli (popup içinde ok tuşlarıyla gezilir) koyabilirsin.

Yeni bir marka eklemek: ilgili kategoriye gir → **Markalar / İşler** listesine
**Add** → ID, isim, alt başlık, açıklama, logo ve galeri görsellerini doldur →
**Publish**. Silmek için aynı listeden ilgili öğenin çöp kutusu ikonuna bas.

## 6) Yerelde önizleme (opsiyonel)

Deploy etmeden önce bilgisayarında görmek istersen (Node kurulu olmalı):

```bash
npx serve .
```

açılan adrese git (örn. `http://localhost:3000`).

> Not: Kontrol paneli (`/admin`) yerelde tam çalışmaz (Git Gateway/Identity
> Netlify sunucusuna ihtiyaç duyar) — bunu canlı sitede test et.

---

## Dosya yapısı

```
aren-portfolio/
├─ index.html          → uygulama kabuğu (SPA)
├─ styles.css           → tüm tasarım
├─ app.js                → sayfa yönlendirme + render mantığı
├─ content/
│  ├─ settings.json      → menü öğeleri ve renkleri
│  ├─ about.json         → "aren selvioğlu" sayfası
│  ├─ contact.json       → "contact" sayfası
│  └─ categories/
│     ├─ logo-design.json
│     ├─ advertising-design.json
│     ├─ motion-graphics.json
│     ├─ personal-works.json
│     └─ awards.json
├─ admin/
│  ├─ index.html         → kontrol paneli (Decap CMS) yükleyici
│  └─ config.yml          → panelin hangi alanları göstereceği + Cloudinary ayarı
└─ netlify.toml
```

Şu anda tüm marka/logo içerikleri **placeholder** (örnek) veridir — gerçek logo
ve görselleri kontrol panelinden tek tek ekleyip placeholder'ların üstüne
yazman yeterli.
