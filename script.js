document.addEventListener('DOMContentLoaded', function() {
    // Function to populate select fields
    function populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }

    // Populate select fields with sample data
    populateSelect('company', ['Company A', 'Company B', 'Company C']);
    populateSelect('department', ['HR', 'Finance', 'IT', 'Marketing']);
    populateSelect('division', ['Division 1', 'Division 2', 'Division 3']);
    populateSelect('principal', ['Principal 1', 'Principal 2', 'Principal 3']);
    populateSelect('sector', ['Sector A', 'Sector B', 'Sector C']);
    populateSelect('currency', ['USD', 'EUR', 'GBP', 'JPY']);
    populateSelect('priceBasis', ['FOB', 'CIF', 'EXW']);
    populateSelect('costOfMoney', ['1%', '2%', '3%', '4%', '5%']);
    populateSelect('country', ['USA', 'UK', 'Germany', 'Japan']);
    populateSelect('clearanceFeesTemplate', ['Template A', 'Template B', 'Template C']);

    // Toggle visibility of freight value input
    document.getElementById('freightCharges').addEventListener('change', function() {
        document.getElementById('freightValueGroup').style.display = this.checked ? 'block' : 'none';
    });

    // Toggle visibility of custom charges percentage input
    document.getElementById('customCharges').addEventListener('change', function() {
        document.getElementById('customChargesGroup').style.display = this.checked ? 'block' : 'none';
    });

    // Form submission handler
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!this.checkValidity()) {
            e.stopPropagation();
            this.classList.add('was-validated');
        } else {
            // Collect form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            // Here you would typically send the data to a server
            console.log('Form data:', data);
            alert('Form submitted successfully!');
        }
    });

    const itemTable = document.getElementById('itemTable');
    const addRowBtn = document.getElementById('addRowBtn');
    const discountInput = document.getElementById('discount');
    const exchangeRateInput = document.getElementById('exchangeRate');
    const recalculateBtn = document.getElementById('recalculateBtn');
    let rowCounter = 1;

    // Function to recalculate discounted costs
    function recalculateDiscountedCosts() {
        console.log("recalculateDiscountedCosts function called");
        const discountPercentage = parseFloat(document.getElementById('discount').value) || 0;
        console.log("Discount percentage:", discountPercentage);
        
        // Log the entire table HTML for debugging
        console.log("Table HTML:", itemTable.outerHTML);
        
        const itemRows = itemTable.querySelectorAll('tbody tr');
        console.log("Number of rows:", itemRows.length);

        if (itemRows.length === 0) {
            console.warn("No rows found in the table. Trying alternative selector.");
            const alternativeRows = document.querySelectorAll('#itemTable tbody tr');
            console.log("Number of rows (alternative method):", alternativeRows.length);
            itemRows = alternativeRows;
        }

        itemRows.forEach((row, index) => {
            console.log(`Processing row ${index + 1}:`, row.outerHTML);
            updateRowCalculations(row);
            console.log(`Row ${index + 1} updated`);
        });
    }

    // Update the updateRowCalculations function
    function updateRowCalculations(row) {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const cost = parseFloat(row.querySelector('.item-cost').value) || 0;
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const exchangeRate = parseFloat(document.getElementById('exchangeRate').value) || 1;

        const discountedCost = cost * (1 - discount / 100);
        const totalCost = discountedCost * quantity;
        const totalCostKWD = totalCost * exchangeRate;

        row.querySelector('.item-discounted-cost').value = discountedCost.toFixed(4);
        row.querySelector('.item-total-cost').value = totalCost.toFixed(4);
        row.querySelector('.item-total-cost-kwd').value = totalCostKWD.toFixed(4);

        console.log(`Row updated: Quantity: ${quantity}, Cost: ${cost}, Discounted Cost: ${discountedCost.toFixed(4)}, Total Cost: ${totalCost.toFixed(4)}, Total Cost KWD: ${totalCostKWD.toFixed(4)}`);
    }

    // Function to update all rows
    function updateAllRows() {
        const rows = itemTable.querySelectorAll('tbody tr');
        rows.forEach(updateRowCalculations);
    }

    // Add event listeners
    addRowBtn.addEventListener('click', addNewRow);
    discountInput.addEventListener('input', updateAllRows);
    exchangeRateInput.addEventListener('input', updateAllRows);
    recalculateBtn.addEventListener('click', recalculateDiscountedCosts);

    function addNewRow() {
        const tbody = itemTable.querySelector('tbody') || itemTable.createTBody();
        const newRow = tbody.insertRow();
        newRow.innerHTML = `
            <td>${rowCounter}</td>
            <td><input type="text" class="form-control form-control-sm item-code"></td>
            <td><input type="text" class="form-control form-control-sm cms-code"></td>
            <td><input type="text" class="form-control form-control-sm item-description"></td>
            <td><input type="number" class="form-control form-control-sm item-quantity" value="1" min="1"></td>
            <td><input type="number" class="form-control form-control-sm item-cost" value="0" step="0.01"></td>
            <td><input type="number" class="form-control form-control-sm item-discounted-cost readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm item-total-cost readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm item-total-cost-kwd readonly-input" readonly></td>
            <td><button type="button" class="btn btn-danger btn-sm delete-row">Delete</button></td>
        `;
        rowCounter++;

        const quantityInput = newRow.querySelector('.item-quantity');
        const costInput = newRow.querySelector('.item-cost');
        const deleteBtn = newRow.querySelector('.delete-row');

        quantityInput.addEventListener('input', () => updateRowCalculations(newRow));
        costInput.addEventListener('input', () => updateRowCalculations(newRow));
        deleteBtn.addEventListener('click', () => {
            deleteRow(newRow);
            updateAllRows();
        });

        updateRowCalculations(newRow);
        console.log("New row added. Total rows:", itemTable.querySelectorAll('tbody tr').length);
    }

    function deleteRow(row) {
        row.remove();
        updateSerialNumbers();
    }

    function updateSerialNumbers() {
        const rows = itemTable.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            row.cells[0].textContent = index + 1;
        });
        rowCounter = rows.length + 1;
    }

    // Add an initial row
    addNewRow();
});
