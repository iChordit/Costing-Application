document.addEventListener('DOMContentLoaded', function() {
    var sidebarCollapse = document.getElementById('sidebarCollapse');
    var sidebar = document.getElementById('sidebar');
    var content = document.getElementById('content');

    // Generate and set the Costing ID
    function generateCostingId() {
        const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        return `PC-${randomNum}`;
    }
    
    document.getElementById('costingId').value = generateCostingId();

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
    populateSelect('company', ['AHC', 'FDMC', 'MeDesign']);
    populateSelect('department', ['Pharma', 'Non-Pharma', 'IT', 'Marketing']);
    populateSelect('division', ['Dental', 'Derma', 'Ortho']);
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
        document.getElementById('freightValue').value = 0;
        updateCalculations();
    });

    // Toggle visibility of custom charges percentage input
    document.getElementById('customCharges').addEventListener('change', function() {
        document.getElementById('customChargesGroup').style.display = this.checked ? 'block' : 'none';
        document.getElementById('customChargesPercentage').value = 0;
        updateCalculations();
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
        // Extract input values with default values and validation
        const values = {
            quantity: parseFloat(row.querySelector('.item-quantity').value) || 0,
            cost: parseFloat(row.querySelector('.item-cost').value) || 0,
            discount: parseFloat(document.getElementById('discount').value) || 0,
            exchangeRate: parseFloat(document.getElementById('exchangeRate').value) || 1,
            costOfMoney: parseFloat(document.getElementById('costOfMoney').value) || 0,
            salePrice: parseFloat(row.querySelector('.sale-price').value) || 0,
            customCharges: parseFloat(document.getElementById('customChargesPercentage').value) || 0,
            tradingCommission: parseFloat(row.querySelector('.trading-commission').value) || 0,
            salesFocDiscount: parseFloat(row.querySelector('.sales-foc-discount').value) || 0,
            freightCharges: parseFloat(document.getElementById('freightValue').value) || 0,
            clearingCharges: parseFloat(document.getElementById('clearingCharges').value) || 0,
            totalCostKDAll: parseFloat(document.getElementById('totalCostKD').value) || 1,
            sellInOriginalCurrency: document.getElementById('sellOriginalCurrency').checked
        };

        // Calculate intermediate values
        const calculations = {
            discountedCost: values.cost * (1 - values.discount / 100),
            totalCost: 0,
            totalCostKD: 0,
            totalSalesValue: 0,
            totalSalesValueKWD: 0,
            tradingCommissionValue: 0,
            tradingCommissionValueKWD: 0,
            totalFreight: 0,
            totalClearing: 0,
            totalLandedCost: 0,
            unitLandedCostKD: 0,
            unitLandedCostOC: 0,
            gp: 0,
            gpKWD: 0,
            gpMargin: 0
        };

        // Perform calculations
        calculations.totalCost = calculations.discountedCost * values.quantity;
        calculations.totalCostKD = calculations.totalCost * values.exchangeRate;
        calculations.totalSalesValue = values.sellInOriginalCurrency ? 
            values.salePrice * values.quantity : 
            (values.salePrice * values.quantity) / values.exchangeRate;
        calculations.totalSalesValueKWD = values.sellInOriginalCurrency ? 
            calculations.totalSalesValue * values.exchangeRate : 
            values.salePrice * values.quantity;
        
        // Calculate proportional charges
        calculations.totalFreight = values.freightCharges * (calculations.totalCostKD / values.totalCostKDAll);
        calculations.totalClearing = values.clearingCharges * (calculations.totalCostKD / values.totalCostKDAll);
        calculations.totalCostOfMoney = calculations.totalCostKD * values.costOfMoney / 100;
        calculations.totalCustomCharges = calculations.totalCostKD * values.customCharges / 100;

        // Calculate landed costs
        calculations.totalLandedCost = calculations.totalCostKD + 
            calculations.totalFreight + 
            calculations.totalCostOfMoney + 
            calculations.totalClearing + 
            calculations.totalCustomCharges;
        
        calculations.unitLandedCostKD = values.quantity > 0 ? calculations.totalLandedCost / values.quantity : 0;
        calculations.unitLandedCostOC = calculations.unitLandedCostKD / values.exchangeRate;

        // Calculate trading commission and GP
        calculations.tradingCommissionValue = (calculations.totalSalesValue * values.tradingCommission) / 100;
        calculations.tradingCommissionValueKWD = calculations.tradingCommissionValue * values.exchangeRate;
        calculations.gp = calculations.totalSalesValue - 
            (calculations.unitLandedCostOC * values.quantity) - 
            (calculations.totalSalesValue * values.salesFocDiscount / 100);
        calculations.gpKWD = calculations.totalSalesValueKWD - 
            calculations.totalLandedCost - 
            (calculations.totalSalesValueKWD * values.salesFocDiscount / 100);
        calculations.gpMargin = calculations.gp / calculations.totalSalesValue * 100;

        // Update row values
        updateRowValues(row, calculations);
    }

    // Helper function to update row values
    function updateRowValues(row, calc) {
        const fields = {
            '.item-discounted-cost': calc.discountedCost,
            '.item-total-cost': calc.totalCost,
            '.item-total-cost-kd': calc.totalCostKD,
            '.cost-of-money': calc.totalCostOfMoney,
            '.custom-charges': calc.totalCustomCharges,
            '.total-sale-value': calc.totalSalesValue,
            '.total-sale-value-kwd': calc.totalSalesValueKWD,
            '.unit-landed-cost-kd': calc.unitLandedCostKD,
            '.unit-landed-cost-oc': calc.unitLandedCostOC,
            '.gp': calc.gp,
            '.gp-kwd': calc.gpKWD,
            '.freight-charges': calc.totalFreight,
            '.clearing-charges': calc.totalClearing,
            '.trading-commission-oc': calc.tradingCommissionValue,
            '.trading-commission-kwd': calc.tradingCommissionValueKWD,
            '.gp-margin': calc.gpMargin
        };

        Object.entries(fields).forEach(([selector, value]) => {
            const element = row.querySelector(selector);
            if (element) element.value = value.toFixed(4);
        });
    }

    // Function to update all rows
    function updateAllRows() {
        const rows = itemTable.querySelectorAll('tbody tr');
        rows.forEach(row => {
            updateRowCalculations(row);
        });
        updateTotals();
    }

    // Add event listeners
    addRowBtn.addEventListener('click', () => {
        addNewRow();
        updateTotals();
    });
    discountInput.addEventListener('input', updateAllRows);
    exchangeRateInput.addEventListener('input', updateAllRows);
    freightValueInput.addEventListener('input', updateAllRows);
    console.log("BASHAR FREIGHT VALUE:", freightValueInput.value);
    costOfMoneyInput.addEventListener('input', updateAllRows);
    clearingChargesInput.addEventListener('input', updateAllRows);
    customChargesInput.addEventListener('input', updateAllRows);

    // Add this function at the beginning of your script
    function populateUOMOptions(selectElement) {
        const uomOptions = ['Piece', 'Box', 'Kg', 'Liter', 'Meter', 'Square Meter', 'Cubic Meter', 'Dozen', 'Pack', 'Set'];
        uomOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }

    // Update the addNewRow function
    function addNewRow() {
        const tbody = itemTable.querySelector('tbody') || itemTable.createTBody();
        const newRow = tbody.insertRow();
        newRow.innerHTML = `
            <td>${rowCounter}</td>
            <td><input type="text" class="form-control form-control-sm item-code"></td>
            <td><input type="text" class="form-control form-control-sm cms-code"></td>
            <td><input type="text" class="form-control form-control-sm item-description"></td>
            <td><input type="number" class="form-control form-control-sm item-quantity" value="1" min="1"></td>
            <td><select class="form-select form-select-sm item-uom"></select></td>
            <td><input type="number" class="form-control form-control-sm item-cost" value="0" step="0.01"></td>
            <td><input type="number" class="form-control form-control-sm trading-commission" value="0" step="0.01"></td>
            <td><input type="number" class="form-control form-control-sm item-discounted-cost readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm item-total-cost readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm item-total-cost-kd readonly-input" readonly></td>
            <td><button type="button" class="btn btn-info btn-sm show-details">Details</button></td>
            <td><input type="number" class="form-control form-control-sm total-landed-cost readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm unit-landed-cost-kd readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm unit-landed-cost-oc readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm sale-price" value="0" step="0.01"></td>
            <td><input type="number" class="form-control form-control-sm total-sale-value readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm total-sale-value-kwd readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm sales-foc-discount value="0" step="1.00"></td>
            <td><input type="number" class="form-control form-control-sm trading-commission-oc readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm trading-commission-kwd readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm gp readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm gp-kwd readonly-input" readonly></td>
            <td><input type="number" class="form-control form-control-sm gp-margin readonly-input" readonly></td>
            <td><button type="button" class="btn btn-danger btn-sm delete-row">X</button></td>
            <input type="hidden" class="freight-charges">
            <input type="hidden" class="cost-of-money">
            <input type="hidden" class="clearing-charges">
            <input type="hidden" class="custom-charges">
        `;
        rowCounter++;

        const quantityInput = newRow.querySelector('.item-quantity');
        const costInput = newRow.querySelector('.item-cost');
        const deleteBtn = newRow.querySelector('.delete-row');
        const uomSelect = newRow.querySelector('.item-uom');
        const saleInput = newRow.querySelector('.sale-price');
        const detailsBtn = newRow.querySelector('.show-details');
        const tradingCommissionInput = newRow.querySelector('.trading-commission');
        const salesFocDiscountInput = newRow.querySelector('.sales-foc-discount');
        // Populate UOM dropdown
        populateUOMOptions(uomSelect);

        quantityInput.addEventListener('input', () => {
            updateRowCalculations(newRow);
            updateTotals();
        });
        salesFocDiscountInput.addEventListener('input', () => {
            updateRowCalculations(newRow);
            updateTotals();
        });
        tradingCommissionInput.addEventListener('input', () => {
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
        saleInput.addEventListener('input', () => {
            updateRowCalculations(newRow);
            updateTotals();
        });
        detailsBtn.addEventListener('click', () => showDetails(newRow));

        updateRowCalculations(newRow);
        updateAllRows(); // Add this line
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
        let totalSalesValue = 0;
        let totalSalesValueKWD = 0;
        let totalGrossProfit = 0;
        let totalGrossProfitKWD = 0;
        let totalGpMargin = 0;
        let totalTradingCommissionOC = 0;
        let totalTradingCommissionKWD = 0;
        const rows = document.querySelectorAll('#itemTable tbody tr');
        const freight = parseFloat(document.getElementById('freightValue').value) || 0;
        const clearingCharges = parseFloat(document.getElementById('clearingCharges').value) || 0;
        console.log("BASHAR FREIGHT:", freight);
        const containers = parseInt(document.getElementById('containers').value) || 1;
        const clearanceFeesTemplate = document.getElementById('clearanceFeesTemplate').value;

        // First pass: calculate total costs
        rows.forEach(row => {
            const totalCostForRow = parseFloat(row.querySelector('.item-total-cost').value) || 0;
            const totalCostKDForRow = parseFloat(row.querySelector('.item-total-cost-kd').value) || 0;
            const costOfMoneyForRow = parseFloat(row.querySelector('.cost-of-money').value) || 0;
            const customChargesForRow = parseFloat(row.querySelector('.custom-charges').value) || 0;
            const totalSalesValueForRow = parseFloat(row.querySelector('.total-sale-value').value) || 0;
            const totalSalesValueKWDForRow = parseFloat(row.querySelector('.total-sale-value-kwd').value) || 0;
            
            totalCost += totalCostForRow;
            totalCostKD += totalCostKDForRow;
            totalCostOfMoney += costOfMoneyForRow;
            totalCustomCharges += customChargesForRow;
            totalSalesValue += totalSalesValueForRow;
            totalSalesValueKWD += totalSalesValueKWDForRow;
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

        let totalLandedCost = 0;
        const exchangeRate = parseFloat(document.getElementById('exchangeRate').value) || 1;

        // Second pass: update line freight charges, clearing charges, and total landed cost
        rows.forEach(row => {
            const totalCostKDForRow = parseFloat(row.querySelector('.item-total-cost-kd').value) || 0;
            const lineFreightCharge = totalCostKD > 0 ? (totalCostKDForRow / totalCostKD) * freight : 0;
            const lineClearingCharge = totalCostKD > 0 ? (totalCostKDForRow / totalCostKD) * totalClearingCharges : 0;
            
            // Update the freight charges and clearing charges inputs
            row.querySelector('.freight-charges').value = lineFreightCharge.toFixed(4);
            row.querySelector('.clearing-charges').value = lineClearingCharge.toFixed(4);

            console.log(`Line Freight Charge: ${lineFreightCharge.toFixed(4)}`);
            console.log(`Line Clearing Charge: ${lineClearingCharge.toFixed(4)}`);

            // Calculate and update Total Landed Cost
            const costOfMoney = parseFloat(row.querySelector('.cost-of-money').value) || 0;
            const customCharges = parseFloat(row.querySelector('.custom-charges').value) || 0;
            const rowLandedCost = totalCostKDForRow + lineFreightCharge + costOfMoney + lineClearingCharge + customCharges;
            row.querySelector('.total-landed-cost').value = rowLandedCost.toFixed(4);

            // Calculate and update Unit Landed Cost (KD and OC)
            const quantity = parseFloat(row.querySelector('.item-quantity').value) || 1;
            const unitLandedCostKD = quantity > 0 ? rowLandedCost / quantity : 0;
            const unitLandedCostOC = unitLandedCostKD / exchangeRate;
            row.querySelector('.unit-landed-cost-kd').value = unitLandedCostKD.toFixed(4);
            row.querySelector('.unit-landed-cost-oc').value = unitLandedCostOC.toFixed(4);
            
            // Calculate GP
            const tradingCommissionForRow = parseFloat(row.querySelector('.trading-commission').value) || 0;
            const totalSalesValueForRow = parseFloat(row.querySelector('.total-sale-value').value) || 0;
            const tradingCommissionValueForRow = (totalSalesValueForRow * tradingCommissionForRow) / 100;
            const salesFocDiscountForRow = parseFloat(row.querySelector('.sales-foc-discount').value) || 0;
            const gp = totalSalesValueForRow - (unitLandedCostOC * quantity) + tradingCommissionValueForRow - (totalSalesValueForRow * salesFocDiscountForRow / 100);
            const gpKWD = totalSalesValueForRow * exchangeRate - rowLandedCost + (tradingCommissionValueForRow * exchangeRate) - (totalSalesValueForRow * exchangeRate * salesFocDiscountForRow / 100);
            const gpMargin = gp / totalSalesValueForRow * 100;
            row.querySelector('.gp').value = gp.toFixed(4);
            row.querySelector('.gp-kwd').value = gpKWD.toFixed(4);
            row.querySelector('.gp-margin').value = gpMargin.toFixed(4);
            totalLandedCost += rowLandedCost;
            totalGrossProfit += gp;
            totalGrossProfitKWD += gpKWD;

            // Calculate trading commission for the row
            const tradingCommissionPercent = parseFloat(row.querySelector('.trading-commission').value) || 0;
            const tradingCommissionOC = (totalSalesValueForRow * tradingCommissionPercent) / 100;
            const tradingCommissionKWD = tradingCommissionOC * exchangeRate;

            // Update trading commission fields in the row
            row.querySelector('.trading-commission-oc').value = tradingCommissionOC.toFixed(4);
            row.querySelector('.trading-commission-kwd').value = tradingCommissionKWD.toFixed(4);

            // Accumulate trading commission totals
            totalTradingCommissionOC += tradingCommissionOC;
            totalTradingCommissionKWD += tradingCommissionKWD;

            console.log(`Row calculation details (updateTotals):
                Total Cost KD: ${totalCostKDForRow.toFixed(4)}
                Line Freight Charge: ${lineFreightCharge.toFixed(4)}
                Line Clearing Charge: ${lineClearingCharge.toFixed(4)}
                Cost of Money: ${costOfMoney.toFixed(4)}
                Custom Charges: ${customCharges.toFixed(4)}
                Row Landed Cost: ${rowLandedCost.toFixed(4)}
                Unit Landed Cost KD: ${unitLandedCostKD.toFixed(4)}
                Unit Landed Cost OC: ${unitLandedCostOC.toFixed(4)}
                Total Sales Value: ${totalSalesValueForRow.toFixed(4)}
                GP: ${gp.toFixed(4)}
                GP (KWD): ${gpKWD.toFixed(4)}
                GP Margin: ${gpMargin.toFixed(4)}
            `);
        });

        // Update the Total Summary fields with formatted numbers
        document.getElementById('totalCost').value = formatNumber(totalCost, 2);
        document.getElementById('totalCostKD').value = formatNumber(totalCostKD, 2);
        document.getElementById('totalCostOfMoney').value = formatNumber(totalCostOfMoney, 2);
        document.getElementById('totalClearingCharges').value = formatNumber(totalClearingCharges, 2);
        document.getElementById('totalCustomCharges').value = formatNumber(totalCustomCharges, 2);
        document.getElementById('totalLandedCost').value = formatNumber(totalLandedCost, 2);
        document.getElementById('totalSalesValue').value = formatNumber(totalSalesValue, 2);
        document.getElementById('totalSalesValueKWD').value = formatNumber(totalSalesValueKWD, 2);
        document.getElementById('totalGrossProfit').value = formatNumber(totalGrossProfit, 2);
        document.getElementById('totalGrossProfitKWD').value = formatNumber(totalGrossProfitKWD, 2);
        document.getElementById('totalGpMargin').value = formatNumber(totalGrossProfit/totalSalesValue*100, 2);
        document.getElementById('totalTradingCommissionOC').value = formatNumber(totalTradingCommissionOC, 2);
        document.getElementById('totalTradingCommissionKWD').value = formatNumber(totalTradingCommissionKWD, 2);
        
        console.log(`Totals:
            Total Cost: ${totalCost.toFixed(4)}
            Total Cost KD: ${totalCostKD.toFixed(4)}
            Total Freight: ${freight.toFixed(4)}
            Total Clearing Charges: ${totalClearingCharges.toFixed(4)}
            Total Landed Cost: ${totalLandedCost.toFixed(4)}
            Total Gross Profit: ${totalGrossProfit.toFixed(4)}
            Total Gross Profit (KWD): ${totalGrossProfitKWD.toFixed(4)}
        `);
    }

    // Add event listeners to the item table
    document.getElementById('itemTable').addEventListener('input', updateTotals);

    // Call updateTotals initially to set starting values
    updateTotals();

    // Remember to call updateTotals() whenever you add or remove rows from the table

    // Add event listeners for freight value changes
    document.getElementById('freightValue').addEventListener('input', function() {
        console.log('Freight value changed:', this.value);
        updateAllRows();
        updateTotals();
        updateAllRows();
        updateTotals();
    });
    
    // Add event listener for clearance fees template changes
    document.getElementById('clearanceFeesTemplate').addEventListener('change', function() {
        updateAllRows();
        updateTotals();
    });
    document.getElementById('containers').addEventListener('input', updateAllRows);

    // Update event listeners
    document.getElementById('clearingCharges').addEventListener('input', updateAllRows);
    document.getElementById('containers').addEventListener('input', updateAllRows);

    function formatNumber(number, decimals = 2) {
        return number.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    function parseFormattedNumber(value) {
        return parseFloat(value.replace(/,/g, ''));
    }

    function setupNumericInput(inputId, decimals = 2) {
        const input = document.getElementById(inputId);
        input.addEventListener('blur', function() {
            const value = parseFormattedNumber(this.value);
            if (!isNaN(value)) {
                this.value = formatNumber(value, decimals);
            }
        });
        input.addEventListener('focus', function() {
            this.value = this.value.replace(/,/g, '');
        });
    }

    // Set up numeric inputs
    setupNumericInput('exchangeRate', 4);
    setupNumericInput('discount', 2);
    setupNumericInput('containers', 0);
    setupNumericInput('clearingCharges', 2);
    //setupNumericInput('freightValue', 4);
    setupNumericInput('customChargesPercentage', 2);

    // Set up numeric inputs for total summary fields
    setupNumericInput('totalCost', 2);
    setupNumericInput('totalCostKD', 2);
    setupNumericInput('totalCostOfMoney', 2);
    setupNumericInput('totalClearingCharges', 2);
    setupNumericInput('totalCustomCharges', 2);
    setupNumericInput('totalLandedCost', 2);
    setupNumericInput('totalSalesValue', 2);
    setupNumericInput('totalSalesValueKWD', 2);

    // Add this new function to set up the table layout
    function setupTableLayout() {
        const table = document.getElementById('itemTable');
        const headerRow = table.querySelector('thead tr');
        const columnWidths = [
            '50px',  // #
            '100px', // Item Code
            '100px', // CMS Code
            '200px', // Item Description
            '80px',  // Quantity
            '100px', // UOM
            '100px', // Cost
            '100px', // Trading Commission
            '100px', // Discounted Cost
            '100px', // Total Cost
            '100px', // Total Cost KD
            '100px', // Freight Charges
            '100px', // Cost of Money
            '100px', // Clearing Charges
            '100px', // Custom Charges
            '100px', // Total Landed Cost
            '100px', // Unit Landed Cost KD
            '100px', // Unit Landed Cost OC
            '100px', // Sale Price
            '100px', // Total Sale Value
            '100px', // Total Sale Value (KWD)
            '100px', // Trading Commission
            '100px', // Trading Commission (KWD)
            '100px', // GP
            '100px', // GP (KWD)
            '50px'   // Delete button
        ];

        headerRow.querySelectorAll('th').forEach((th, index) => {
            th.style.width = columnWidths[index];
            th.style.minWidth = columnWidths[index];
        });

        // Add a container div around the table for scrolling
        const tableWrapper = document.createElement('div');
        tableWrapper.style.overflowX = 'auto';
        tableWrapper.style.maxWidth = '100%';
        table.parentNode.insertBefore(tableWrapper, table);
        tableWrapper.appendChild(table);

        // Set table layout to fixed
        table.style.tableLayout = 'fixed';
        table.style.width = columnWidths.reduce((sum, width) => sum + parseInt(width), 0) + 'px';
    }

    // Call the setupTableLayout function after the DOM is loaded
    setupTableLayout();

    const sellOriginalCurrencyCheckbox = document.getElementById('sellOriginalCurrency');
    const currencySelect = document.getElementById('currency');

    function updateSalePriceHeader() {
        const salePriceHeader = itemTable.querySelector('th:nth-child(16)'); // Adjust this selector if needed
        //const gpHeader = itemTable.querySelector('th:nth-child(18)'); // Adjust this selector if needed
        
        if (salePriceHeader) {
            const currencyValue = currencySelect.value || 'OC';
            if (sellOriginalCurrencyCheckbox.checked) {
                salePriceHeader.textContent = `Sale Price (${currencyValue}/unit)`;
            } else {
                salePriceHeader.textContent = 'Sale Price (KWD/unit)';
            }
            //gpHeader.textContent = `GP (${currencyValue})`;
        }
    }

    function updateLandedCostHighlight() {
        if (!itemTable) return; // Exit if itemTable doesn't exist

        const isChecked = sellOriginalCurrencyCheckbox.checked;
        const landedCostKDCells = itemTable.querySelectorAll('.unit-landed-cost-kd');
        const landedCostOCCells = itemTable.querySelectorAll('.unit-landed-cost-oc');
        
        landedCostKDCells.forEach(cell => {
            cell.classList.toggle('highlight-kd', !isChecked);
        });

        landedCostOCCells.forEach(cell => {
            cell.classList.toggle('highlight-kd', isChecked);
        });

        updateSalePriceHeader();
    }

    if (sellOriginalCurrencyCheckbox) {
        sellOriginalCurrencyCheckbox.addEventListener('change', updateLandedCostHighlight);
    }

    if (currencySelect) {
        currencySelect.addEventListener('change', function() {
            const selectedCurrency = this.value || 'OC';
            document.querySelectorAll('.currency-placeholder').forEach(placeholder => {
                placeholder.textContent = selectedCurrency;
            });
            updateSalePriceHeader();
        });
    }

    // Only call these functions if all required elements exist
    if (sellOriginalCurrencyCheckbox && currencySelect && itemTable) {
        updateLandedCostHighlight();
        updateSalePriceHeader();
    }

    function showDetails(row) {
        const freightCharges = row.querySelector('.freight-charges').value;
        const costOfMoney = row.querySelector('.cost-of-money').value;
        const clearingCharges = row.querySelector('.clearing-charges').value;
        const customCharges = row.querySelector('.custom-charges').value;

        document.getElementById('modalFreightCharges').textContent = freightCharges;
        document.getElementById('modalCostOfMoney').textContent = costOfMoney;
        document.getElementById('modalClearingCharges').textContent = clearingCharges;
        document.getElementById('modalCustomCharges').textContent = customCharges;

        const detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
        detailsModal.show();
    }

    // Add this new function
    function updateSellCurrency() {
        updateAllRows();
        updateTotals();
        updateSalePriceHeader();
        updateLandedCostHighlight();
    }

    // Update the event listener for the checkbox
    if (sellOriginalCurrencyCheckbox) {
        sellOriginalCurrencyCheckbox.addEventListener('change', updateSellCurrency);
    }

    function updateCalculations() {
        const rows = document.querySelectorAll('#itemTable tbody tr');
        const globalValues = {
            exchangeRate: parseFloat(document.getElementById('exchangeRate').value) || 1,
            discount: parseFloat(document.getElementById('discount').value) || 0,
            freight: parseFloat(document.getElementById('freightValue').value) || 0,
            clearingCharges: parseFloat(document.getElementById('clearingCharges').value) || 0,
            costOfMoney: parseFloat(document.getElementById('costOfMoney').value) || 0,
            customCharges: parseFloat(document.getElementById('customChargesPercentage').value) || 0,
            containers: parseInt(document.getElementById('containers').value) || 1,
            clearanceFeesTemplate: document.getElementById('clearanceFeesTemplate').value,
            sellInOriginalCurrency: document.getElementById('sellOriginalCurrency').checked
        };

        // Initialize totals
        const totals = {
            cost: 0,
            costKD: 0,
            costOfMoney: 0,
            customCharges: 0,
            salesValue: 0,
            salesValueKWD: 0,
            grossProfit: 0,
            grossProfitKWD: 0,
            landedCost: 0,
            tradingCommission: 0,
            tradingCommissionKWD: 0
        };

        // First pass: calculate base totals for proportional calculations
        rows.forEach(row => {
            const rowValues = {
                quantity: parseFloat(row.querySelector('.item-quantity').value) || 0,
                cost: parseFloat(row.querySelector('.item-cost').value) || 0,
                salePrice: parseFloat(row.querySelector('.sale-price').value) || 0,
                tradingCommission: parseFloat(row.querySelector('.trading-commission').value) || 0,
                salesFocDiscount: parseFloat(row.querySelector('.sales-foc-discount').value) || 0
            };

            const discountedCost = rowValues.cost * (1 - globalValues.discount / 100);
            const totalCost = discountedCost * rowValues.quantity;
            const totalCostKD = totalCost * globalValues.exchangeRate;

            totals.cost += totalCost;
            totals.costKD += totalCostKD;
        });

        // Calculate total clearing charges based on template
        const totalClearingCharges = globalValues.clearanceFeesTemplate === 'Standard' 
            ? (totals.costKD * globalValues.clearingCharges / 100) + 95 + (230 * globalValues.containers)
            : totals.costKD * globalValues.clearingCharges / 100;

        // Second pass: calculate and update each row with proportional values
        rows.forEach(row => {
            const rowValues = {
                quantity: parseFloat(row.querySelector('.item-quantity').value) || 0,
                cost: parseFloat(row.querySelector('.item-cost').value) || 0,
                salePrice: parseFloat(row.querySelector('.sale-price').value) || 0,
                tradingCommission: parseFloat(row.querySelector('.trading-commission').value) || 0,
                salesFocDiscount: parseFloat(row.querySelector('.sales-foc-discount').value) || 0
            };

            // Calculate row-specific values
            const calculations = {
                discountedCost: rowValues.cost * (1 - globalValues.discount / 100),
                totalCost: 0,
                totalCostKD: 0,
                totalSalesValue: 0,
                totalSalesValueKWD: 0
            };

            calculations.totalCost = calculations.discountedCost * rowValues.quantity;
            calculations.totalCostKD = calculations.totalCost * globalValues.exchangeRate;

            // Calculate proportional charges
            const proportion = calculations.totalCostKD / totals.costKD;
            const rowFreight = globalValues.freight * proportion;
            const rowClearing = totalClearingCharges * proportion;
            const rowCostOfMoney = calculations.totalCostKD * globalValues.costOfMoney / 100;
            const rowCustomCharges = calculations.totalCostKD * globalValues.customCharges / 100;

            // Calculate sales values
            calculations.totalSalesValue = globalValues.sellInOriginalCurrency
                ? rowValues.salePrice * rowValues.quantity
                : (rowValues.salePrice * rowValues.quantity) / globalValues.exchangeRate;
            calculations.totalSalesValueKWD = globalValues.sellInOriginalCurrency
                ? calculations.totalSalesValue * globalValues.exchangeRate
                : rowValues.salePrice * rowValues.quantity;

            // Calculate landed costs
            const rowLandedCost = calculations.totalCostKD + rowFreight + rowCostOfMoney + rowClearing + rowCustomCharges;
            const unitLandedCostKD = rowValues.quantity > 0 ? rowLandedCost / rowValues.quantity : 0;
            const unitLandedCostOC = unitLandedCostKD / globalValues.exchangeRate;

            // Calculate GP and Trading Commission
            const tradingCommissionValue = (calculations.totalSalesValue * rowValues.tradingCommission) / 100;
            const tradingCommissionValueKWD = tradingCommissionValue * globalValues.exchangeRate;
            const gp = calculations.totalSalesValue - 
                (unitLandedCostOC * rowValues.quantity) - 
                (calculations.totalSalesValue * rowValues.salesFocDiscount / 100);
            const gpKWD = calculations.totalSalesValueKWD - 
                rowLandedCost - 
                (calculations.totalSalesValueKWD * rowValues.salesFocDiscount / 100);
            const gpMargin = calculations.totalSalesValue > 0 ? (gp / calculations.totalSalesValue * 100) : 0;

            // Update row values
            updateRowValues(row, {
                ...calculations,
                rowFreight,
                rowClearing,
                rowCostOfMoney,
                rowCustomCharges,
                rowLandedCost,
                unitLandedCostKD,
                unitLandedCostOC,
                tradingCommissionValue,
                tradingCommissionValueKWD,
                gp,
                gpKWD,
                gpMargin
            });

            // Update running totals
            totals.costOfMoney += rowCostOfMoney;
            totals.customCharges += rowCustomCharges;
            totals.salesValue += calculations.totalSalesValue;
            totals.salesValueKWD += calculations.totalSalesValueKWD;
            totals.grossProfit += gp;
            totals.grossProfitKWD += gpKWD;
            totals.landedCost += rowLandedCost;
            totals.tradingCommission += tradingCommissionValue;
            totals.tradingCommissionKWD += tradingCommissionValueKWD;
        });

        // Update total summary fields
        updateTotalSummary(totals);
    }

    // Helper function to update total summary fields
    function updateTotalSummary(totals) {
        const summaryFields = {
            'totalCost': totals.cost,
            'totalCostKD': totals.costKD,
            'totalCostOfMoney': totals.costOfMoney,
            'totalCustomCharges': totals.customCharges,
            'totalLandedCost': totals.landedCost,
            'totalSalesValue': totals.salesValue,
            'totalSalesValueKWD': totals.salesValueKWD,
            'totalGrossProfit': totals.grossProfit,
            'totalGrossProfitKWD': totals.grossProfitKWD,
            'totalGpMargin': totals.salesValue > 0 ? (totals.grossProfit/totals.salesValue*100) : 0,
            'totalTradingCommission': totals.tradingCommission,
            'totalTradingCommissionKWD': totals.tradingCommissionKWD
        };

        Object.entries(summaryFields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.value = formatNumber(value, 2);
        });
    }
});

console.log('Freight Value:', document.getElementById('freightValue').value);

document.getElementById('freightValue').addEventListener('input', function() {
    console.log('Freight value changed:', this.value);
    //updateAllRows();
    updateTotals();
    //updateAllRows();
    //updateTotals();
});

document.getElementById('clearingCharges').addEventListener('input', function() {
    console.log('Clearing charges changed:', this.value);
    updateAllRows();
});
