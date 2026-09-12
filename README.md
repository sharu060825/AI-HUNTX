# Shark Event — Pitch. Compete. Conquer.

Event landing page with registration form (EmailJS-powered confirmation + WhatsApp community link).

## Structure

```
shark-event-repo/
├── index.html              # Main page (markup only, no inline styles/scripts)
├── assets/
│   ├── css/
│   │   └── style.css       # All page styles
│   ├── js/
│   │   └── main.js         # Page logic, form handling, EmailJS integration
│   └── images/
│       ├── sathyabama-institute-logo.jpg
│       ├── robotics-society-logo.jpg
│       ├── coord-alvin-sudhan.jpg
│       ├── coord-jenna-therese.jpg
│       ├── coord-devadharshan.jpg
│       ├── coord-akshaya-rk.jpg
│       ├── coord-niveditha-s.jpg
│       └── coord-haripriya-kp.jpg
└── README.md
```

## Notes

- All images were previously embedded as base64 inside the HTML; they've been extracted
  into `assets/images/` and are now referenced via relative paths for a much smaller,
  more maintainable `index.html`.
- EmailJS config (public key, service ID, template IDs) lives near the top of
  `assets/js/main.js` under the `CONFIG.emailjs` object.
- The registration form's confirmation email includes a `whatsapp_link` variable —
  add `{{whatsapp_link}}` in your EmailJS confirmation template to surface the group
  invite link in the email itself. It's already shown as a button on the in-page
  success screen.
- To run locally, just open `index.html` in a browser, or serve the folder with any
  static file server (e.g. `npx serve .`).
