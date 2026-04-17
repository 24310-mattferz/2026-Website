let selectedCar = "";
let selectedPrice = "";
let selectedCarName = "";
let startDate = "";
let endDate = "";

async function loadCars() {
    const response = await fetch("/cars");
    const cars = await response.json();

    const select = document.getElementById("car");
    select.innerHTML = '<option value="">Select Car</option>';

    cars.forEach(car => {
        const option = document.createElement("option");

        option.value = `${car.id}|${car.price_per_day}|${car.brand} ${car.model}`;
        option.textContent = `${car.brand} ${car.model} — $${car.price_per_day}/day`;

        select.appendChild(option);
    });
}

const params = new URLSearchParams(window.location.search);
const carFromURL = params.get("car");


window.addEventListener("DOMContentLoaded", async () => {
    await loadCars();
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("start").min = today;
    document.getElementById("end").min = today;

    
    if (carFromURL) {
    const select = document.getElementById("car");

    for (let option of select.options) {
        if (option.textContent.toLowerCase().includes(carFromURL.toLowerCase())) {
            select.value = option.value;
            select.dispatchEvent(new Event("change"));
            break;
        }
    }
    if (!selectedCar) {
        if (select.options.length > 1) {
            select.selectedIndex = 1;
            select.dispatchEvent(new Event("change"));
        }
    }

    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
}
});



document.getElementById("car").addEventListener("change", function () {
    const value = this.value;

    if (!value) {
        document.getElementById("priceDisplay").innerText = "";
        return;
    }

    const [car, price, name] = value.split("|");

    selectedCar = car;
    selectedPrice = parseInt(price);
    selectedCarName = name;

    document.getElementById("priceDisplay").innerText =
         `${selectedCarName} — $${selectedPrice}/day`;

 
    document.getElementById("carName").innerText = selectedCarName;
    document.getElementById("carPrice").innerText = `$${selectedPrice}/day`;
});


document.getElementById("toStep2").addEventListener("click", () => {
    if (!document.getElementById("car").value) {
        alert("Select a car");
        return;
    }

    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";

    document.getElementById("carName").innerText = selectedCarName;
    document.getElementById("carPrice").innerText = `$${selectedPrice}/day`;
});


document.getElementById("toStep3").addEventListener("click", () => {
    startDate = document.getElementById("start").value;
    endDate = document.getElementById("end").value;

    if (!startDate || !endDate) {
        alert("Select dates");
        return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
        alert("End date must be after start date");
        return;
    }

    const days = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    const total = days * selectedPrice;

    document.getElementById("step2").style.display = "none";
    document.getElementById("step3").style.display = "block";

    document.getElementById("summary").innerText =
         `${selectedCarName} | $${selectedPrice}/day | ${startDate} → ${endDate} | Total: $${total}`;
});



document.getElementById("payBtn").addEventListener("click", async () => {

    const inputs = document.querySelectorAll("#step3 .input-box input");

    let allFilled = true;
    inputs.forEach(input => {
        if (input.value.trim() === "") allFilled = false;
    });

    if (!allFilled) {
        alert("Please fill in all payment details");
        return;
    }

    const days = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    const total = days * selectedPrice;

    const userRes = await fetch("/get_user");
    const userData = await userRes.json();

    if (!userData.user_id) {
    alert("You are not logged in");
    window.location.href = "/login";
    return;
}

    const bookingData = {
        user_id: userData.user_id,
        car_id: selectedCar,
        start_date: startDate,
        end_date: endDate,
        total_price: total
    };



    const response = await fetch("/create_booking", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
    });

    const result = await response.json();

    alert(result.message);

    window.location.href = "/home";
});