const API_BASE = '/api';

const complaintForm = document.getElementById('complaintForm');

if (complaintForm) {
  complaintForm.addEventListener('submit', submitComplaint);
}

async function submitComplaint(event) {
  event.preventDefault();

  const title = document.getElementById('title').value;
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value;
  const location = document.getElementById('location').value;
  const urgency = document.getElementById('urgency').value;
  const reporterName = document.getElementById('reporterName').value;
  const studentId = document.getElementById('studentId').value;
  const tagsInput = document.getElementById('tags').value;

  const tags = tagsInput
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag !== '');

  const complaintData = {
    title,
    category,
    description,
    location,
    urgency,
    reportedBy: {
      name: reporterName,
      studentId: studentId
    },
    tags
  };

  const formMessage = document.getElementById('formMessage');

  try {
    const response = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(complaintData)
    });

    const data = await response.json();

    if (response.ok) {
      formMessage.textContent = 'Complaint submitted successfully.';
      formMessage.className = 'message-success';
      complaintForm.reset();
      console.log(data);
    } else {
      formMessage.textContent = data.error || 'Failed to submit complaint.';
      formMessage.className = 'message-error';
    }
  } catch (error) {
    formMessage.textContent = 'Error connecting to server.';
    formMessage.className = 'message-error';
    console.error(error);
  }
}

async function loadComplaints() {
  const complaintList = document.getElementById('complaintList');
  if (!complaintList) return;

  try {
    const response = await fetch(`${API_BASE}/complaints`);
    const complaints = await response.json();

    renderComplaints(complaints);
  } catch (error) {
    complaintList.innerHTML = '<p class="message-error">Failed to load complaints.</p>';
    console.error(error);
  }
}

function renderComplaints(complaints) {
  const complaintList = document.getElementById('complaintList');
  if (!complaintList) return;

  if (!complaints.length) {
    complaintList.innerHTML = '<p>No complaints found.</p>';
    return;
  }

  complaintList.innerHTML = complaints.map(complaint => `
    <div class="complaint-item">
      <h3>${complaint.title}</h3>
      <p><strong>Category:</strong> ${complaint.category}</p>
      <p><strong>Description:</strong> ${complaint.description}</p>
      <p><strong>Location:</strong> ${complaint.location}</p>
      <p><strong>Urgency:</strong> ${complaint.urgency}</p>
      <p><strong>Status:</strong> ${complaint.status}</p>
      <p><strong>Reporter:</strong> ${complaint.reportedBy?.name || '-'} (${complaint.reportedBy?.studentId || '-'})</p>
      <p><strong>Tags:</strong> ${complaint.tags?.join(', ') || '-'}</p>

      <div class="action-row">
        <select class="small-select" id="status-${complaint._id}">
          <option value="Pending" ${complaint.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="In Progress" ${complaint.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>

        <button onclick="updateComplaintStatus('${complaint._id}')">Update Status</button>
        <button onclick="deleteComplaint('${complaint._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

async function updateComplaintStatus(id) {
  const statusValue = document.getElementById(`status-${id}`).value;

  try {
    const response = await fetch(`${API_BASE}/complaints/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: statusValue })
    });

    if (response.ok) {
      loadComplaints();
    } else {
      alert('Failed to update complaint.');
    }
  } catch (error) {
    console.error(error);
    alert('Error updating complaint.');
  }
}

async function deleteComplaint(id) {
  const confirmDelete = confirm('Are you sure you want to delete this complaint?');
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_BASE}/complaints/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      loadComplaints();
    } else {
      alert('Failed to delete complaint.');
    }
  } catch (error) {
    console.error(error);
    alert('Error deleting complaint.');
  }
}

async function searchComplaints() {
  const keyword = document.getElementById('searchKeyword').value.trim();
  const complaintList = document.getElementById('complaintList');

  if (!keyword) {
    loadComplaints();
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/complaints/search/${encodeURIComponent(keyword)}`);
    const complaints = await response.json();

    renderComplaints(complaints);
  } catch (error) {
    complaintList.innerHTML = '<p class="message-error">Failed to search complaints.</p>';
    console.error(error);
  }
}

async function loadStatusReport() {
  const statusReport = document.getElementById('statusReport');
  if (!statusReport) return;

  try {
    const response = await fetch(`${API_BASE}/reports/status-summary`);
    const summary = await response.json();

    if (!summary.length) {
      statusReport.innerHTML = '<p>No report data found.</p>';
      return;
    }

    statusReport.innerHTML = `
      <table border="1" cellpadding="10" cellspacing="0">
        <tr>
          <th>Status</th>
          <th>Total</th>
        </tr>
        ${summary.map(item => `
          <tr>
            <td>${item._id}</td>
            <td>${item.total}</td>
          </tr>
        `).join('')}
      </table>
    `;
  } catch (error) {
    statusReport.innerHTML = '<p class="message-error">Failed to load report.</p>';
    console.error(error);
  }
}