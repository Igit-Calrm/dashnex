document.addEventListener("DOMContentLoaded", function () {
  var body = document.body;
  var navToggle = document.querySelector(".nav-toggle");
  var navCenter = document.querySelector(".nav-center");

  if (navToggle && navCenter) {
    navToggle.addEventListener("click", function () {
      body.classList.toggle("nav-open");
    });
  }

  var navLinks = document.querySelectorAll('a[data-scroll="true"]');
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var targetId = link.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          var rect = target.getBoundingClientRect();
          var offset = window.pageYOffset + rect.top - 80;
          window.scrollTo({
            top: offset,
            behavior: "smooth"
          });
          body.classList.remove("nav-open");
        }
      }
    });
  });

  var animated = document.querySelectorAll(".fade-in-up");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.16
    });

    animated.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    animated.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // Reviews Carousel Logic
  var track = document.querySelector('.reviews-carousel-track');
  var cards = document.querySelectorAll('.review-card-v2');
  var nextBtn = document.querySelector('.carousel-next');
  var prevBtn = document.querySelector('.carousel-prev');
  var dotsContainer = document.querySelector('.carousel-dots');

  if (track && cards.length > 0) {
    var currentIndex = 0;
    var cardCount = cards.length;
    var cardsPerView = window.innerWidth > 1024 ? 3 : (window.innerWidth > 768 ? 2 : 1);
    var maxIndex = Math.ceil(cardCount / cardsPerView) - 1;

    // Create dots
    for (var i = 0; i <= maxIndex; i++) {
      var dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('data-index', i);
      dotsContainer.appendChild(dot);
    }

    var dots = document.querySelectorAll('.dot');

    function updateCarousel() {
      // Move by full pages (3 cards at a time on desktop)
      var containerWidth = track.parentElement.offsetWidth;
      var gap = 30;
      var totalMove = currentIndex * (containerWidth + gap);
      
      track.style.transform = 'translateX(-' + totalMove + 'px)';
      
      // Update dots
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    // Move logic
    function moveNext() {
      currentIndex = (currentIndex >= maxIndex) ? 0 : currentIndex + 1;
      updateCarousel();
    }

    function movePrev() {
      currentIndex = (currentIndex <= 0) ? maxIndex : currentIndex - 1;
      updateCarousel();
    }

    // Initial position fix after a tiny delay to ensure offsetWidth is captured
    setTimeout(updateCarousel, 100);

    if (nextBtn) nextBtn.addEventListener('click', moveNext);
    if (prevBtn) prevBtn.addEventListener('click', movePrev);

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        currentIndex = parseInt(this.getAttribute('data-index'));
        updateCarousel();
      });
    });

    // Auto-play with pause on hover
    var autoPlayInterval = setInterval(moveNext, 5000);

    track.parentElement.addEventListener('mouseenter', function() {
      clearInterval(autoPlayInterval);
    });

    track.parentElement.addEventListener('mouseleave', function() {
      autoPlayInterval = setInterval(moveNext, 5000);
    });

    // Handle resize
    window.addEventListener('resize', function() {
      var newCardsPerView = window.innerWidth > 1024 ? 3 : (window.innerWidth > 768 ? 2 : 1);
      if (newCardsPerView !== cardsPerView) {
        cardsPerView = newCardsPerView;
        maxIndex = Math.ceil(cardCount / cardsPerView) - 1;
        currentIndex = Math.min(currentIndex, maxIndex);
        
        // Re-create dots
        dotsContainer.innerHTML = '';
        for (var i = 0; i <= maxIndex; i++) {
          var dot = document.createElement('div');
          dot.classList.add('dot');
          if (i === currentIndex) dot.classList.add('active');
          dot.setAttribute('data-index', i);
          dotsContainer.appendChild(dot);
        }
        dots = document.querySelectorAll('.dot');
        dots.forEach(function(dot) {
          dot.addEventListener('click', function() {
            currentIndex = parseInt(this.getAttribute('data-index'));
            updateCarousel();
          });
        });
        updateCarousel();
      }
    });
  }

  // See More functionality for Review Cards
  var seeMoreBtns = document.querySelectorAll('.see-more-btn');
  
  function checkTruncation() {
    seeMoreBtns.forEach(function(btn) {
      var card = btn.closest('.review-card-v2');
      var textElement = card.querySelector('.review-body-text');
      
      // Temporarily remove clamp to check full height
      textElement.style.WebkitLineClamp = 'unset';
      var fullHeight = textElement.scrollHeight;
      textElement.style.WebkitLineClamp = '3';
      
      // If full height is greater than clamped height (approx 3 lines * 1.6 line-height * 16px font = 76.8px)
      // A safer way is to compare scrollHeight with clientHeight while clamped
      if (textElement.scrollHeight > textElement.clientHeight) {
        btn.style.display = 'block';
      } else {
        btn.style.display = 'none';
      }
    });
  }

  // Run on load and after a short delay to ensure fonts/styles are applied
  setTimeout(checkTruncation, 200);
  window.addEventListener('resize', checkTruncation);

  seeMoreBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var card = btn.closest('.review-card-v2');
      card.classList.toggle('expanded');
      if (card.classList.contains('expanded')) {
        btn.textContent = 'See Less';
      } else {
        btn.textContent = 'See More';
      }
    });
  });

  // FAQ Dropdown Logic
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function(item) {
    item.addEventListener('click', function() {
      // Toggle current item
      this.classList.toggle('is-open');
      
      // Close other items (optional, but cleaner)
      faqItems.forEach(function(other) {
        if (other !== item) {
          other.classList.remove('is-open');
        }
      });
    });
  });
});
