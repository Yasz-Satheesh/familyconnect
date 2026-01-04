document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const termsCheckbox = document.getElementById('terms');
    
    // Inputs
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const phone = document.getElementById('phone');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const address = document.getElementById('address');

    // Enable/Disable Submit Button based on Terms
    termsCheckbox.addEventListener('change', () => {
        submitBtn.disabled = !termsCheckbox.checked;
    });

    // Helper to show/hide error
    const showError = (input, show) => {
        const group = input.closest('.input-group');
        if (show) {
            group.classList.add('error');
        } else {
            group.classList.remove('error');
        }
    };

    // Real-time validation listeners
    const inputs = [firstName, lastName, phone, email, password, confirmPassword, address];
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            // Remove error when user starts typing (ux choice: don't validate immediately on type, only remove error)
            showError(input, false);
        });

        input.addEventListener('blur', () => {
            validateField(input);
        });
    });

    // Specific Validation Logic
    const validateField = (input) => {
        let valid = true;
        const id = input.id;
        const val = input.value.trim();

        if (id === 'firstName' || id === 'lastName' || id === 'address') {
            if (!val) valid = false;
        } 
        else if (id === 'phone') {
            // Simple 10 digit check
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(val)) valid = false;
        }
        else if (id === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(val)) valid = false;
        }
        else if (id === 'password') {
            if (val.length < 6) valid = false;
            // Trigger confirm password re-validation if password changes
            if (confirmPassword.value) validateField(confirmPassword);
        }
        else if (id === 'confirmPassword') {
            if (val !== password.value.trim()) valid = false;
        }

        if (!valid) {
            showError(input, true);
            return false;
        }
        return true;
    };

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let isFormValid = true;

        // Validate all fields
        inputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });

        if (!termsCheckbox.checked) {
            isFormValid = false;
        }

        if (isFormValid) {
            // Simulate success
            alert('Registration Successful!');
            form.reset();
            submitBtn.disabled = true;
            // Remove all error classes (reset might not remove them if logic differs)
            inputs.forEach(input => showError(input, false));
        } else {
            // Focus the first invalid field
            const firstError = document.querySelector('.input-group.error input, .input-group.error textarea');
            if (firstError) firstError.focus();
        }
    });
});
