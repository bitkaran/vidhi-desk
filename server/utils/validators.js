// utils/validators.js

// ✅ Phone validation (India specific - 10 digits)
exports.isValidPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone); 
  // starts with 6-9 and total 10 digits
};

// ✅ Required field checker
exports.isRequired = (value) => {
  return value && value.toString().trim() !== "";
};