let selectedCar = ""
let selectedPrice = ""
let startDate = "";
let endDate = "";

const today = new Date().toISOString().split("T")[0];
document.getElementById("start").min = today;
document.getElementById("end").min = today;

document.getElementById("car").addEventListener("change", function (){
    const value = this.value;

    if (!value) {
        document.getElementById("priceDisplay").innerText = "";
        return;
    }

    const [car, price] = value.split("|");

    selectedCar = car;
    selectedPrice = price;

    document.getElementById("priceDisplay").innerText =
        `${car} — $${price}/day`; 
})

document.getElementById("toStep2").addEventListener("click", () => {
    if (!document.getElementById("car").value) {
        alert("Select a car");
        return;
    }

    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";

    document.getElementById("carName").innerText = selectedCar;
    document.getElementById("carPrice").innerText = `$${selectedPrice}/day`;
})



document.getElementById("toStep3").addEventListener("click",() => {
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
    const total = days * parseInt(selectedPrice);

    document.getElementById("step2").style.display = "none";
    document.getElementById("step3").style.display = "block";

    document.getElementById("summary").innerText = 
        `${selectedCar} | $${selectedPrice}/day | ${startDate} → ${endDate} | Total: $${total}`;





})


document.getElementById("payBtn").addEventListener("click", () => {
    alert("Payment Succesful and Booking Confirmed");
})