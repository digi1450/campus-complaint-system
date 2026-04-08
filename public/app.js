const API_BASE = '/api';

const complaintForm = document.getElementById('complaintForm');

if (complaintForm) {
  complaintForm.addEventListener('submit', submitComplaint);
  toggleCreateCategoryFields();
}

function parseCommaSeparated(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '');
}

function cleanNestedObject(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === 'object') {
    const cleanedObject = {};

    Object.entries(value).forEach(([key, nestedValue]) => {
      const cleanedValue = cleanNestedObject(nestedValue);

      if (cleanedValue === undefined) {
        return;
      }

      if (
        cleanedValue &&
        typeof cleanedValue === 'object' &&
        !Array.isArray(cleanedValue) &&
        Object.keys(cleanedValue).length === 0
      ) {
        return;
      }

      cleanedObject[key] = cleanedValue;
    });

    return cleanedObject;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    return trimmedValue === '' ? undefined : trimmedValue;
  }

  return value;
}

function getFieldValue(form, name) {
  const field = form.querySelector(`[name="${name}"]`);
  return field ? field.value.trim() : '';
}

function buildComplaintPayload(form, options = {}) {
  const category = getFieldValue(form, 'category');
  const status = getFieldValue(form, 'status');

  const reportedBy = cleanNestedObject({
    name: getFieldValue(form, 'reporterName'),
    studentId: getFieldValue(form, 'studentId'),
    contact: {
      email: getFieldValue(form, 'email'),
      phone: getFieldValue(form, 'phone')
    }
  });

  const extraDetails = cleanNestedObject({
    location: {
      building: getFieldValue(form, 'building'),
      room: getFieldValue(form, 'room')
    },
    device: {
      type: getFieldValue(form, 'deviceType')
    },
    facility: category === 'Facility' ? {
      issueArea: getFieldValue(form, 'facilityIssueArea'),
      maintenanceNeeded: getFieldValue(form, 'facilityMaintenanceNeeded')
    } : undefined,
    equipment: category === 'Equipment' ? {
      equipmentName: getFieldValue(form, 'equipmentName'),
      serialNumber: getFieldValue(form, 'serialNumber')
    } : undefined,
    network: category === 'Network' ? {
      connectionType: getFieldValue(form, 'connectionType'),
      networkName: getFieldValue(form, 'networkName')
    } : undefined,
    cleanliness: category === 'Cleanliness' ? {
      issueType: getFieldValue(form, 'cleanlinessIssueType'),
      affectedArea: getFieldValue(form, 'affectedArea')
    } : undefined
  });

  const complaintData = {
    title: getFieldValue(form, 'title'),
    category,
    description: getFieldValue(form, 'description'),
    location: getFieldValue(form, 'location'),
    urgency: getFieldValue(form, 'urgency'),
    reportedBy,
    tags: parseCommaSeparated(getFieldValue(form, 'tags')),
    attachments: parseCommaSeparated(getFieldValue(form, 'attachments')),
    extraDetails
  };

  if (options.includeStatus && status) {
    complaintData.status = status;
  }

  return complaintData;
}

function clearCategoryInputs(container, inputNames) {
  inputNames.forEach((name) => {
    const field = container.querySelector(`[name="${name}"]`);
    if (field) {
      field.value = '';
    }
  });
}

function updateCategoryFields(container, selectedCategory, sectionMap) {
  Object.entries(sectionMap).forEach(([category, config]) => {
    const section = container.querySelector(config.selector);
    if (!section) return;

    const shouldShow = selectedCategory === category;
    section.classList.toggle('hidden', !shouldShow);

    if (!shouldShow) {
      clearCategoryInputs(container, config.fields);
    }
  });
}

function toggleCreateCategoryFields() {
  if (!complaintForm) return;

  const category = getFieldValue(complaintForm, 'category');
  updateCategoryFields(complaintForm, category, {
    Facility: {
      selector: '#createFacilityFields',
      fields: ['facilityIssueArea', 'facilityMaintenanceNeeded']
    },
    Equipment: {
      selector: '#createEquipmentFields',
      fields: ['equipmentName', 'serialNumber']
    },
    Network: {
      selector: '#createNetworkFields',
      fields: ['connectionType', 'networkName']
    },
    Cleanliness: {
      selector: '#createCleanlinessFields',
      fields: ['cleanlinessIssueType', 'affectedArea']
    }
  });
}

function toggleEditCategoryFields(id) {
  const form = document.getElementById(`edit-form-${id}`);
  if (!form) return;

  const category = getFieldValue(form, 'category');
  updateCategoryFields(form, category, {
    Facility: {
      selector: '.edit-facility-fields',
      fields: ['facilityIssueArea', 'facilityMaintenanceNeeded']
    },
    Equipment: {
      selector: '.edit-equipment-fields',
      fields: ['equipmentName', 'serialNumber']
    },
    Network: {
      selector: '.edit-network-fields',
      fields: ['connectionType', 'networkName']
    },
    Cleanliness: {
      selector: '.edit-cleanliness-fields',
      fields: ['cleanlinessIssueType', 'affectedArea']
    }
  });
}

async function submitComplaint(event) {
  event.preventDefault();

  const formMessage = document.getElementById('formMessage');
  const complaintData = buildComplaintPayload(complaintForm);

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
      toggleCreateCategoryFields();
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

function formatDate(dateValue) {
  if (!dateValue) return '-';

  return new Date(dateValue).toLocaleString();
}

function escapeAttribute(value) {
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderCategoryDetails(complaint) {
  const details = [];

  if (complaint.extraDetails?.facility?.issueArea) {
    details.push(`<p><strong>Facility Issue Area:</strong> ${complaint.extraDetails.facility.issueArea}</p>`);
  }

  if (complaint.extraDetails?.facility?.maintenanceNeeded) {
    details.push(`<p><strong>Maintenance Needed:</strong> ${complaint.extraDetails.facility.maintenanceNeeded}</p>`);
  }

  if (complaint.extraDetails?.equipment?.equipmentName) {
    details.push(`<p><strong>Equipment Name:</strong> ${complaint.extraDetails.equipment.equipmentName}</p>`);
  }

  if (complaint.extraDetails?.equipment?.serialNumber) {
    details.push(`<p><strong>Serial Number:</strong> ${complaint.extraDetails.equipment.serialNumber}</p>`);
  }

  if (complaint.extraDetails?.network?.connectionType) {
    details.push(`<p><strong>Connection Type:</strong> ${complaint.extraDetails.network.connectionType}</p>`);
  }

  if (complaint.extraDetails?.network?.networkName) {
    details.push(`<p><strong>Network Name:</strong> ${complaint.extraDetails.network.networkName}</p>`);
  }

  if (complaint.extraDetails?.cleanliness?.issueType) {
    details.push(`<p><strong>Cleanliness Issue Type:</strong> ${complaint.extraDetails.cleanliness.issueType}</p>`);
  }

  if (complaint.extraDetails?.cleanliness?.affectedArea) {
    details.push(`<p><strong>Affected Area:</strong> ${complaint.extraDetails.cleanliness.affectedArea}</p>`);
  }

  return details.join('');
}

function renderUpdates(complaint) {
  if (!complaint.updates?.length) {
    return '<p><strong>Update History:</strong> No updates yet.</p>';
  }

  const latestUpdates = complaint.updates
    .slice(-3)
    .reverse()
    .map((update) => `<li>${formatDate(update.updatedAt)} - ${update.updatedBy || 'Staff'}: ${update.message}</li>`)
    .join('');

  return `
    <div class="update-history">
      <p><strong>Update History:</strong> ${complaint.updates.length} update(s)</p>
      <ul>${latestUpdates}</ul>
    </div>
  `;
}

function renderEditForm(complaint) {
  return `
    <form id="edit-form-${complaint._id}" class="edit-form hidden" onsubmit="submitEditComplaint(event, '${complaint._id}')">
      <h4>Edit Complaint</h4>

      <label>Title</label>
      <input type="text" name="title" value="${escapeAttribute(complaint.title)}" required />

      <label>Category</label>
      <select name="category" onchange="toggleEditCategoryFields('${complaint._id}')" required>
        <option value="Facility" ${complaint.category === 'Facility' ? 'selected' : ''}>Facility</option>
        <option value="Equipment" ${complaint.category === 'Equipment' ? 'selected' : ''}>Equipment</option>
        <option value="Network" ${complaint.category === 'Network' ? 'selected' : ''}>Network</option>
        <option value="Cleanliness" ${complaint.category === 'Cleanliness' ? 'selected' : ''}>Cleanliness</option>
        <option value="Other" ${complaint.category === 'Other' ? 'selected' : ''}>Other</option>
      </select>

      <label>Description</label>
      <textarea name="description" rows="3" required>${complaint.description || ''}</textarea>

      <label>Location</label>
      <input type="text" name="location" value="${escapeAttribute(complaint.location)}" required />

      <label>Urgency</label>
      <select name="urgency" required>
        <option value="Low" ${complaint.urgency === 'Low' ? 'selected' : ''}>Low</option>
        <option value="Medium" ${complaint.urgency === 'Medium' ? 'selected' : ''}>Medium</option>
        <option value="High" ${complaint.urgency === 'High' ? 'selected' : ''}>High</option>
      </select>

      <label>Status</label>
      <select name="status" required>
        <option value="Pending" ${complaint.status === 'Pending' ? 'selected' : ''}>Pending</option>
        <option value="In Progress" ${complaint.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
        <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
      </select>

      <label>Reporter Name</label>
      <input type="text" name="reporterName" value="${escapeAttribute(complaint.reportedBy?.name)}" required />

      <label>Student ID</label>
      <input type="text" name="studentId" value="${escapeAttribute(complaint.reportedBy?.studentId)}" required />

      <label>Email</label>
      <input type="email" name="email" value="${escapeAttribute(complaint.reportedBy?.contact?.email)}" />

      <label>Phone</label>
      <input type="text" name="phone" value="${escapeAttribute(complaint.reportedBy?.contact?.phone)}" />

      <label>Attachments (comma separated)</label>
      <input type="text" name="attachments" value="${escapeAttribute(complaint.attachments?.join(', '))}" />

      <label>Building</label>
      <input type="text" name="building" value="${escapeAttribute(complaint.extraDetails?.location?.building)}" />

      <label>Room</label>
      <input type="text" name="room" value="${escapeAttribute(complaint.extraDetails?.location?.room)}" />

      <label>Device Type</label>
      <input type="text" name="deviceType" value="${escapeAttribute(complaint.extraDetails?.device?.type)}" />

      <div class="category-fields edit-facility-fields ${complaint.category === 'Facility' ? '' : 'hidden'}">
        <label>Facility Issue Area</label>
        <input type="text" name="facilityIssueArea" value="${escapeAttribute(complaint.extraDetails?.facility?.issueArea)}" />

        <label>Maintenance Needed</label>
        <input type="text" name="facilityMaintenanceNeeded" value="${escapeAttribute(complaint.extraDetails?.facility?.maintenanceNeeded)}" />
      </div>

      <div class="category-fields edit-equipment-fields ${complaint.category === 'Equipment' ? '' : 'hidden'}">
        <label>Equipment Name</label>
        <input type="text" name="equipmentName" value="${escapeAttribute(complaint.extraDetails?.equipment?.equipmentName)}" />

        <label>Serial Number</label>
        <input type="text" name="serialNumber" value="${escapeAttribute(complaint.extraDetails?.equipment?.serialNumber)}" />
      </div>

      <div class="category-fields edit-network-fields ${complaint.category === 'Network' ? '' : 'hidden'}">
        <label>Connection Type</label>
        <input type="text" name="connectionType" value="${escapeAttribute(complaint.extraDetails?.network?.connectionType)}" />

        <label>Network Name</label>
        <input type="text" name="networkName" value="${escapeAttribute(complaint.extraDetails?.network?.networkName)}" />
      </div>

      <div class="category-fields edit-cleanliness-fields ${complaint.category === 'Cleanliness' ? '' : 'hidden'}">
        <label>Cleanliness Issue Type</label>
        <input type="text" name="cleanlinessIssueType" value="${escapeAttribute(complaint.extraDetails?.cleanliness?.issueType)}" />

        <label>Affected Area</label>
        <input type="text" name="affectedArea" value="${escapeAttribute(complaint.extraDetails?.cleanliness?.affectedArea)}" />
      </div>

      <label>Tags (comma separated)</label>
      <input type="text" name="tags" value="${escapeAttribute(complaint.tags?.join(', '))}" />

      <label>Update Note</label>
      <input type="text" name="updateMessage" placeholder="Explain what was changed" required />

      <label>Updated By</label>
      <input type="text" name="updatedBy" placeholder="Staff" />

      <p id="editMessage-${complaint._id}"></p>

      <div class="action-row">
        <button type="submit">Save Changes</button>
        <button type="button" onclick="toggleEditForm('${complaint._id}')">Cancel</button>
      </div>
    </form>
  `;
}

function renderComplaints(complaints) {
  const complaintList = document.getElementById('complaintList');
  const listMessage = document.getElementById('complaintListMessage');
  if (listMessage) {
    listMessage.remove();
  }

  if (!complaintList) return;

  if (!complaints.length) {
    complaintList.innerHTML = '<p>No complaints found.</p>';
    return;
  }

  complaintList.innerHTML = complaints.map((complaint) => `
    <div class="complaint-item">
      <h3>${complaint.title}</h3>
      <p><strong>Category:</strong> ${complaint.category}</p>
      <p><strong>Description:</strong> ${complaint.description}</p>
      <p><strong>Location:</strong> ${complaint.location}</p>
      <p><strong>Urgency:</strong> ${complaint.urgency}</p>
      <p><strong>Status:</strong> ${complaint.status}</p>
      <p><strong>Created At:</strong> ${formatDate(complaint.createdAt)}</p>
      <p><strong>Reporter:</strong> ${complaint.reportedBy?.name || '-'} (${complaint.reportedBy?.studentId || '-'})</p>
      <p><strong>Email:</strong> ${complaint.reportedBy?.contact?.email || '-'}</p>
      <p><strong>Phone:</strong> ${complaint.reportedBy?.contact?.phone || '-'}</p>
      <p><strong>Tags:</strong> ${complaint.tags?.join(', ') || '-'}</p>
      <p><strong>Total Tags:</strong> ${complaint.tags?.length || 0}</p>
      <p><strong>Attachments:</strong> ${complaint.attachments?.join(', ') || '-'}</p>
      <p><strong>Total Attachments:</strong> ${complaint.attachments?.length || 0}</p>
      <p><strong>Building:</strong> ${complaint.extraDetails?.location?.building || '-'}</p>
      <p><strong>Room:</strong> ${complaint.extraDetails?.location?.room || '-'}</p>
      <p><strong>Device Type:</strong> ${complaint.extraDetails?.device?.type || '-'}</p>
      ${renderCategoryDetails(complaint)}
      ${renderUpdates(complaint)}

      <div class="action-row">
        <button type="button" onclick="toggleEditForm('${complaint._id}')">Edit</button>
        <button type="button" onclick="deleteComplaint('${complaint._id}')">Delete</button>
      </div>

      ${renderEditForm(complaint)}
    </div>
  `).join('');
}

function toggleEditForm(id) {
  const editForm = document.getElementById(`edit-form-${id}`);
  if (!editForm) return;

  editForm.classList.toggle('hidden');
}

function showEditFormMessage(id, text, type) {
  const messageElement = document.getElementById(`editMessage-${id}`);
  if (!messageElement) return;

  messageElement.textContent = text;
  messageElement.className = type === 'success' ? 'message-success' : 'message-error';
}

function showComplaintListMessage(text, type) {
  const complaintList = document.getElementById('complaintList');
  if (!complaintList || !complaintList.parentElement) return;

  let messageElement = document.getElementById('complaintListMessage');

  if (!messageElement) {
    messageElement = document.createElement('p');
    messageElement.id = 'complaintListMessage';
    complaintList.parentElement.insertBefore(messageElement, complaintList);
  }

  messageElement.textContent = text;
  messageElement.className = type === 'success' ? 'message-success' : 'message-error';
}

async function submitEditComplaint(event, id) {
  event.preventDefault();

  const form = document.getElementById(`edit-form-${id}`);
  const complaintData = buildComplaintPayload(form, { includeStatus: true });
  const updateMessage = getFieldValue(form, 'updateMessage');
  const updatedBy = getFieldValue(form, 'updatedBy') || 'Staff';

  complaintData.updateEntry = {
    message: updateMessage,
    updatedBy
  };

  try {
    const response = await fetch(`${API_BASE}/complaints/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(complaintData)
    });

    const data = await response.json();

    if (response.ok) {
      console.log(data);
      showEditFormMessage(id, 'Complaint updated successfully.', 'success');
      setTimeout(() => {
        loadComplaints();
      }, 600);
    } else {
      showEditFormMessage(id, data.error || 'Failed to update complaint.', 'error');
    }
  } catch (error) {
    console.error(error);
    showEditFormMessage(id, 'Error updating complaint.', 'error');
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
      setTimeout(() => {
        showComplaintListMessage('Complaint deleted successfully.', 'success');
      }, 100);
    } else {
      const data = await response.json();
      showComplaintListMessage(data.error || 'Failed to delete complaint.', 'error');
    }
  } catch (error) {
    console.error(error);
    showComplaintListMessage('Error deleting complaint.', 'error');
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

function buildReportTable(rows, firstHeading, secondHeading) {
  return `
    <table class="report-table">
      <tr>
        <th>${firstHeading}</th>
        <th>${secondHeading}</th>
      </tr>
      ${rows.map((item) => `
        <tr>
          <td>${item._id}</td>
          <td>${item.total}</td>
        </tr>
      `).join('')}
    </table>
  `;
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

    statusReport.innerHTML = buildReportTable(summary, 'Status', 'Total');
  } catch (error) {
    statusReport.innerHTML = '<p class="message-error">Failed to load report.</p>';
    console.error(error);
  }
}

async function loadTagReport() {
  const tagReport = document.getElementById('tagReport');
  if (!tagReport) return;

  try {
    const response = await fetch(`${API_BASE}/reports/tag-summary`);
    const summary = await response.json();

    if (!summary.length) {
      tagReport.innerHTML = '<p>No tag data found.</p>';
      return;
    }

    tagReport.innerHTML = buildReportTable(summary, 'Tag', 'Usage Count');
  } catch (error) {
    tagReport.innerHTML = '<p class="message-error">Failed to load tag report.</p>';
    console.error(error);
  }
}

async function loadCategoryReport() {
  const categoryReport = document.getElementById('categoryReport');
  if (!categoryReport) return;

  try {
    const response = await fetch(`${API_BASE}/reports/category-summary`);
    const summary = await response.json();

    if (!summary.length) {
      categoryReport.innerHTML = '<p>No category data found.</p>';
      return;
    }

    categoryReport.innerHTML = buildReportTable(summary, 'Category', 'Total');
  } catch (error) {
    categoryReport.innerHTML = '<p class="message-error">Failed to load category report.</p>';
    console.error(error);
  }
}

async function loadUrgencyReport() {
  const urgencyReport = document.getElementById('urgencyReport');
  if (!urgencyReport) return;

  try {
    const response = await fetch(`${API_BASE}/reports/urgency-summary`);
    const summary = await response.json();

    if (!summary.length) {
      urgencyReport.innerHTML = '<p>No urgency data found.</p>';
      return;
    }

    urgencyReport.innerHTML = buildReportTable(summary, 'Urgency', 'Total');
  } catch (error) {
    urgencyReport.innerHTML = '<p class="message-error">Failed to load urgency report.</p>';
    console.error(error);
  }
}

function loadReports() {
  loadStatusReport();
  loadCategoryReport();
  loadUrgencyReport();
  loadTagReport();
}