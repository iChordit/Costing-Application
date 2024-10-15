document.addEventListener('DOMContentLoaded', function() {
    var sidebarCollapse = document.getElementById('sidebarCollapse');
    var sidebar = document.getElementById('sidebar');
    var content = document.getElementById('content');

    sidebarCollapse.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        content.classList.toggle('active');
    });

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
    populateSelect('costOfMoney', ['6.5%', '2.5%']);
    populateSelect('country', ['USA', 'UK', 'Germany', 'Japan']);
    populateSelect('clearanceFeesTemplate', ['Standard', 'No Fees']);

    // Toggle visibility of freight value input
    document.getElementById('freightCharges').addEventListener('change', function() {
        document.getElementById('freightValueGroup').style.display = this.checked ? 'block' : 'none';
        document.getElementById('freightValue').value = 0.0000;
        updateTotals();
    });

    // Toggle visibility of custom charges percentage input
    document.getElementById('customCharges').addEventListener('change', function() {
        document.getElementById('customChargesGroup').style.display = this.checked ? 'block' : 'none';
        document.getElementById('customChargesPercentage').value = 0.0000;
        updateAllRows()
        updateTotals();
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
    const freightValueInput = document.getElementById('freightValue');
    const costOfMoneyInput = document.getElementById('costOfMoney');
    const clearingChargesInput = document.getElementById('clearingCharges');
    const customChargesInput = document.getElementById('customChargesPercentage');

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
        const costOfMoney = parseFloat(document.getElementById('costOfMoney').value) || 0;
        const customCharges = parseFloat(document.getElementById('customChargesPercentage').value) || 0;

        const discountedCost = cost * (1 - discount / 100);
        const totalCost = discountedCost * quantity;
        const totalCostKD = totalCost * exchangeRate;
        const totalCostOfMoney = totalCostKD * costOfMoney / 100;
        const totalCustomCharges = totalCostKD * customCharges / 100;

        row.querySelector('.item-discounted-cost').value = discountedCost.toFixed(4);
        row.querySelector('.item-total-cost').value = totalCost.toFixed(4);
        row.querySelector('.item-total-cost-kd').value = totalCostKD.toFixed(4);
        row.querySelector('.cost-of-money').value = totalCostOfMoney.toFixed(4);
        row.querySelector('.custom-charges').value = totalCustomCharges.toFixed(4);

        // We'll calculate the line freight charge and clearing charges in the updateTotals function

        console.log(`Row updated: Quantity: ${quantity}, Cost: ${cost}, Discounted Cost: ${discountedCost.toFixed(4)}, Total Cost: ${totalCost.toFixed(4)}, Total Cost KD: ${totalCostKD.toFixed(4)}, Cost of Money: ${totalCostOfMoney.toFixed(4)}, Custom Charges: ${totalCustomCharges.toFixed(4)}`);

        // After updating the row, call updateTotals
        updateTotals();
    }

    // Function to update all rows
    function updateAllRows() {
        const rows = itemTable.querySelectorAll('tbody tr');
        rows.forEach(updateRowCalculations);
    }

    // Add event listeners
    addRowBtn.addEventListener('click', () => {
        addNewRow();
        updateTotals();
    });
    discountInput.addEventListener('input', updateAllRows);
    exchangeRateInput.addEventListener('input', updateAllRows);
    freightValueInput.addEventListener('input', updateAllRows);
    costOfMoneyInput.addEventListener('input', updateAllRows);
    clearingChargesInput.addEventListener('input', updateAllRows);
    customChargesInput.addEventListener('input', updateAllRows);

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
            <td><input type="number" class="form-control form-control-sm item-total-cost-kd readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm freight-charges readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm cost-of-money readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm clearing-charges readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm custom-charges readonly-input" readonly></td>
            <td><button type="button" class="btn btn-danger btn-sm delete-row">X</button></td>
        `;
        rowCounter++;

        const quantityInput = newRow.querySelector('.item-quantity');
        const costInput = newRow.querySelector('.item-cost');
        const deleteBtn = newRow.querySelector('.delete-row');

        quantityInput.addEventListener('input', () => {
            updateRowCalculations(newRow);
            updateTotals();
        });
        costInput.addEventListener('input', () => {
            updateRowCalculations(newRow);
            updateTotals();
        });
        deleteBtn.addEventListener('click', () => {
            deleteRow(newRow);
            updateTotals();
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

    // Function to calculate and update totals
    function updateTotals() {
        let totalCost = 0;
        let totalCostKD = 0;
        let totalCostOfMoney = 0;
        let totalCustomCharges = 0;
        const rows = document.querySelectorAll('#itemTable tbody tr');
        const freight = parseFloat(document.getElementById('freightValue').value) || 0;
        const clearingCharges = parseFloat(document.getElementById('clearingCharges').value) || 0;
        const containers = parseInt(document.getElementById('containers').value) || 1;
        const clearanceFeesTemplate = document.getElementById('clearanceFeesTemplate').value;

        // First pass: calculate total costs
        rows.forEach(row => {
            const totalCostForRow = parseFloat(row.querySelector('.item-total-cost').value) || 0;
            const totalCostKDForRow = parseFloat(row.querySelector('.item-total-cost-kd').value) || 0;
            const costOfMoneyForRow = parseFloat(row.querySelector('.cost-of-money').value) || 0;
            const customChargesForRow = parseFloat(row.querySelector('.custom-charges').value) || 0;
            totalCost += totalCostForRow;
            totalCostKD += totalCostKDForRow;
            totalCostOfMoney += costOfMoneyForRow;
            totalCustomCharges += customChargesForRow;
        });

        // Calculate total clearing charges based on the selected template
        let totalClearingCharges;
        if (clearanceFeesTemplate === 'Standard') {
            totalClearingCharges = (totalCostKD * clearingCharges / 100) + 95 + (230 * containers);
        } else if (clearanceFeesTemplate === 'No Fee') {
            totalClearingCharges = totalCostKD * clearingCharges / 100;
        } else {
            // Default to 'No Fee' calculation if no template is selected or an unknown template is chosen
            totalClearingCharges = totalCostKD * clearingCharges / 100;
        }

        // Update the Total Summary fields
        document.getElementById('totalCost').value = totalCost.toFixed(2);
        document.getElementById('totalCostKD').value = totalCostKD.toFixed(2);
        document.getElementById('totalCostOfMoney').value = totalCostOfMoney.toFixed(2);
        document.getElementById('totalClearingCharges').value = totalClearingCharges.toFixed(2);
        document.getElementById('totalCustomCharges').value = totalCustomCharges.toFixed(2);

        // Second pass: update line freight charges and clearing charges
        rows.forEach(row => {
            const totalCostKDForRow = parseFloat(row.querySelector('.item-total-cost-kd').value) || 0;
            const lineFreightCharge = totalCostKD > 0 ? (totalCostKDForRow / totalCostKD) * freight : 0;
            const lineClearingCharge = totalCostKD > 0 ? (totalCostKDForRow / totalCostKD) * totalClearingCharges : 0;
            
            row.querySelector('.freight-charges').value = lineFreightCharge.toFixed(4);
            row.querySelector('.clearing-charges').value = lineClearingCharge.toFixed(4);
        });
    }

    // Add event listeners to the item table
    document.getElementById('itemTable').addEventListener('input', updateTotals);

    // Call updateTotals initially to set starting values
    updateTotals();

    // Remember to call updateTotals() whenever you add or remove rows from the table

    // Add event listeners for freight value changes
    document.getElementById('freightValue').addEventListener('input', updateTotals);
    
    // Add event listener for clearance fees template changes
    document.getElementById('clearanceFeesTemplate').addEventListener('change', updateAllRows);
    document.getElementById('containers').addEventListener('input', updateAllRows);

    // Update event listeners
    document.getElementById('clearingCharges').addEventListener('input', updateAllRows);
    document.getElementById('containers').addEventListener('input', updateAllRows);
});