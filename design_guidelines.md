# Design Guidelines: Telegram E-Commerce Web App

## Design Approach

**Reference-Based Approach**: Drawing inspiration from modern mobile e-commerce leaders (Shopify mobile, Etsy app, Telegram-native design patterns) combined with Material Design principles for the admin panel. The design prioritizes mobile-first experience optimized for Telegram's Web App environment with native feel and gestures.

**Core Principles**: Clean product presentation, effortless navigation, instant feedback, and Telegram-native integration.

## Typography System

**Font Family**: System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`) for native Telegram feel and optimal performance

**Hierarchy**:
- Hero/Product Titles: text-2xl to text-3xl, font-semibold
- Section Headers: text-xl, font-semibold
- Product Names: text-lg, font-medium
- Body Text: text-base, font-normal
- Captions/Meta: text-sm, font-normal
- Micro-copy: text-xs, font-normal

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 3, 4, 6, 8, 12** (e.g., p-4, gap-3, mb-6, py-8)

**Container Strategy**:
- Mobile-first: Full-width with px-4 horizontal padding
- Product grids: 2-column on mobile (grid-cols-2), expand if needed
- Admin tables: Horizontal scroll on mobile, full table on desktop
- Max content width: max-w-7xl for desktop admin panel

## Component Library

### Customer-Facing Components

**Navigation Header**:
- Sticky top bar with back button (when needed), page title (center), cart icon with badge (right)
- Height: h-14, shadow-sm for subtle depth
- Safe area padding for iOS notch compatibility

**Product Catalog Grid**:
- 2-column grid with gap-3
- Product cards: Rounded corners (rounded-lg), subtle shadow
- Image: aspect-square, object-cover
- Product info: p-3 with name, price stacked vertically
- Quick add-to-cart button on card (bottom-right overlay with backdrop-blur)

**Product Detail Page**:
- Large hero image carousel: Full-width, aspect-[4/3], swipeable
- Image indicators: Dots below image (gap-2)
- Product info section: p-4 with name (text-2xl), price (text-xl), description
- Quantity selector: Horizontal layout with - / number / + buttons
- Related products: Horizontal scroll (overflow-x-auto) with gap-3
- Reviews section: Card-based layout with avatar, name, rating stars, comment

**Shopping Cart**:
- List layout with product thumbnail (left), details (center), quantity controls and price (right)
- Each item: p-4 border-b with gap-3 flex layout
- Sticky bottom bar: Total price + Checkout button (w-full, h-12)

**Checkout Form**:
- Single column form with generous spacing (space-y-4)
- Input fields: h-12, rounded-lg, px-4
- Delivery method: Radio cards (p-4, rounded-lg, border-2 when selected)
- Payment method: Same radio card pattern

### Admin Panel Components

**Dashboard Layout**:
- Sidebar navigation (hidden on mobile, drawer pattern)
- Top bar with menu toggle, page title, admin avatar
- Main content area: p-6 on desktop, p-4 on mobile

**Statistics Cards**:
- 4-column grid on desktop (grid-cols-4), 2-column on mobile
- Card: p-6, rounded-xl, with icon, value (text-3xl), label (text-sm)
- Stat change indicator: Small text with up/down arrow

**Product Management Table**:
- Responsive table with alternating row backgrounds
- Compact row height: py-3
- Actions column: Icon buttons with gap-2
- Mobile: Stack as cards with key info visible

**Order Management**:
- Card-based list view
- Each order card: p-4, rounded-lg, space-y-2
- Status badges: px-3, py-1, rounded-full, text-xs uppercase
- Expandable detail view for order items

**Product Form**:
- Two-column layout on desktop, single column on mobile
- Image upload: Large dropzone (aspect-square, rounded-lg, border-dashed)
- Image gallery: Grid of uploaded images with remove button overlay
- Category/status toggles: Switch components (h-6, w-11)

**Broadcast Message Composer**:
- Full-width textarea: min-h-32, rounded-lg
- Preview panel showing message as users will see it
- Send button: Prominent, w-full on mobile

## Interaction Patterns

**Telegram Native Integration**:
- Use Telegram's color scheme variables where available
- Haptic feedback on button taps and successful actions
- Native back button handling
- Telegram-style bottom sheets for selections

**Product Interactions**:
- Tap product card → Navigate to detail page
- Swipe image gallery (touch-friendly)
- Increment/decrement with haptic feedback
- Add to cart: Brief success animation + cart badge update

**Loading States**:
- Skeleton screens for product grids (shimmer effect)
- Spinner for form submissions
- Optimistic UI updates for cart changes

**Animations**: Minimal and purposeful
- Page transitions: Slide-in from right (Telegram-native feel)
- Cart badge: Scale pulse on item add
- Success checkmarks: Brief scale + fade
- NO scroll-triggered or decorative animations

## Images Strategy

**Hero Images**: NOT applicable for this app (mobile e-commerce in Telegram)

**Product Images**:
- Required for all product cards and detail pages
- Aspect ratio: Square (1:1) for consistency
- Multiple images per product in carousel format
- Placeholder: Simple icon + "No image" text for missing images

**Usage Locations**:
- Product catalog: Thumbnail images in grid
- Product detail: Large carousel images at top
- Shopping cart: Small thumbnails (60x60)
- Admin panel: Medium thumbnails in product list
- Order details: Small product thumbnails

## Critical Mobile Considerations

- Touch targets: Minimum h-12 for all interactive elements
- Bottom navigation/actions: Sticky positioning with safe-area-inset-bottom
- Horizontal scrolling: Use for related products, categories (NOT vertical content)
- Form inputs: Large enough for touch, proper input types for mobile keyboards
- No hover states: All interactions must work on touch-only devices

## Accessibility

- Maintain WCAG contrast ratios (designer will choose accessible color combinations)
- Clear focus indicators for keyboard navigation (admin panel)
- Semantic HTML structure throughout
- ARIA labels for icon-only buttons
- Form labels and error messages clearly associated with inputs

This design creates a polished, native-feeling e-commerce experience within Telegram while providing powerful admin tools for store management.