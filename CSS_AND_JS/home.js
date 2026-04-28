/* This Javascript file was for the login page icon (icon of the man in the top right) to transform into the three
line icon however what i did not realize that later on I had to add the login  pages link to that page and hence it 
stopped the animation from working even though it is still there in the code. Thank you */

let menu = document.querySelector('.menu-icon');

menu.onclick = () => {
    menu.classList.toggle("move");
};