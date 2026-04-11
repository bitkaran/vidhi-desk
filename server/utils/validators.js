// utils/validators.js

// ✅ Phone validation (India specific - 10 digits)
exports.isValidPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone);
};

// ✅ Email validation
exports.isValidEmail = (email) => {
  if (!email) return true; // optional field hai
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ✅ Required field checker
exports.isRequired = (value) => {
  return value && value.toString().trim() !== "";
};
