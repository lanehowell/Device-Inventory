import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, ref, onValue, get, update, push, remove } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

const firebaseConfig = {
    databaseURL: 'https://public-safety-tech-portal-default-rtdb.firebaseio.com/'
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const referenceInDB = ref(database, "deviceInventory")

onValue(referenceInDB, ()=>{
    render()
})

document.getElementById('search').addEventListener('keyup', ()=>{
    let searchString = document.getElementById('search').value
    if(!searchString){
        render()
    }else{
        searchRender(searchString)
    }
})

document.addEventListener('click', (e)=>{
    if(e.target.dataset.id){
        handleDeviceClick(e.target.dataset.id)
    }else if(e.target.id === 'confirm-edit'){
        confirmEdit(lastClickedId)
    }else if(e.target.id === 'delete-btn'){
        deleteItem(lastClickedId)
    }else if(e.target.id === 'dark'){
        closeModal()
    }
})

let lastClickedId = ''

function deleteItem(key){
    remove(ref(database, 'deviceInventory/' + key))
    closeModal()
}

async function confirmEdit(key){
    const updatedData = {
        name: document.getElementById('name').value,
        location: document.getElementById('location').value,
        model: document.getElementById('model').value,
        notes: document.getElementById('notes').value
    };

    if (updatedData.name && updatedData.location && updatedData.model) {
        await update(ref(database, `deviceInventory/${key}`), updatedData)
            .then(() => {
                console.log("Item updated successfully");
                closeModal()
            })
            .catch((error) => {
                console.error("Error updating item:", error);
            });
    } else {
        console.log("All fields must be filled out.");
    }
}

async function handleDeviceClick(key){
    lastClickedId = key
    const deviceData = await fetchItem(key)
    openEditMenu(deviceData)
}

async function fetchData(){
    const arr =  await get(referenceInDB).then((snapshot)=>{
        return Object.entries(snapshot.val())
    })
    return arr
}

const mainTable = document.getElementById('main-table')

async function render(){
    const data = await fetchData();
    let html = `
                <thead>
                    <tr class="table-header">
                        <th>Device Name</th>
                        <th>Location (Unit)</th>
                        <th>Model</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody class='tableBody'>
                `;
    data.forEach(function(device){
        html+= `<tr class="table-content">
                    <td data-Id="${device[0]}">${device[1].name}</td>
                    <td data-Id="${device[0]}">${device[1].location}</td>
                    <td data-Id="${device[0]}">${device[1].model}</td>
                    <td data-Id="${device[0]}">${device[1].notes}</td>
                </tr>`;
    })
    mainTable.innerHTML = html + `</tbody`;
    addSortingListeners();
}

async function searchRender(search){
    const data = await fetchData();
    let html = `
                <thead>
                    <tr class="table-header">
                        <th>Device Name</th>
                        <th>Location (Unit)</th>
                        <th>Model</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody class='tableBody'>
                `;
    data.forEach(function(device){
        if(search === device[1].name || device[1].location.startsWith(search) || device[1].model.startsWith(search)){
            html+= `<tr class="table-content">
                    <td data-Id="${device[0]}">${device[1].name}</td>
                    <td data-Id="${device[0]}">${device[1].location}</td>
                    <td data-Id="${device[0]}">${device[1].model}</td>
                    <td data-Id="${device[0]}">${device[1].notes}</td>
                </tr>`;
        }
    })
    mainTable.innerHTML = html + `</tbody`;
    addSortingListeners();
}

//Function to fetch an item based on it's key
async function fetchItem(key){
    const data = await get(ref(database, `deviceInventory/${key}`)).then((snapshot)=>{
        return Object.values(snapshot.val())
     })
     return data;
}

render()

function addSortingListeners() {
    const headers = document.querySelectorAll("th");

    headers.forEach((header, index) => {
        header.addEventListener("click", ()=> {
            sortTable(index);
        });
    });
}

let sortOrder = {}; // Store sorting order for each column

function sortTable(column) {
    const table = document.getElementById("main-table");
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr")); // Get all rows inside tbody

    if (sortOrder[column] === undefined) {
        sortOrder[column] = true; // Start with ascending order
    } else {
        sortOrder[column] = !sortOrder[column]; // Toggle order
    }

    let sortedRows = rows.sort((rowA, rowB) => {
        let cellA = rowA.children[column].textContent.trim().toLowerCase();
        let cellB = rowB.children[column].textContent.trim().toLowerCase();

        if (!isNaN(cellA) && !isNaN(cellB)) { 
            return sortOrder[column] ? cellA - cellB : cellB - cellA;
        }

        return sortOrder[column] ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
    });

    tbody.innerHTML = ""; 
    sortedRows.forEach(row => tbody.appendChild(row));
}

function openEditMenu(device){
    document.getElementById('name').value = device[2]
    document.getElementById('location').value = device[0]
    document.getElementById('model').value = device[1]
    document.getElementById('notes').value = device[3]
    document.getElementById('edit-menu').classList.add('show')
    document.getElementById('dark').classList.add('show-dark')
}

function closeModal(){
    document.getElementById('dark').classList.remove('show-dark')
    document.getElementById('edit-menu').classList.remove('show')
}