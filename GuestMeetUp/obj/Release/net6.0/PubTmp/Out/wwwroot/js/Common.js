function validateOnlyNoInput(input) {
    // Replace any characters that are not (0-9) with an empty string
    input.value = input.value.replace(/[^0-9]+/g, '');
}

function validateMobileNumber(input) {
    // Remove non-numeric characters from input value
    input.value = input.value.replace(/[^0-9]+/g, '');

    var value = input.value.trim();
    var errorMessage = "";

    if (value.length !== 10) {
        errorMessage = "Mobile number must be exactly 10 digits.";
    }

    document.getElementById("mobileNumberError").innerText = errorMessage;
}



