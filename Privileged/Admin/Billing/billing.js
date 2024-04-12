document.getElementById("searchForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const email = document.getElementById("userEmail").value;

    console.log(email)

    fetch('/search_bills', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email})
    })
    .then(response => response.json())
    .then(data => {
        displayBills(data.bills)
    })
    .catch(error => {
        console.error('Error fetching bills', error)
    })
})

function displayBills(bills){
    const billsList = document.getElementById("billList");
    billsList.innerHTML = "";

    if(bills.length === 0){
        billsList.innerHTML = "<p>No bills found for this user.</p>"
        return
    }

    const table = document.createElement("table");
    const headerRow = table.insertRow();
    headerRow.innerHTML = "<th>Bill ID</th><th>User ID</th><th>Amount</th><th>Reason</th><th>Paid?</th>"
    bills.forEach(element => {
        const row = table.insertRow();
        row.innerHTML = `<td>${element.billid}</td><td>${element.memberemail}</td><td>${element.amount}</td><td>${element.reason}</td><td>${element.paid}</td>`
    });

    billsList.appendChild(table)
}

document.getElementById("newBillForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("emailBox").value
    const price = document.getElementById("priceBox").value
    const reason = document.getElementById("reasonBox").value

    fetch("/create_bill", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({email, price, reason})
    })
    .then(response => response.json())
    .then(data => {
        alert('Bill added successfully');
    })
});

document.getElementById("markAsPaid").addEventListener("submit", function(event) {
    event.preventDefault();

    const billID = document.getElementById("billID").value

    fetch("/pay_bill", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({billID})
    })
    .then(response => response.json())
    .then(data => {
        alert('Bill payed successfully')
    })
})