# Code Red SMS

Code Red SMS is a React Native (TypeScript) mobile app for emergency mass messaging. It allows organizations to quickly send SMS alerts to groups, manage contacts, create message templates, and track delivery reports. The app includes a credits system with integrated Stripe payments.

Figma design: https://www.figma.com/design/RtxQ1zUf4Bq66XUO7Y9A7F/Code-Red-SMS?node-id=7-191&p=f&t=gzvYyxXQkeE8M9O9-0

---

## Features
- Send SMS to multiple groups instantly.
- Manage contacts: import from phone or CSV.
- Create and edit reusable templates.
- View logs with delivery breakdown.
- Purchase message credits via Stripe.
- Secure account settings and password updates.

---

## Tech Stack
- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **Navigation:** React Navigation
- **Payments:** Stripe
- **UI:** Custom components with consistent spacing/typography system.

---

## Setup
1. **Install dependencies**
   ```bash
   npm install

2. **Run the app**
    npx expo start

Currently designing the backend for the react native app - 

1. Added neon database with Prisma
2. Added Nest.js framework
3. Added auth using JWT
4. Contacts and templates now linked to the backend neon DB

