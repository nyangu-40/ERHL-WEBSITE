// Page Transition Handler
document.addEventListener('click', function(e) {
  const link = e.target.closest('a');
  if (link && link.getAttribute('href') && !link.getAttribute('href').startsWith('#') && !link.getAttribute('target') && link.getAttribute('href').endsWith('.html')) {
    e.preventDefault();
    const url = link.getAttribute('href');
    document.body.style.opacity = '0';
    setTimeout(() => {
      window.location.href = url;
    }, 300);
  }
});

// Load Navbar & Footer
fetch('components/navbar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('navbar').innerHTML = data;
    
    // Admin access via double-click on logo
    const logo = document.querySelector('.navbar-brand img');
    if (logo) {
      logo.addEventListener('dblclick', function() {
        window.location.href = 'admin.html';
      });
    }
  });

fetch('components/footer.html')
  .then(res => res.text())
  .then(data => document.getElementById('footer').innerHTML = data);

// Hero Carousel Auto-rotation
document.addEventListener('DOMContentLoaded', function() {
  const heroCarouselElement = document.getElementById('heroCarousel');

  if (heroCarouselElement) {
    // Initialize Bootstrap carousel with 15 second interval
    const heroCarousel = new bootstrap.Carousel(heroCarouselElement, {
      interval: 15000,
      ride: 'carousel',
      pause: false  // Don't pause on hover
    });
  }

  // Project Buttons & Images
  const projectButtons = document.querySelectorAll('.project-buttons .btn');
  const projectImages = document.querySelectorAll('.project-image');
  const projectDescs = document.querySelectorAll('.project-desc');

  projectButtons.forEach(button => {
    button.addEventListener('click', function() {
      const projectType = this.getAttribute('data-project');

      // Update active button
      projectButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      // Update active images
      projectImages.forEach(img => img.classList.remove('active'));
      document.querySelector(`.project-image[data-project="${projectType}"]`).classList.add('active');

      // Update active descriptions
      projectDescs.forEach(desc => desc.classList.remove('active'));
      document.querySelector(`.project-${projectType}-desc`).classList.add('active');
    });
  });

  // Values Carousel
  const valuesPrevBtn = document.getElementById('valuesPrevBtn');
  const valuesNextBtn = document.getElementById('valuesNextBtn');
  const valuesCarouselInner = document.querySelector('.values-carousel-inner');
  const valueCards = document.querySelectorAll('.values-carousel-inner .value-card');

  if (valuesPrevBtn && valuesNextBtn && valueCards.length > 0) {
    let currentIndex = 0;

    function getCardsPerView() {
      return window.innerWidth > 768 ? 2 : 1;
    }

    let cardsPerView = getCardsPerView();
    let maxIndex = Math.max(0, valueCards.length - cardsPerView);

    function updateCarousel() {
      // compute gap and card width dynamically
      const style = window.getComputedStyle(valuesCarouselInner);
      const gap = parseFloat(style.gap) || 24;
      const cardRect = valueCards[0].getBoundingClientRect();
      const cardWidth = cardRect.width;
      const offset = -(currentIndex * (cardWidth + gap));
      valuesCarouselInner.style.transform = `translateX(${offset}px)`;
    }

    function resetAutoCycle() {
      clearInterval(autoCycleTimer);
      autoCycleTimer = setInterval(() => {
        currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
        updateCarousel();
      }, 5200);
    }

    valuesPrevBtn.addEventListener('click', function() {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
        resetAutoCycle();
      }
    });

    valuesNextBtn.addEventListener('click', function() {
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
        resetAutoCycle();
      }
    });

    // Auto-scroll carousel when the section is visible and when scrolling
    const valuesSection = document.getElementById('values');
    function updateCarouselOnScroll() {
      if (!valuesSection) return;
      const rect = valuesSection.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

      const visibleRatio = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      const newIndex = Math.floor(visibleRatio * (maxIndex + 1));
      const bounded = Math.min(maxIndex, Math.max(0, newIndex));
      if (bounded !== currentIndex) {
        currentIndex = bounded;
        updateCarousel();
      }
    }

    window.addEventListener('scroll', updateCarouselOnScroll, { passive: true });

    // Update on resize
    window.addEventListener('resize', function() {
      cardsPerView = getCardsPerView();
      maxIndex = Math.max(0, valueCards.length - cardsPerView);
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      updateCarousel();
    });

    let autoCycleTimer = null;
    resetAutoCycle();
    // initial layout
    setTimeout(updateCarousel, 60);
  }

  // Load public content from Firestore
  loadPublicNews();
  loadPublicProjects();

  // Contact Form Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const name = document.getElementById('contactName').value;
      const email = document.getElementById('contactEmail').value;
      const message = document.getElementById('contactMessage').value;

      try {
        // Import the function dynamically
        const { addContactMessage } = await import('./firebase-service.js');

        await addContactMessage({
          name,
          email,
          message,
          timestamp: new Date().toISOString()
        });

        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Sorry, there was an error sending your message. Please try again.');
      }
    });
  }

  // Volunteer Form Submission
  const volunteerForm = document.getElementById('volunteerForm');
  if (volunteerForm) {
    volunteerForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const firstName = document.getElementById('volunteerFirstName').value;
      const lastName = document.getElementById('volunteerLastName').value;
      const email = document.getElementById('volunteerEmail').value;
      const phone = document.getElementById('volunteerPhone').value;
      const interest = document.getElementById('volunteerInterest').value;
      const skills = document.getElementById('volunteerSkills').value;
      const availability = document.getElementById('volunteerAvailability').value;

      try {
        // Import the function dynamically
        const { addVolunteer } = await import('./firebase-service.js');

        await addVolunteer({
          name: `${firstName} ${lastName}`,
          email,
          phone,
          interest,
          skills,
          availability,
          timestamp: new Date().toISOString()
        });

        alert('Thank you for your interest in volunteering! We will contact you soon.');
        volunteerForm.reset();
      } catch (error) {
        console.error('Error submitting volunteer application:', error);
        alert('Sorry, there was an error submitting your application. Please try again.');
      }
    });
  }

  // Donation Form Submission
  const donationForm = document.getElementById('donationForm');
  if (donationForm) {
    donationForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const firstName = document.getElementById('donorFirstName').value;
      const lastName = document.getElementById('donorLastName').value;
      const email = document.getElementById('donorEmail').value;
      const phone = document.getElementById('donorPhone').value;
      const amount = document.getElementById('donationAmount').value;
      const paymentMethod = document.getElementById('paymentMethod').value;
      const anonymous = document.getElementById('anonymousDonation').checked;
      const message = document.getElementById('donationMessage').value;

      try {
        // Import the function dynamically
        const { addDonation } = await import('./firebase-service.js');

        await addDonation({
          name: anonymous ? 'Anonymous' : `${firstName} ${lastName}`,
          email: anonymous ? '' : email,
          phone: anonymous ? '' : phone,
          amount,
          paymentMethod,
          message,
          anonymous,
          timestamp: new Date().toISOString()
        });

        alert('Thank you for your generous donation! Your support means everything to us.');
        donationForm.reset();
      } catch (error) {
        console.error('Error processing donation:', error);
        alert('Sorry, there was an error processing your donation. Please try again.');
      }
    });
  }
});

async function loadPublicNews() {
  const newsContainer = document.getElementById('newsCardsContainer') || document.getElementById('newsGrid');
  if (!newsContainer) return;

  try {
    const { getNews } = await import('./firebase-service.js');
    const news = await getNews();
    const sortedNews = news.slice().sort((a, b) => new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0));

    newsContainer.innerHTML = '';
    if (sortedNews.length === 0) {
      const emptyMessage = newsContainer.classList.contains('news-grid')
        ? '<div class="news-card"><div class="news-body text-center text-muted">No news articles available yet.</div></div>'
        : '<div class="col-12 text-center text-muted">No news articles available yet.</div>';
      newsContainer.innerHTML = emptyMessage;
      return;
    }

    function escapeHtml(text) {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    sortedNews.forEach(item => {
      const image = item.image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80';
      const date = item.date ? new Date(item.date).toLocaleDateString() : item.timestamp ? new Date(item.timestamp).toLocaleDateString() : '';
      const content = item.content ? item.content.trim() : '';
      const escapedTitle = escapeHtml(item.title || 'News update');
      const escapedSummary = escapeHtml(content.substring(0, 140)) + (content.length > 140 ? '...' : '');
      const escapedFull = escapeHtml(content);
      const hasMore = content.length > 140;

      if (newsContainer.id === 'newsGrid' || newsContainer.classList.contains('news-grid')) {
        newsContainer.innerHTML += `
          <div class="news-card">
            <img src="${image}" alt="${escapedTitle}">
            <div class="news-body">
              <p class="news-date">${date}</p>
              <h6>${escapedTitle}</h6>
              <p class="small news-summary">${escapedSummary}</p>
              ${hasMore ? `<p class="small news-full-text">${escapedFull}</p><button class="read-more-btn" type="button">Read more</button>` : ''}
            </div>
          </div>
        `;
      } else {
        newsContainer.innerHTML += `
          <div class="col-lg-4">
            <div class="blog-card">
              <img src="${image}" alt="${escapedTitle}">
              <div class="card-body">
                <p class="small text-muted mb-2">${date}</p>
                <h6>${escapedTitle}</h6>
                <p class="small news-summary">${escapedSummary}</p>
                ${hasMore ? `<p class="small news-full-text">${escapedFull}</p><button class="read-more-btn" type="button">Read more</button>` : ''}
              </div>
            </div>
          </div>
        `;
      }
    });

    newsContainer.querySelectorAll('.read-more-btn').forEach(button => {
      button.addEventListener('click', function() {
        const card = this.closest('.news-card, .blog-card');
        const summary = card.querySelector('.news-summary');
        const fullText = card.querySelector('.news-full-text');

        if (!fullText) return;

        if (fullText.style.display === 'block') {
          fullText.style.display = 'none';
          this.textContent = 'Read more';
          if (summary) summary.style.display = 'block';
        } else {
          fullText.style.display = 'block';
          this.textContent = 'Show less';
          if (summary) summary.style.display = 'none';
        }
      });
    });
  } catch (error) {
    console.error('Error loading public news:', error);
  }
}

async function loadPublicProjects() {
  const projectContainer = document.getElementById('projectCardsContainer') || document.getElementById('projectGrid');
  if (!projectContainer) return;

  try {
    const { getProjects } = await import('./firebase-service.js');
    const projects = await getProjects();

    renderProjectTabs(projects);

    projectContainer.innerHTML = '';

    if (projects.length === 0) {
      const emptyMessage = projectContainer.id === 'projectGrid'
        ? '<div class="project-card"><div class="project-card-body text-center text-muted">No projects available yet.</div></div>'
        : '<div class="col-12 text-center text-muted">No projects available yet.</div>';
      projectContainer.innerHTML = emptyMessage;
      return;
    }

    projects.slice().reverse().forEach(item => {
      const image = item.image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80';
      const description = item.description || '';
      const points = item.points || []; // Assuming points is an array of strings

      if (projectContainer.id === 'projectGrid') {
        let pointsHtml = '';
        if (points.length > 0) {
          pointsHtml = '<ul>' + points.map(point => `<li>${point}</li>`).join('') + '</ul>';
        }
        projectContainer.innerHTML += `
          <div class="project-detail">
            <div class="project-detail-card">
              <img src="${image}" alt="${item.title || 'Project'}">
              <div class="project-detail-body">
                <h3>${item.title || 'Project'}</h3>
                <p>${description}</p>
                ${pointsHtml}
              </div>
            </div>
          </div>
        `;
      } else {
        let pointsHtml = '';
        if (points.length > 0) {
          pointsHtml = '<ul>' + points.map(point => `<li>${point}</li>`).join('') + '</ul>';
        }
        projectContainer.innerHTML += `
          <div class="col-lg-4">
            <div class="project-detail">
              <div class="project-detail-card">
                <img src="${image}" alt="${item.title || 'Project'}">
                <div class="project-detail-body">
                  <h3>${item.title || 'Project'}</h3>
                  <p>${description}</p>
                  ${pointsHtml}
                </div>
              </div>
            </div>
          </div>
        `;
      }
    });
  } catch (error) {
    console.error('Error loading public projects:', error);
  }
}

function renderProjectTabs(projects) {
  const buttonsContainer = document.getElementById('projectButtonsContainer');
  const imageContainer = document.getElementById('projectImageContainer');
  const descContainer = document.getElementById('projectDescriptionContainer');

  if (!buttonsContainer || !imageContainer || !descContainer) return;
  if (projects.length === 0) return;

  buttonsContainer.innerHTML = '';
  imageContainer.innerHTML = '';
  descContainer.innerHTML = '';

  projects.slice().reverse().forEach((item, index) => {
    const key = `project-${index}`;
    const image = item.image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80';
    const description = item.description || '';
    const activeClass = index === 0 ? 'active' : '';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn project-tab ${activeClass}`;
    button.dataset.project = key;
    button.textContent = item.title || `Project ${index + 1}`;
    button.addEventListener('click', () => setActiveProject(key));
    buttonsContainer.appendChild(button);

    const img = document.createElement('img');
    img.src = image;
    img.alt = item.title || 'Project image';
    img.className = `project-image ${activeClass}`;
    img.dataset.project = key;
    imageContainer.appendChild(img);

    const desc = document.createElement('p');
    desc.className = `project-desc ${activeClass}`;
    desc.dataset.project = key;
    desc.textContent = description;
    descContainer.appendChild(desc);
  });
}

function setActiveProject(projectKey) {
  const buttons = document.querySelectorAll('#projectButtonsContainer .btn');
  const images = document.querySelectorAll('#projectImageContainer .project-image');
  const descs = document.querySelectorAll('#projectDescriptionContainer .project-desc');

  buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.project === projectKey));
  images.forEach(img => img.classList.toggle('active', img.dataset.project === projectKey));
  descs.forEach(desc => desc.classList.toggle('active', desc.dataset.project === projectKey));
}

// Example Blog Data (Later replace with Firebase)
const blogs = [
  { title: "Tree Planting", date: "March 2024", img: "assets/images/blog1.jpg" },
  { title: "Healthy Living", date: "March 2024", img: "assets/images/blog2.jpg" }
];

const container = document.getElementById("blog-container");

if (container) {
  blogs.forEach(blog => {
    container.innerHTML += `
      <div class="col-md-3 mb-3">
        <div class="card">
          <img src="${blog.img}" class="card-img-top">
          <div class="card-body">
            <h6>${blog.title}</h6>
            <small>${blog.date}</small>
          </div>
        </div>
      </div>
    `;
  });
}