let passwordVisible = false; // to check visibility of password
let confirmPasswordVisible = false; // to check visibility of confirm password
let topSearchFormVisible = false; // to check top bar search box visibility
let sideBarVisibility = false; // to check visibility of sidebar



/* show & hide password in input box */
function showOrHidePassword() {
    const passwordInputBox = document.querySelector('.password-inp');

    if (passwordVisible) {
        passwordInputBox.setAttribute('type', 'password');
        passwordVisible = false;
    } else {
        passwordInputBox.setAttribute('type', 'text');
        passwordVisible = true;
    }
}


/* show & hide search box in nav bar */
function showOrHideTopBarSearchForm() {
    const topBarSearchForm = document.querySelector('.topbar-form');
    const fluidContainer = document.querySelector('.container-fluid') || document.querySelector('.container');

    if (topSearchFormVisible) {
        topBarSearchForm.style.display = 'none';
        fluidContainer.style.marginTop = '5em';
        topSearchFormVisible = false;
    } else {
        topBarSearchForm.style.display = 'flex';
        fluidContainer.style.marginTop = '7.5em';
        topSearchFormVisible = true;
    }
}


/* show and hide side nav bar */
function showOrHideSideBar() {
    const sideBar = document.querySelector('.sidebar');

    if (sideBarVisibility) {
        sideBar.style.left = '-20em';
        sideBarVisibility = false;
    } else {
        sideBar.style.left = '0em';
        sideBarVisibility = true;
    }
}


/* add to cart function */
function addToCart(user, productId, productName, price) {
    if (user === '') {
        alert('Please login for adding product to cart')
        return
    }

    addCartBtn = document.querySelector('.add-cart-btn'); //to hide after adding
    gotoCart = document.querySelector('.goto-cart');

    addCartBtn.disabled = true;
    addCartBtn.style.cursor = 'wait'

    $.ajax({
        url: '/addToCart/'+productId + '/'+ productName + '/' + price,
        method: 'get',
        success: (response) => {
            if(response.status === 'Error') {
                alert('Error while adding to cart')
                return
            }
        }
    })

    setTimeout(function showCartButtonAnnimation() {
        addCartBtn.style.display = 'none';
        gotoCart.style.display = 'flex';
    }, 1500);
}



/* to show confirm popup of edit user details*/
function showEditPopUp() {
    let PopUpCol = document.querySelector('.popup-col')
    PopUpCol.style.display = 'flex'
}


/* to close confirm popup of edit user details*/
function closePopUp() {
    let PopUpCol = document.querySelector('.popup-col')
    PopUpCol.style.display = 'none'
}


function removeCart(productId) {
    $.ajax({
        url: '/deleteCartItem/'+ productId,
        method: 'get',
        success: (response) => {
            if(response.status === 'Error') {
                alert('Error while deleting from cart')
            }
        }
    })
}

/* Check searchbox empty or not */
function checkSearch() {
    let searchBoxContent = document.querySelector('#search-input-box').value
    if(searchBoxContent == '') {
        alert('Searching all products')
    }  

}
