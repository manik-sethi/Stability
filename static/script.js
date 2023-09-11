// Function to display the selected date
function displayDate() {
    const dateInput = document.getElementById('datePicker');
    const dateValue = dateInput.value;
    const output = document.getElementById('selectedDate');
    if (dateValue) {
        output.textContent = `You selected: ${dateValue}`;
    } else {
        output.textContent = 'No date selected';
    }
}

function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function storeDeposit() {
    const depositAmount = document.getElementById('deposit').value;
    const dateValue = document.getElementById('datePicker').value;

    if (depositAmount && dateValue) {
        fetch('/store_deposit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: depositAmount,
                date: dateValue
            })
        })
        .then(response => {
            if (response.ok) {
                // Add to the deposits table in the DOM (if needed)
                // Clear the inputs (if needed)
            } else {
                alert('Failed to store deposit.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

        // Add to the deposits table in the DOM (if needed)
        const depositTableBody = document.querySelector('#depositTable tbody');
        const newRow = depositTableBody.insertRow();
        const dateCell = newRow.insertCell(0);
        const amountCell = newRow.insertCell(1);
        dateCell.textContent = dateValue;
        amountCell.textContent = depositAmount;

        // Clear the inputs
        document.getElementById('datePicker').value = '';
        document.getElementById('deposit').value = '';
    } else {
        alert('Please enter both date and deposit amount!');
    }
}

function storeTransaction() {
    const transactionDescription = document.getElementById('transactionDescription').value;
    const transactionAmount = document.getElementById('transactionAmount').value;
    const dateValue = document.getElementById('datePicker').value;
    const transactionCategory = document.getElementById('budgetChoices').value === "other" ? document.getElementById('otherCategory').value : document.getElementById('budgetChoices').value;
    
    if (transactionDescription && transactionAmount && dateValue && transactionCategory) {
        // Add to the transactions table in the DOM
        const transactionTableBody = document.querySelector('#transactionTable tbody');
        const newRow = transactionTableBody.insertRow();
        const dateCell = newRow.insertCell(0);
        const descriptionCell = newRow.insertCell(1);
        const categoryCell = newRow.insertCell(2); // New cell for category
        const amountCell = newRow.insertCell(3);
        dateCell.textContent = dateValue;
        descriptionCell.textContent = transactionDescription;
        categoryCell.textContent = transactionCategory; // Set the category
        amountCell.textContent = transactionAmount;

        // Clear the inputs
        document.getElementById('datePicker').value = '';
        document.getElementById('transactionDescription').value = '';
        document.getElementById('transactionAmount').value = '';
        if (transactionCategory === "other") {
            document.getElementById('otherCategory').value = ''; // Clear the other category if it was used
        }

        // Add to our transactions array
        const transaction = new Payment(transactionDescription, transactionAmount, transactionCategory, "transaction", dateValue);
    } else {
        alert('Please complete all fields including date, transaction description, amount, and category!');
    }
}

function checkOther(selectBox) {
    const otherInputDiv = document.getElementById('otherInput');
    if (selectBox.value === "other") {
        otherInputDiv.style.display = "block";
    } else {
        otherInputDiv.style.display = "none";
    }
}

// New Code
let transactions = [];
let deposits = [];
class Payment {
    constructor(name, amount, category, type, date) {
        this.name = name;
        this.amount = parseFloat(amount);
        this.category = category;
        this.type = type;
        this.date = date;
        if (type === "transaction") {
            transactions.push(this);
        } else if (type === "deposit") {
            deposits.push(this);
        }
    }
    getName() { return this.name; }
    getAmount() { return this.amount; }
    getCategory() { return this.category; }
    getDate() { return this.date; }
    editAmount(newAmount) {
        if (typeof newAmount !== "number") { return; }
        else { this.amount = newAmount; }
    }
    editCategory(newCategory) {
        if (typeof newCategory !== "string") { return; }
        else { this.category = newCategory; }
    }
}

function amountSort(list) {
    // ... Your existing amountSort function code ...
}

function dateConvert(dateString) {
    // ... Your existing dateConvert function code ...
}

// Function to update budget bar based on input
function updateBudgetBar(category) {
    const budgetInput = document.getElementById(`${category}Budget`);
    const budgetValue = parseFloat(budgetInput.value) || 0;
    const budgetBar = budgetInput.closest('.category').querySelector('.filled-bar');
    const spentAmount = getSpentAmount(category); // Define this function to calculate the actual spent amount for each category
    const filledWidth = (spentAmount / budgetValue) * 100;
    budgetBar.style.width = filledWidth + '%';
    
    // Update the budget amount display
    const budgetAmountSpan = document.getElementById(`${category}BudgetAmount`);
    budgetAmountSpan.textContent = `Budget: $${budgetValue.toFixed(2)}`;
}

function getSpentAmount(category) {
    const categoryTransactions = transactions.filter(transaction => transaction.getCategory() === category);
    return categoryTransactions.reduce((total, transaction) => total + transaction.getAmount(), 0);
}

// Function to add a new budget category
function addNewCategory() {
    const selectBox = document.getElementById('budgetChoices');
    const otherCategoryInput = document.getElementById('otherCategory');
    const newCategory = otherCategoryInput.value.trim();

    // Check if the category already exists in the select box
    const categoryExists = [...selectBox.options].some(opt => opt.value === newCategory);

    if (newCategory && !categoryExists) {
        const newOption = document.createElement('option');
        newOption.value = newCategory;
        newOption.textContent = newCategory;
        selectBox.insertBefore(newOption, selectBox.lastChild);

        // Create a new budget category bar
        createBudgetBar(newCategory);

        // Clear the input and hide the input box
        otherCategoryInput.value = "";
        selectBox.value = newCategory;
        document.getElementById('otherInput').style.display = "none";
    } else {
        // If category already exists, select it in the dropdown
        selectBox.value = newCategory;
        document.getElementById('otherInput').style.display = "none";
    }
}

// Function to create a new budget category bar
function createBudgetBar(category) {
    const budgetContainer = document.getElementById('budgetCategoryContainer');
    const newCategoryDiv = document.createElement('div');
    newCategoryDiv.className = 'category';
    newCategoryDiv.innerHTML = `
        <p>${category}:</p>
        <div class="budget-bar">
            <div class="filled-bar ${category.toLowerCase()}"></div>
        </div>
        <div class="budget-input-container">
            <input type="number" placeholder="Set budget" class="budget-input" id="${category}Budget">
            <button class="set-budget-button" onclick="updateBudgetBar('${category}')">Set</button>
        </div>
        <span class="budget-amount" id="${category}BudgetAmount">Budget: N/A</span>
    `;
    budgetContainer.appendChild(newCategoryDiv);

    // Add event listener to the new budget input element
    const newBudgetInput = document.getElementById(`${category}Budget`);
    newBudgetInput.addEventListener('input', updateBudgetBar);
}

// Get the canvas element and create a context
const ctx = document.getElementById('lineChart').getContext('2d');

// Sample data for the line graph
const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    datasets: [{
        label: 'Amount of Money',
        data: [100, 150, 200, 130, 180, 250], // Replace with your actual data
        borderColor: 'rgba(75, 192, 192, 1)', // Line color
        borderWidth: 2,
        fill: false // No fill under the line
    }]
};

// Create the line chart
const lineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Months'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Amount of Money'
                }
            }
        }
    }
});

function storeDeposit() {
    const depositAmount = document.getElementById('deposit').value;
    const dateValue = document.getElementById('datePicker').value;

    if (depositAmount && dateValue) {
        fetch('/store_deposit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: depositAmount,
                date: dateValue
            })
        })
        .then(response => {
            if (response.ok) {
                // Update the deposits table in the DOM
                const depositTableBody = document.querySelector('#depositTable tbody');
                const newRow = depositTableBody.insertRow();
                const dateCell = newRow.insertCell(0);
                const amountCell = newRow.insertCell(1);
                dateCell.textContent = dateValue;
                amountCell.textContent = depositAmount;

                // Clear the inputs
                document.getElementById('datePicker').value = '';
                document.getElementById('deposit').value = '';
            } else {
                alert('Failed to store deposit.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        alert('Please enter both date and deposit amount!');
    }
}
