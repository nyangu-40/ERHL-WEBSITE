import { app } from "./firebase-config.js";
import {
  getNews,
  addNews,
  deleteNews,
  updateNews,
  getProjects,
  addProject,
  deleteProject,
  updateProject,
  getVolunteers,
  getDonations,
  getContactMessages,
  deleteVolunteer,
  deleteDonation,
  deleteContactMessage,
  adminLogin,
  adminLogout,
  onAuthStateChange
} from "./firebase-service.js";

// Check authentication state on page load
document.addEventListener('DOMContentLoaded', function() {
  onAuthStateChange((user) => {
    if (user) {
      showDashboard();
    } else {
      showLogin();
    }
  });

  setupEventListeners();
});

function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminDashboard').style.display = 'block';
  loadDashboardData();
}

function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('adminEmail').value;
      const password = document.getElementById('adminPassword').value;

      const result = await adminLogin(email, password);
      if (result.success) {
        showDashboard();
        loginForm.reset();
      } else {
        showAlert('Login failed: ' + result.error, 'danger');
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function() {
      const result = await adminLogout();
      if (result.success) {
        showLogin();
      } else {
        showAlert('Logout failed: ' + result.error, 'danger');
      }
    });
  }

  // Search functionality
  setupSearch();

  // Export functionality
  setupExport();

  // Form submissions
  setupFormSubmissions();
}

function setupSearch() {
  // News search
  const newsSearch = document.getElementById('newsSearch');
  if (newsSearch) {
    newsSearch.addEventListener('input', function() {
      filterTable('newsTableBody', this.value.toLowerCase());
    });
  }

  // Projects search
  const projectsSearch = document.getElementById('projectsSearch');
  if (projectsSearch) {
    projectsSearch.addEventListener('input', function() {
      filterTable('projectsTableBody', this.value.toLowerCase());
    });
  }

  // Volunteers search
  const volunteersSearch = document.getElementById('volunteersSearch');
  if (volunteersSearch) {
    volunteersSearch.addEventListener('input', function() {
      filterTable('volunteersTableBody', this.value.toLowerCase());
    });
  }

  // Donations search
  const donationsSearch = document.getElementById('donationsSearch');
  if (donationsSearch) {
    donationsSearch.addEventListener('input', function() {
      filterTable('donationsTableBody', this.value.toLowerCase());
    });
  }

  // Contacts search
  const contactsSearch = document.getElementById('contactsSearch');
  if (contactsSearch) {
    contactsSearch.addEventListener('input', function() {
      filterTable('contactsTableBody', this.value.toLowerCase());
    });
  }
}

function filterTable(tableId, searchTerm) {
  const tbody = document.getElementById(tableId);
  if (!tbody) return;

  const rows = tbody.getElementsByTagName('tr');
  for (let row of rows) {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  }
}

function setupExport() {
  // Export buttons
  document.getElementById('exportNewsBtn')?.addEventListener('click', () => exportToCSV('news'));
  document.getElementById('exportProjectsBtn')?.addEventListener('click', () => exportToCSV('projects'));
  document.getElementById('exportVolunteersBtn')?.addEventListener('click', () => exportToCSV('volunteers'));
  document.getElementById('exportDonationsBtn')?.addEventListener('click', () => exportToCSV('donations'));
  document.getElementById('exportContactsBtn')?.addEventListener('click', () => exportToCSV('contacts'));
}

function setupFormSubmissions() {
  // Save News
  document.getElementById('saveNewsBtn')?.addEventListener('click', async function() {
    const title = document.getElementById('newsTitle').value;
    const content = document.getElementById('newsContent').value;
    const imageUrl = document.getElementById('newsImageUrl').value;
    const date = document.getElementById('newsDate').value;
    const status = document.getElementById('newsStatus').value;

    if (!title || !content || !date) {
      showAlert('Please fill in all required fields.', 'warning');
      return;
    }

    await addNews({
      title,
      content,
      image: imageUrl || '',
      date,
      status,
      timestamp: new Date().toISOString()
    });

    showAlert('News article added successfully!', 'success');
    document.getElementById('addNewsForm').reset();
    bootstrap.Modal.getInstance(document.getElementById('addNewsModal')).hide();
    loadDashboardData();
  });

  // Update News
  document.getElementById('updateNewsBtn')?.addEventListener('click', async function() {
    const id = document.getElementById('editNewsId').value;
    const title = document.getElementById('editNewsTitle').value;
    const content = document.getElementById('editNewsContent').value;
    const imageUrl = document.getElementById('editNewsImageUrl').value;
    const date = document.getElementById('editNewsDate').value;
    const status = document.getElementById('editNewsStatus').value;

    if (!title || !content || !date) {
      showAlert('Please fill in all required fields.', 'warning');
      return;
    }

    await updateNews(id, {
      title,
      content,
      image: imageUrl || '',
      date,
      status
    });

    showAlert('News article updated successfully!', 'success');
    document.getElementById('editNewsForm').reset();
    bootstrap.Modal.getInstance(document.getElementById('editNewsModal')).hide();
    loadDashboardData();
  });

  // Save Project
  document.getElementById('saveProjectBtn')?.addEventListener('click', async function() {
    const title = document.getElementById('projectTitle').value;
    const description = document.getElementById('projectDescription').value;
    const imageUrl = document.getElementById('projectImageUrl').value;
    const status = document.getElementById('projectStatus').value;

    if (!title || !description || !imageUrl) {
      showAlert('Please provide an image URL.', 'warning');
      return;
    }

    await addProject({
      title,
      description,
      image: imageUrl,
      status,
      timestamp: new Date().toISOString()
    });

    showAlert('Project added successfully!', 'success');
    document.getElementById('addProjectForm').reset();
    bootstrap.Modal.getInstance(document.getElementById('addProjectModal')).hide();
    loadDashboardData();
  });

  // Update Project
  document.getElementById('updateProjectBtn')?.addEventListener('click', async function() {
    const id = document.getElementById('editProjectId').value;
    const title = document.getElementById('editProjectTitle').value;
    const description = document.getElementById('editProjectDescription').value;
    const imageUrl = document.getElementById('editProjectImageUrl').value;
    const status = document.getElementById('editProjectStatus').value;

    if (!title || !description) {
      showAlert('Please fill in all required fields.', 'warning');
      return;
    }

    await updateProject(id, {
      title,
      description,
      image: imageUrl || '',
      status
    });

    showAlert('Project updated successfully!', 'success');
    document.getElementById('editProjectForm').reset();
    bootstrap.Modal.getInstance(document.getElementById('editProjectModal')).hide();
    loadDashboardData();
  });
}


async function loadDashboardData() {
  try {
    // Load all data
    const [news, projects, volunteers, donations, contacts] = await Promise.all([
      getNews(),
      getProjects(),
      getVolunteers(),
      getDonations(),
      getContactMessages()
    ]);

    // Update stats
    updateStats(news, projects, volunteers, donations, contacts);

    // Load tables
    loadNewsTable(news);
    loadProjectsTable(projects);
    loadVolunteersTable(volunteers);
    loadDonationsTable(donations);
    loadContactsTable(contacts);

  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showAlert('Error loading data. Please check your internet connection.', 'danger');
  }
}

function updateStats(news, projects, volunteers, donations, contacts) {
  document.getElementById('newsCount').textContent = news.length;
  document.getElementById('projectsCount').textContent = projects.length;
  document.getElementById('volunteersCount').textContent = volunteers.length;
  document.getElementById('donationsCount').textContent = donations.length;
  document.getElementById('contactsCount').textContent = contacts.length;

  // Calculate total donations
  const total = donations.reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);
  document.getElementById('totalDonations').textContent = `$${total.toFixed(2)}`;
}

function loadNewsTable(news) {
  const tbody = document.getElementById('newsTableBody');
  tbody.innerHTML = '';

  news.forEach(item => {
    const row = `
      <tr>
        <td>${item.title || 'No Title'}</td>
        <td>${formatDate(item.date)}</td>
        <td><span class="status-badge status-${item.status || 'published'}">${item.status || 'published'}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-primary btn-action" onclick="editNews('${item.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteNewsItem('${item.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function loadProjectsTable(projects) {
  const tbody = document.getElementById('projectsTableBody');
  tbody.innerHTML = '';

  projects.forEach(item => {
    const row = `
      <tr>
        <td>${item.title || 'No Title'}</td>
        <td>${item.description ? item.description.substring(0, 50) + '...' : 'No Description'}</td>
        <td><span class="status-badge status-${item.status || 'active'}">${item.status || 'active'}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-primary btn-action" onclick="editProject('${item.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteProjectItem('${item.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function loadVolunteersTable(volunteers) {
  const tbody = document.getElementById('volunteersTableBody');
  tbody.innerHTML = '';

  volunteers.forEach(item => {
    const row = `
      <tr>
        <td>${item.name || 'No Name'}</td>
        <td>${item.email || 'No Email'}</td>
        <td>${item.phone || 'No Phone'}</td>
        <td>${item.interest || 'No Interest'}</td>
        <td>${formatDate(item.timestamp)}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteVolunteerItem('${item.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function loadDonationsTable(donations) {
  const tbody = document.getElementById('donationsTableBody');
  tbody.innerHTML = '';

  donations.forEach(item => {
    const row = `
      <tr>
        <td>${item.name || 'Anonymous'}</td>
        <td>${item.email || 'No Email'}</td>
        <td>$${parseFloat(item.amount || 0).toFixed(2)}</td>
        <td>${item.paymentMethod || 'Not Specified'}</td>
        <td>${formatDate(item.timestamp)}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteDonationItem('${item.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function loadContactsTable(contacts) {
  const tbody = document.getElementById('contactsTableBody');
  tbody.innerHTML = '';

  contacts.forEach(item => {
    const row = `
      <tr>
        <td>${item.name || 'No Name'}</td>
        <td>${item.email || 'No Email'}</td>
        <td>${item.message ? item.message.substring(0, 50) + '...' : 'No Message'}</td>
        <td>${formatDate(item.timestamp)}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteContactItem('${item.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// Global functions for onclick handlers
window.editNews = async function(id) {
  try {
    const news = await getNews();
    const item = news.find(n => n.id === id);

    if (item) {
      document.getElementById('editNewsId').value = item.id;
      document.getElementById('editNewsTitle').value = item.title || '';
      document.getElementById('editNewsContent').value = item.content || '';
      document.getElementById('editNewsImageUrl').value = item.image || '';
      document.getElementById('editNewsDate').value = item.date || '';
      document.getElementById('editNewsStatus').value = item.status || 'published';

      new bootstrap.Modal(document.getElementById('editNewsModal')).show();
    }
  } catch (error) {
    console.error('Error loading news for edit:', error);
    showAlert('Error loading news article.', 'danger');
  }
};

window.deleteNewsItem = async function(id) {
  if (confirm('Are you sure you want to delete this news article?')) {
    try {
      await deleteNews(id);
      showAlert('News article deleted successfully!', 'success');
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting news:', error);
      showAlert('Error deleting news article.', 'danger');
    }
  }
};

window.editProject = async function(id) {
  try {
    const projects = await getProjects();
    const item = projects.find(p => p.id === id);

    if (item) {
      document.getElementById('editProjectId').value = item.id;
      document.getElementById('editProjectTitle').value = item.title || '';
      document.getElementById('editProjectDescription').value = item.description || '';
      document.getElementById('editProjectImageUrl').value = item.image || '';
      document.getElementById('editProjectStatus').value = item.status || 'active';

      new bootstrap.Modal(document.getElementById('editProjectModal')).show();
    }
  } catch (error) {
    console.error('Error loading project for edit:', error);
    showAlert('Error loading project.', 'danger');
  }
};

window.deleteProjectItem = async function(id) {
  if (confirm('Are you sure you want to delete this project?')) {
    try {
      await deleteProject(id);
      showAlert('Project deleted successfully!', 'success');
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting project:', error);
      showAlert('Error deleting project.', 'danger');
    }
  }
};

window.deleteVolunteerItem = async function(id) {
  if (confirm('Are you sure you want to delete this volunteer record?')) {
    try {
      await deleteVolunteer(id);
      showAlert('Volunteer record deleted successfully!', 'success');
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      showAlert('Error deleting volunteer record.', 'danger');
    }
  }
};

window.deleteDonationItem = async function(id) {
  if (confirm('Are you sure you want to delete this donation record?')) {
    try {
      await deleteDonation(id);
      showAlert('Donation record deleted successfully!', 'success');
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting donation:', error);
      showAlert('Error deleting donation record.', 'danger');
    }
  }
};

window.deleteContactItem = async function(id) {
  if (confirm('Are you sure you want to delete this contact message?')) {
    try {
      await deleteContactMessage(id);
      showAlert('Contact message deleted successfully!', 'success');
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting contact:', error);
      showAlert('Error deleting contact message.', 'danger');
    }
  }
};

function exportToCSV(type) {
  let data = [];
  let filename = '';

  switch (type) {
    case 'news':
      data = getTableData('newsTableBody');
      filename = 'news_export.csv';
      break;
    case 'projects':
      data = getTableData('projectsTableBody');
      filename = 'projects_export.csv';
      break;
    case 'volunteers':
      data = getTableData('volunteersTableBody');
      filename = 'volunteers_export.csv';
      break;
    case 'donations':
      data = getTableData('donationsTableBody');
      filename = 'donations_export.csv';
      break;
    case 'contacts':
      data = getTableData('contactsTableBody');
      filename = 'contacts_export.csv';
      break;
  }

  if (data.length > 0) {
    const csvContent = convertToCSV(data);
    downloadCSV(csvContent, filename);
    showAlert(`${type.charAt(0).toUpperCase() + type.slice(1)} data exported successfully!`, 'success');
  } else {
    showAlert('No data to export.', 'warning');
  }
}

function getTableData(tableId) {
  const tbody = document.getElementById(tableId);
  if (!tbody) return [];

  const rows = tbody.getElementsByTagName('tr');
  const data = [];

  for (let row of rows) {
    if (row.style.display !== 'none') { // Only include visible rows (not filtered out)
      const cells = row.getElementsByTagName('td');
      const rowData = [];
      for (let cell of cells) {
        // Skip the actions column
        if (!cell.querySelector('.btn-action')) {
          rowData.push(cell.textContent.trim());
        }
      }
      if (rowData.length > 0) {
        data.push(rowData);
      }
    }
  }

  return data;
}

function convertToCSV(data) {
  return data.map(row =>
    row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function formatDate(dateString) {
  if (!dateString) return 'No Date';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
}

function showAlert(message, type) {
  // Create alert element
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  document.body.appendChild(alertDiv);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}