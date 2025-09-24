# Design Guidelines: Modern Telegram-Style Messenger with AI Bot

## Design Approach
**Reference-Based Approach**: Inspired by Telegram's clean, functional design with modern enhancements for superior messaging experience and seamless AI bot integration.

**Key Design Principles:**
- Clean, minimal interface prioritizing readability
- Smooth micro-interactions for enhanced user experience
- Distinctive AI bot visual treatment
- Professional appearance suitable for both personal and business use

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: 213 100% 52% (Telegram blue)
- Background: 0 0% 100% (pure white)
- Surface: 0 0% 98% (subtle gray)
- Border: 0 0% 90% (light border)
- Text Primary: 220 9% 20% (dark blue-gray)
- Text Secondary: 220 9% 46% (medium gray)

**Dark Mode:**
- Primary: 213 100% 52% (consistent blue)
- Background: 220 13% 8% (deep dark)
- Surface: 220 13% 12% (elevated dark)
- Border: 220 13% 18% (subtle border)
- Text Primary: 220 9% 95% (light text)
- Text Secondary: 220 9% 70% (muted text)

**Accent Colors:**
- Success: 142 76% 36% (online status green)
- AI Bot: 271 91% 65% (distinctive purple for AI)
- Warning: 38 92% 50% (notifications orange)

### B. Typography
**Font Family:** Inter (Google Fonts CDN)
- Message text: 400 weight, 15px
- Usernames: 500 weight, 14px
- Timestamps: 400 weight, 12px
- Headers: 600 weight, 20px
- UI labels: 500 weight, 13px

### C. Layout System
**Spacing Units:** Tailwind spacing: 1, 2, 3, 4, 6, 8
- Message padding: p-3
- List items: p-4
- Component spacing: gap-4, gap-6
- Page sections: p-6, p-8

### D. Component Library

**Layout Structure:**
- Three-column desktop layout: sidebar (w-80) | chat list (w-96) | conversation
- Mobile: collapsible single-column with slide transitions
- Fixed header and message input areas

**Chat Components:**
- Message bubbles: rounded-2xl with subtle shadows
- Sent messages: right-aligned, primary background, white text
- Received messages: left-aligned, surface background
- AI messages: purple accent with bot indicator icon
- Message clusters: grouped by sender with reduced spacing
- Typing indicators: animated dots in chat area

**Navigation:**
- Sidebar with user profile, settings, and theme toggle
- Chat list with search functionality and unread indicators
- Breadcrumb navigation for mobile view

**Forms & Inputs:**
- Message composer: rounded input with emoji picker and attachment buttons
- Search bars: rounded with subtle borders
- Settings forms: clean layouts with toggle switches
- Authentication: centered modal approach

**Interactive Elements:**
- Hover states with subtle background changes
- Focus rings with primary color
- Button variants: filled (primary), outline (secondary), ghost (minimal)
- Context menus for message actions

### E. Animations
**Smooth Micro-Interactions:**
- Message appearance: slide-up with fade (200ms ease-out)
- Chat switching: slide transition (300ms ease-in-out)
- Theme toggle: smooth color transitions (250ms)
- Typing indicators: gentle pulse animation
- Hover states: 150ms ease transitions
- Modal/drawer animations: slide and fade combinations

**Performance Considerations:**
- Hardware-accelerated transforms
- Reduced motion support via prefers-reduced-motion
- Efficient CSS transitions over JavaScript animations

## Special Features

**AI Bot Integration:**
- Purple accent treatment for all AI interactions
- Distinctive bot avatar with gradient background
- AI response streaming with typewriter effect
- Suggested prompts with pill-style buttons
- Clear "AI" labels for transparency

**Modern Enhancements:**
- Subtle shadows and elevation layers
- Smooth scrolling with momentum
- Real-time message status indicators
- Advanced search with filters
- Rich message formatting support

**Responsive Design:**
- Desktop-first with mobile optimization
- Touch-friendly target sizes (44px minimum)
- Swipe gestures for mobile navigation
- Adaptive typography scaling

## Images
**Profile System:**
- Circular avatars (rounded-full) for all users
- Gradient placeholder backgrounds with initials
- AI bot: custom icon with purple gradient background
- No large hero images - focus remains on messaging interface
- File attachments: thumbnail previews with overlay controls