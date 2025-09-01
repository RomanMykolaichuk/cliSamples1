document.addEventListener("DOMContentLoaded", function () {
  // State variables
  let currentPage = 1;
  let rowsPerPage = 10;
  let allData = [];
  let filteredData = [];
  let sortState = { column: "id", direction: "desc" };

  // DOM Elements
  const tableBody = document.getElementById("table-body");
  const paginationControls = document.getElementById("pagination-controls");
  const rowsPerPageSelect = document.getElementById("rows-per-page");
  const addDocBtn = document.getElementById("add-doc-btn");
  const modal = document.getElementById("add-doc-modal");
  const closeModalBtn = document.querySelector(".close-btn");
  const addDocForm = document.getElementById("add-doc-form");
  const filterClassification = document.getElementById("filter-classification");
  const filterSourceType = document.getElementById("filter-source-type");
  const filterDateFrom = document.getElementById("filter-date-from");
  const filterDateTo = document.getElementById("filter-date-to");
  const resetFiltersBtn = document.getElementById("reset-filters-btn");

  const API_URL = "/api/docs";

  // --- API Communication Layer ---

  /**
   * Handles API errors by logging them and showing an alert.
   * @param {Error} error - The error object.
   * @param {string} action - A description of the action that failed.
   */
  function handleError(error, action) {
    console.error(`Error during ${action}:`, error);
    alert(`An error occurred while ${action}: ${error.message}`);
  }

  /**
   * Fetches all documents from the API using GET.
   */
  async function getDocuments() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      allData = await response.json();
      populateFilterDropdowns();
      applyFiltersAndSort();
    } catch (error) {
      handleError(error, "loading documents");
      tableBody.innerHTML = `<tr><td colspan="9">Error loading data.</td></tr>`;
    }
  }

  /**
   * Creates a new document using POST.
   * @param {object} docData - The data for the new document.
   */
  async function createDocument(docData) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(docData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      modal.style.display = "none";
      addDocForm.reset();
      await getDocuments(); // Refresh data
    } catch (error) {
      handleError(error, "creating the document");
    }
  }

  /**
   * Deletes a document by its ID using DELETE.
   * @param {number|string} docId - The ID of the document to delete.
   */
  async function deleteDocument(docId) {
    if (
      !confirm(`Are you sure you want to delete document with ID ${docId}?`)
    ) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/${docId}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      await getDocuments(); // Refresh data
    } catch (error) {
      handleError(error, `deleting document ID ${docId}`);
    }
  }

  // --- UI Logic (Rendering, Filtering, Sorting) ---

  function applyFiltersAndSort() {
    const classification = filterClassification.value;
    const sourceType = filterSourceType.value;
    const dateFrom = filterDateFrom.value;
    const dateTo = filterDateTo.value;

    let data = allData.filter((doc) => {
      const docDate = new Date(doc.received_at);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      if (toDate) toDate.setHours(23, 59, 59, 999);

      const classificationMatch =
        !classification || doc.classification === classification;
      const sourceTypeMatch = !sourceType || doc.source_type === sourceType;
      const dateFromMatch = !fromDate || docDate >= fromDate;
      const dateToMatch = !toDate || docDate <= toDate;

      return (
        classificationMatch && sourceTypeMatch && dateFromMatch && dateToMatch
      );
    });

    if (sortState.column) {
      data.sort((a, b) => {
        const valA = a[sortState.column];
        const valB = b[sortState.column];
        let comparison = 0;
        if (valA > valB) comparison = 1;
        else if (valA < valB) comparison = -1;
        return sortState.direction === "desc" ? comparison * -1 : comparison;
      });
    }

    filteredData = data;
    currentPage = 1;
    renderTable();
    renderPagination();
  }

  function populateFilterDropdowns() {
    const classifications = [
      ...new Set(allData.map((doc) => doc.classification).filter(Boolean)),
    ];
    const sourceTypes = [
      ...new Set(allData.map((doc) => doc.source_type).filter(Boolean)),
    ];

    filterClassification.innerHTML =
      '<option value="">All Classifications</option>';
    classifications.sort().forEach((c) => {
      filterClassification.innerHTML += `<option value="${c}">${c}</option>`;
    });

    filterSourceType.innerHTML = '<option value="">All Types</option>';
    sourceTypes.sort().forEach((s) => {
      filterSourceType.innerHTML += `<option value="${s}">${s}</option>`;
    });
  }

  function renderTable() {
    tableBody.innerHTML = "";
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = filteredData.slice(start, end);

    document.querySelectorAll("#docs-table th[data-sort]").forEach((th) => {
      th.classList.remove("sort-asc", "sort-desc");
      if (th.dataset.sort === sortState.column) {
        th.classList.add(
          sortState.direction === "asc" ? "sort-asc" : "sort-desc"
        );
      }
    });

    if (paginatedData.length === 0) {
      const message =
        filteredData.length > 0
          ? "No data on this page."
          : "No documents found.";
      tableBody.innerHTML = `<tr><td colspan="9">${message}</td></tr>`;
      return;
    }

    paginatedData.forEach((doc) => {
      const row = document.createElement("tr");
      const receivedDate = new Date(doc.received_at).toLocaleString("uk-UA");
      row.innerHTML = `
            <td>${doc.id}</td>
            <td>${doc.doc_reference || ""}</td>
            <td>${receivedDate}</td>
            <td>${doc.source_type || ""}</td>
            <td>${doc.classification || ""}</td>
            <td>${doc.summary || ""}</td>
            <td>${doc.analyst_notes || ""}</td>
            <td>${doc.priority}</td>
            <td><button class="delete-btn" data-id="${
              doc.id
            }">Delete</button></td>
        `;
      tableBody.appendChild(row);
    });
  }

  function renderPagination() {
    paginationControls.innerHTML = "";
    const pageCount = Math.ceil(filteredData.length / rowsPerPage);
    if (pageCount <= 1) return;

    const prevButton = document.createElement("button");
    prevButton.innerText = "Previous";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
      currentPage--;
      renderTable();
      renderPagination();
    });
    paginationControls.appendChild(prevButton);

    const pageInfo = document.createElement("span");
    pageInfo.textContent = ` Page ${currentPage} of ${pageCount} `;
    paginationControls.appendChild(pageInfo);

    const nextButton = document.createElement("button");
    nextButton.innerText = "Next";
    nextButton.disabled = currentPage === pageCount;
    nextButton.addEventListener("click", () => {
      currentPage++;
      renderTable();
      renderPagination();
    });
    paginationControls.appendChild(nextButton);
  }

  // --- Event Listeners ---

  addDocForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(addDocForm);
    const docData = Object.fromEntries(formData.entries());
    docData.priority = parseInt(docData.priority, 10);
    createDocument(docData);
  });

  tableBody.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-btn")) {
      const docId = event.target.dataset.id;
      deleteDocument(docId);
    }
  });

  [
    filterClassification,
    filterSourceType,
    filterDateFrom,
    filterDateTo,
  ].forEach((el) => {
    el.addEventListener("change", applyFiltersAndSort);
  });

  resetFiltersBtn.addEventListener("click", () => {
    filterClassification.value = "";
    filterSourceType.value = "";
    filterDateFrom.value = "";
    filterDateTo.value = "";
    applyFiltersAndSort();
  });

  document
    .querySelectorAll("#docs-table th[data-sort]")
    .forEach((headerCell) => {
      headerCell.addEventListener("click", () => {
        const column = headerCell.dataset.sort;
        if (sortState.column === column) {
          sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
        } else {
          sortState.column = column;
          sortState.direction = "asc";
        }
        applyFiltersAndSort();
      });
    });

  rowsPerPageSelect.addEventListener("change", (e) => {
    rowsPerPage = parseInt(e.target.value, 10);
    applyFiltersAndSort();
  });

  addDocBtn.addEventListener("click", () => {
    const classifications = [
      "UNCLASSIFIED",
      "CONFIDENTIAL",
      "SECRET",
      "TOP SECRET",
    ];
    const sources = ["Intel", "Field Report", "OSINT", "Partner Nation"];
    document.getElementById("doc_reference").value = `DOC-${Date.now()}`;
    document.getElementById("classification").value =
      classifications[Math.floor(Math.random() * classifications.length)];
    document.getElementById("source_type").value =
      sources[Math.floor(Math.random() * sources.length)];
    document.getElementById("priority").value =
      Math.floor(Math.random() * 5) + 1;
    document.getElementById("summary").value = "Auto-generated summary.";
    modal.style.display = "block";
  });

  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
  window.addEventListener("click", (event) => {
    if (event.target == modal) modal.style.display = "none";
  });

  // Initial data load
  getDocuments();
});
