const rowsInput = document.getElementById("rows");
const colsInput = document.getElementById("cols");
const createBtn = document.getElementById("createBtn");
const tableWrap = document.getElementById("tableWrap");

function createTable() {
    const rows = parseInt(rowsInput.value, 10);
    const cols = parseInt(colsInput.value, 10);

    tableWrap.innerHTML = "";

    if (!rows || !cols || rows < 1 || cols < 1) {
        tableWrap.textContent = "لطفاً تعداد معتبر برای ردیف‌ها و ستون‌ها وارد کنید.";
        return;
    }

    const table = document.createElement("table");

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    for (let c = 1; c <= cols; c++) {
        const th = document.createElement("th");
        th.textContent = "Column " + c;
        headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    for (let r = 1; r <= rows; r++) {
        const tr = document.createElement("tr");
        for (let c = 1; c <= cols; c++) {
            const td = document.createElement("td");
            td.textContent = r + ", " + c;
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    tableWrap.appendChild(table);
}

createBtn.addEventListener("click", createTable);

createTable();
