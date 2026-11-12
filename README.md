# satyansh.blog

Satyansh Mishra की प्रोफ़ाइल वेबसाइट। Plain HTML, CSS और JavaScript: कोई build step नहीं, सीधे GitHub Pages पर चलती है।

## फ़ोल्डर

```
index.html            पूरा पेज (सारा टेक्स्ट यहीं है)
css/style.css         डिज़ाइन
js/config.js          सेटिंग्स: lab/test लिंक, फ़ॉर्म URL, संपर्क  ← सिर्फ़ यही बदलनी है
js/main.js            एनिमेशन, फ़ोटो व्यूअर, फ़ॉर्म
assets/img/           फ़ोटो (पेज वाली); assets/img/full/ में बड़े आकार
assets/logo.svg       वेक्टर लोगो (logo-512.png, logo-96.png भी)
assets/fonts/         Latin Modern (LaTeX वाला फ़ॉन्ट)
css/katex.min.css     गणित के सूत्रों की टाइपसेटिंग
assets/video/         आठ रील (.mp4) और हर एक का पोस्टर (.jpg)
apps-script/Code.gs   Google Sheet वाला फ़ॉर्म बैकएंड (साइट का हिस्सा नहीं, Sheet में पेस्ट करना है)
CNAME                 custom domain (satyansh.blog)
.nojekyll             GitHub Pages को फ़ाइलें जस की तस परोसने को कहता है
```

## 1. GitHub Pages पर डालना

1. GitHub पर नया public repo बनाइए, जैसे `satyansh-blog`.
2. इस फ़ोल्डर के **अंदर की** सारी फ़ाइलें repo की root में अपलोड कीजिए (`index.html` सबसे ऊपर दिखनी चाहिए). `.nojekyll` और `CNAME` भी जाएँ.
   ```
   git init && git add -A && git commit -m "Profile site"
   git branch -M main
   git remote add origin https://github.com/<username>/satyansh-blog.git
   git push -u origin main
   ```
3. Repo > Settings > Pages > Source: **Deploy from a branch**, Branch: **main**, Folder: **/ (root)** > Save.
4. उसी पेज पर Custom domain में `satyansh.blog` लिखकर Save कीजिए, फिर **Enforce HTTPS** चालू कीजिए.

## 2. Domain (DNS)

`scilab` और `test` पहले से GitHub Pages पर हैं, तो तरीका वही है; बस यह apex domain है.
Domain registrar के DNS में `satyansh.blog` (host `@`) के लिए GitHub Pages के चार A records जोड़िए:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

और `www` के लिए CNAME → `<username>.github.io`. (IP बदले तो नहीं हैं, फिर भी GitHub Docs > "Managing a custom domain for your GitHub Pages site" में एक बार मिला लीजिए.)

## 3. "Write to me" फ़ॉर्म को Google Sheet से जोड़ना

1. नई Google Sheet बनाइए (नाम कुछ भी).
2. Extensions > Apps Script खोलिए, जो कोड है उसे मिटाकर `apps-script/Code.gs` पूरा पेस्ट कीजिए, Save.
3. Deploy > New deployment > type **Web app** > Execute as **Me**, Who has access **Anyone** > Deploy. अनुमति माँगे तो दे दीजिए.
4. जो **Web app URL** मिले (`https://script.google.com/macros/s/.../exec`) उसे `js/config.js` में `formEndpoint` में पेस्ट करके push कीजिए.

अब हर संदेश Sheet की `Messages` टैब में नई row बनकर आएगा. जब तक `formEndpoint` खाली है, फ़ॉर्म विज़िटर का email app खोल देता है.

## 4. बाद में बदलाव

- Lab या test का लिंक बदलना हो: `js/config.js` में `labUrl` / `testUrl`.
- फ़ोन नंबर छिपाना हो: `js/config.js` में `phone: ""`.
- टेक्स्ट बदलना हो: `index.html` में सीधे.
- फ़ोटो बदलनी हो: `assets/img/` में उसी नाम की नई फ़ाइल रख दीजिए.

## 5. नई रील जोड़ना

1. वीडियो को `assets/video/नाम.mp4` और उसकी एक तस्वीर `assets/video/नाम.jpg` (540x960) के रूप में रखिए. वीडियो 20 MB से छोटा रखें.
2. `index.html` में `<div class="reel-row" id="reelRow">` के अंदर किसी एक `<figure class="reel" ...>` ब्लॉक की नकल कीजिए और उसमें फ़ाइल का नाम, समय और शीर्षक बदल दीजिए.
3. `data-kind="desmos"` (समीकरण से चित्र) या `data-kind="jee"` (JEE वाले) रखिए; फ़िल्टर बटन इसी से काम करते हैं.
