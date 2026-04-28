/* Select main form container */
const wrapper =  document.querySelector(".wrapper");

/* Select switch links inside forms */
const loginLink = document.querySelector(".login-link");
const registerLink = document.querySelector(".register-link");
/* =====================================
   Switch's to Register Form
   Adds "active" class to slide register
===================================== */
registerLink.addEventListener("click", (e) => {
    e.preventDefault();
    wrapper.classList.add("active");
});

/* =====================================
   Switch Back to Login Form
   Removes "active" class
===================================== */

loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    wrapper.classList.remove("active");
});
/* Select header login button and close icon */
const btnPopup = document.querySelector(".btnLogin-popup");
const iconClose = document.querySelector(".icon-close");

/* =====================================
   Open Login Popup
   Shows wrapper using scale animation
===================================== */
btnPopup.addEventListener("click", () => {
    wrapper.classList.add("active-popup");
});
/* =====================================
   Close Login Popup
   Hides wrapper
===================================== */

iconClose.addEventListener("click", () => { 
    wrapper.classList.remove("active-popup");
});

