let selectedCar = ""
let selectedPrice = ""
let startDate = "";
let endDate = "";

document.getElementById("car").addEventListener("change", function (){
    const value = this.value;

    if (!value) {
        document.getElementById("priceDisplay").innerText = "";
        return;
    }

    const [car, price] = value.split("I");

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