import {
  generateBookingEmailTemplate,
  generateCancellationEmailTemplate,
  generateLoginOtpEmailTemplate,
  generateWelcomeEmailTemplate,
} from '../utils/emailTemplates.js';

console.log('--- Testing Email Template Generators ---');

const bookingHtml = generateBookingEmailTemplate({
  restaurantName: 'Le Petit Gourmet',
  date: '2026-08-15',
  time: '19:30',
  guests: 2,
});

const cancellationHtml = generateCancellationEmailTemplate({
  restaurantName: 'Le Petit Gourmet',
  date: '2026-08-15',
  time: '19:30',
  guests: 2,
});

const otpHtml = generateLoginOtpEmailTemplate({
  otpCode: '849201',
});

const welcomeHtml = generateWelcomeEmailTemplate({
  fullName: 'Aaryan Patel',
});

function assertContains(html, str, name) {
  if (!html.includes(str)) {
    console.error(`❌ [FAIL] ${name} missing expected string: "${str}"`);
    process.exit(1);
  } else {
    console.log(`✅ [PASS] ${name} contains "${str}"`);
  }
}

// Verification checks
assertContains(bookingHtml, 'Book<span style="color: #d4af37;">My</span>Table', 'Booking Email Header');
assertContains(bookingHtml, 'Reservation Confirmed', 'Booking Email Badge');
assertContains(bookingHtml, 'Le Petit Gourmet', 'Booking Email Content');
assertContains(bookingHtml, '© 2026 BookMyTable', 'Booking Email Footer');

assertContains(cancellationHtml, 'Reservation Cancelled', 'Cancellation Email Badge');
assertContains(cancellationHtml, 'CANCELLED', 'Cancellation Email Status');

assertContains(otpHtml, '849201', 'OTP Code');
assertContains(otpHtml, 'Security Verification', 'OTP Email Badge');

assertContains(welcomeHtml, 'Welcome, Aaryan Patel! 🎉', 'Welcome Email Greeting');
assertContains(welcomeHtml, 'Browse Luxury Restaurants', 'Welcome Email CTA');

console.log('\n✨ All email templates rendered and verified successfully!');
