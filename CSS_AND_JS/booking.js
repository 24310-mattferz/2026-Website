/* Global Variables (Stores selected booking information) */

let selectedCar = "";
let selectedPrice = "";
let selectedCarName = "";
let startDate = "";
let endDate = "";
/* Loads Cars From Flask Backend while fetching all available cars and adding them into dropdown menu */
async function loadCars() {
    const response = await fetch("/cars");
    const cars = await response.json();

    const select = document.getElementById("car");

    /* Reset dropdown */
    select.innerHTML = '<option value="">Select Car</option>';
    
    /* Create option for each car */

    cars.forEach(car => {
        const option = document.createElement("option");

        option.value = `${car.id}|${car.price_per_day}|${car.brand} ${car.model}`;
        option.textContent = `${car.brand} ${car.model} — $${car.price_per_day}/day`;

        select.appendChild(option);
    });
}
/*  Read Car Name From URL
   Example: booking?car=BMW */

const params = new URLSearchParams(window.location.search);
const carFromURL = params.get("car");

/* 
   Page Loads
   - Load car list
   - Set minimum booking date to today
   - Auto select car from URL*/
window.addEventListener("DOMContentLoaded", async () => {
    await loadCars();

    /* Prevents user from choosing past dates */
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("start").min = today;
    document.getElementById("end").min = today;

    /* If car passed through URL */

    if (carFromURL) {
    const select = document.getElementById("car");

    for (let option of select.options) {
        if (option.textContent.toLowerCase().includes(carFromURL.toLowerCase())) {
            select.value = option.value;
            /* Trigger dropdown change */
            select.dispatchEvent(new Event("change"));
            break;
        }
    }

    /* If no matching car found */
    if (!selectedCar) {
        if (select.options.length > 1) {
            select.selectedIndex = 1;
            select.dispatchEvent(new Event("change"));
        }
    }
    

    /* Skip first page */
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
}
});

/* Car Selection Change/  Updates car name + daily price*/

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

    /* Show selected car */
    document.getElementById("priceDisplay").innerText =
         `${selectedCarName} — $${selectedPrice}/day`;

 
    document.getElementById("carName").innerText = selectedCarName;
    document.getElementById("carPrice").innerText = `$${selectedPrice}/day`;
});

/* Step 1 -> Step 2 ,User chooses vehicle
 */

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

/* Step 2 -> Step 3 , Date validation + total cost */

document.getElementById("toStep3").addEventListener("click", () => {
    startDate = document.getElementById("start").value;
    endDate = document.getElementById("end").value;
    /* Check if dates chosen */
    if (!startDate || !endDate) {
        alert("Select dates");
        return;
    }

    /* End date must be after start */

    if (new Date(endDate) <= new Date(startDate)) {
        alert("End date must be after start date");
        return;
    }
/* Calculate rental days */
    const days = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    /* Calculate total cost */
    const total = days * selectedPrice;

    document.getElementById("step2").style.display = "none";
    document.getElementById("step3").style.display = "block";
    
    /* Booking summary */
    document.getElementById("summary").innerText =
         `${selectedCarName} | $${selectedPrice}/day | ${startDate} → ${endDate} | Total: $${total}`;
});

/* Final Payment Button
   - Validate payment fields
   - Check logged in user
   - Save booking to database*/

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
 /* Recalculate final total */
    const days = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    const total = days * selectedPrice;

    /* Check logged in user */
    const userRes = await fetch("/get_user");
    const userData = await userRes.json();

    if (!userData.user_id) {
    alert("You are not logged in");
    window.location.href = "/login";
    return;
    
}

/* Create booking object */
    const bookingData = {
        user_id: userData.user_id,
        car_id: selectedCar,
        start_date: startDate,
        end_date: endDate,
        total_price: total
    };


/* Send booking to Flask */
    const response = await fetch("/create_booking", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
    });

    const result = await response.json();

/* Show confirmation */
    alert(result.message);
/* Return home page */
    window.location.href = "/home";
});