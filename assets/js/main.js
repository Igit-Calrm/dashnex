document.addEventListener("DOMContentLoaded", function () {
  var body = document.body;
  document.documentElement.classList.add("js");
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

  var serviceRows = document.querySelectorAll("#services .card-grid-3, #services .card-grid-4-staggered, #services .card-grid-3-staggered, #services .card-grid-3-v2");
  if (serviceRows.length > 0) {
    function revealServiceRow(row) {
      var cards = row.querySelectorAll(".service-card");
      cards.forEach(function (card, index) {
        card.style.transitionDelay = (index * 120) + "ms";
        card.classList.add("service-inview");
      });
    }

    if ("IntersectionObserver" in window) {
      var rowObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealServiceRow(entry.target);
            rowObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      serviceRows.forEach(function (row) {
        rowObserver.observe(row);
      });
    } else {
      serviceRows.forEach(function (row) {
        revealServiceRow(row);
      });
    }
  }

  var statsRow = document.querySelector(".about-stats-row-exact");
  if (statsRow) {
    var statNums = statsRow.querySelectorAll(".stat-num");

    function parseStatText(raw) {
      var text = (raw || "").trim();
      var match = text.match(/^([\d,.]+)([kK]?)(.*)$/);
      if (!match) return null;
      var numRaw = match[1].replace(/,/g, "");
      var unit = match[2] || "";
      var suffix = match[3] || "";
      var decimals = 0;
      var dotIndex = numRaw.indexOf(".");
      if (dotIndex >= 0) decimals = numRaw.length - dotIndex - 1;
      var target = parseFloat(numRaw);
      if (isNaN(target)) return null;
      return { target: target, unit: unit, suffix: suffix, decimals: decimals };
    }

    function formatValue(value, decimals, unit, suffix) {
      var num = decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
      return num + (unit ? unit.toLowerCase() : "") + suffix;
    }

    function animateCount(el, target, decimals, unit, suffix) {
      var duration = 1300;
      var startTime = null;
      var startVal = 0;
      var endVal = target;

      function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
      }

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min(1, (timestamp - startTime) / duration);
        var eased = easeOutCubic(progress);
        var current = startVal + (endVal - startVal) * eased;
        el.textContent = formatValue(current, decimals, unit, suffix);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = formatValue(endVal, decimals, unit, suffix);
        }
      }

      window.requestAnimationFrame(step);
    }

    var parsedStats = [];
    statNums.forEach(function (el) {
      var parsed = parseStatText(el.textContent);
      if (!parsed) return;
      parsedStats.push({ el: el, parsed: parsed });
      el.textContent = formatValue(0, parsed.decimals, parsed.unit, parsed.suffix);
    });

    function runStats() {
      if (statsRow.classList.contains("is-visible")) return;
      statsRow.classList.add("is-visible");
      parsedStats.forEach(function (item) {
        animateCount(item.el, item.parsed.target, item.parsed.decimals, item.parsed.unit, item.parsed.suffix);
      });
    }

    if ("IntersectionObserver" in window) {
      var statsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runStats();
            statsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.35 });
      statsObserver.observe(statsRow);
    } else {
      runStats();
    }
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
