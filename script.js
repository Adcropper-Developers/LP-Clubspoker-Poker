// Element seçicileri
const elements = {
  popupModal: document.getElementById("popupModal"),
  closeModalBtn: document.getElementById("closeModal"),
  pockerman: document.querySelector(".pocker-man"),
  cardBack: document.querySelector(".card-back"),
  cardFront: document.querySelector(".card-front"),
  stickyBottom: document.getElementById("stickyBottom"),
  gambler: document.querySelector(".gambler"),
  coins: document.querySelectorAll(".section3 .coin"),
  scrollCont: document.querySelector(".scroll-container"),
  icons: document.querySelectorAll(".iconBoxContainer .iconBox"),
  eventCont: document.querySelector(".eventsContainer"),
  events: document.querySelectorAll(".eventsContainer .eventBox"),
  loader: document.querySelector(".loader"),
  lottieContainer: document.getElementById("lottie-container"),
  section3 : document.querySelector(".section3"),
  slides : document.querySelector('.slides'),
  slider : document.querySelector('.slider'),
  slide : document.querySelectorAll('.slide')
};

// Lottie animation configuration
let lottieAnimation = null;

// Initialize Lottie animation
function initLottieAnimation() {
  if (!elements.lottieContainer) return;

  return new Promise((resolve) => {
    // Load your Lottie animation
    lottieAnimation = lottie.loadAnimation({
      container: elements.lottieContainer,
      renderer: "svg",
      loop: false, // Changed to false since we want it to play once
      autoplay: true,
      path: "ClubsPoker_Preloader.json",
    });

    // Listen for animation complete
    lottieAnimation.addEventListener("complete", () => {
      if (elements.loader) {
        elements.loader.classList.add("hidden");
        setTimeout(() => {
          elements.loader.style.display = "none";
        }, 300); // Add a small delay for the fade out animation
      }
      resolve();
    });

    // Optional: Add error handling
    lottieAnimation.addEventListener("error", () => {
      console.error("Lottie animation error");
      if (elements.loader) {
        elements.loader.classList.add("hidden");
      }
      resolve();
    });
  });
}

// Performans için throttle fonksiyonu
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Animasyon fonksiyonları
const animations = {
  icons: () =>
    elements.icons.forEach((icon) => icon.classList.add("icon-anim")),
};

// Scroll element kontrolü - Performans optimizasyonu
const scrollElement = (page, pageElement) => {
  if (!pageElement) return;

  const elementConfigs = [
    {
      element: elements.section3,
      action: animations.icons,
    }
  ];

  // IntersectionObserver kullanımı - Daha iyi performans
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const config = elementConfigs.find(
            (cfg) => cfg.element === entry.target
          );
          if (config) {
            config.action();
            observer.unobserve(entry.target); // Bir kez çalıştıktan sonra gözlemi durdur
          }
        }
      });
    },
    { threshold: 0.1 }
  );

  elementConfigs.forEach((config) => {
    if (config.element) {
      observer.observe(config.element);
    }
  });
};

// Sticky bottom kontrolü - Performans optimizasyonu
const handleStickyBottom = throttle(() => {
  if (!elements.scrollCont || !elements.stickyBottom || !elements.popupModal)
    return;

  const shouldShow =
    elements.scrollCont.scrollTop > 200 &&
    !elements.popupModal.classList.contains("show");

  elements.stickyBottom.classList.toggle("show", shouldShow);
}, 100);

// WebP desteği kontrolü - Modernize edilmiş versiyon
async function checkWebPSupport() {
  try {
    const webpData =
      "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=";
    const blob = await fetch(webpData).then((r) => r.blob());
    return blob.type === "image/webp";
  } catch {
    return false;
  }
}

// Sayfa yüklendiğinde yapılacak işlemler
// Update the window load event handler
window.addEventListener("load", async () => {
  try {
    // Wait for Lottie animation to complete
    await initLottieAnimation();

    // Rest of your initialization code
    ["pockerman", "cardBack", "cardFront"].forEach((elem) => {
      elements[elem]?.classList.add("anim");
    });

    // Modal gösterimi
    setTimeout(() => {
      if (elements.popupModal && elements.stickyBottom) {
        elements.popupModal.classList.add("show");
        document.body.classList.add("show");
        elements.stickyBottom.classList.remove("show");
      }
    }, 5000);

    // WebP desteği kontrolü
    const hasWebPSupport = await checkWebPSupport();
    document.body.classList.add(
      hasWebPSupport ? "webp-support" : "webp-not-support"
    );

    // Scroll element'i başlat
    if (elements.scrollCont) {
      scrollElement(0, elements.scrollCont);
      elements.scrollCont.addEventListener("scroll", handleStickyBottom);
    }
  } catch (error) {
    console.error("Error during initialization:", error);
    // Fallback: hide loader in case of error
    if (elements.loader) {
      elements.loader.classList.add("hidden");
    }
  }
});
// Modal kapatma olayı
elements.closeModalBtn?.addEventListener("click", () => {
  elements.popupModal?.classList.remove("show");
  document.body.classList.remove("show");

  if (elements.scrollCont) {
    elements.scrollCont.addEventListener("scroll", handleStickyBottom);
  }
});

// Slider

let currentSlide = 0;
const intervalTime = 2000; // 2 saniye
let slideInterval = null;

function changeSlide(direction) {
    const totalSlides = elements.slide.length;
    let visibleSlides = 4; // Aynı anda görünen resim sayısı
    if(window.innerWidth < 576){
      visibleSlides = 3;
    }
    if(!(window.innerWidth < 992)){
      // Slider üzerine mouse geldiğinde otomatik kaydırmayı durdur
      elements.slider.addEventListener('mouseenter', stopAutoSlide);

      // Slider'dan mouse çıkınca otomatik kaydırmayı yeniden başlat
      elements.slider.addEventListener('mouseleave', startAutoSlide);
    }
   

    currentSlide += direction;

    if (currentSlide > totalSlides - visibleSlides) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = totalSlides - visibleSlides;
    }
    elements.slides.style.transform = `translateX(-${currentSlide * (100 / visibleSlides)}%)`;
}

// Otomatik kaydırma fonksiyonu
function autoSlide() {
  changeSlide(1); // Her 3 saniyede bir ileri kaydır
}

// Otomatik geçişi başlat
function startAutoSlide() {
  slideInterval = setInterval(autoSlide, intervalTime);
}

// Otomatik kaydırmayı durdur
function stopAutoSlide() {
  clearInterval(slideInterval);
}

// İlk otomatik kaydırmayı başlat
startAutoSlide();