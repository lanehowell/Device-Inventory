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

document.addEventListener('click', (e)=>{
    if(e.target.dataset.id){
        handleDeviceClick(e.target.dataset.id)
    }else if(e.target.id === 'confirm-edit'){
        confirmEdit(lastClickedId)
    }else if(e.target.id === 'delete-btn'){
        deleteItem(lastClickedId)
    }
})

let lastClickedId = ''

function deleteItem(key){
    remove(ref(database, 'deviceInventory/' + key))
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

function openEditMenu(device){
    document.getElementById('name').value = device[2]
    document.getElementById('location').value = device[0]
    document.getElementById('model').value = device[1]
    document.getElementById('notes').value = device[3]
    document.getElementById('edit-menu').classList.add('show')
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
        header.addEventListener("click", function() {
            sortTable(index);
        });
    });
}

function sortTable(index){
    const table = document.getElementById("main-table");
    const rows = Array.from(table.rows).slice(1); // Skip header row
    let sortedRows;
    rows.forEach((row, index)=>{
        console.log(row.children[index])
    })
}