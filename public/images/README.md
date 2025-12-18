# Image Directory Structure

This directory stores static images served by nginx with aggressive caching.

## Structure

```
public/images/
├── heroes/    # Hero portraits and assets
├── ranks/     # Rank badge images
└── icons/     # Player icons and UI assets
```

## Usage

### In Your App

Images in this directory are accessible at `/images/*`:

```tsx
// Example: Hero image
<img src="/images/heroes/spiderman.png" alt="Spider-Man" loading="lazy" />

// Example: Rank badge
<img src="/images/ranks/bronze-3.png" alt="Bronze III" loading="lazy" />

// Example: Player icon
<img src="/images/icons/player-avatar.png" alt="Player" loading="lazy" />
```

### Lazy Loading

All images automatically use `loading="lazy"` attribute, which defers loading until they're near the viewport. This is native browser lazy loading and requires no JavaScript.

### Nginx Configuration

Images served from this directory have:
- 7-day cache expiration
- `Cache-Control: public, immutable` header
- Access logging disabled for performance
- Direct nginx serving (bypasses Next.js)

### Adding Images

1. Place images in the appropriate subdirectory
2. Reference them with `/images/<subfolder>/<filename>`
3. Rebuild the Docker image to include new images

### Performance

- Nginx serves these files directly from disk (fast)
- Browsers cache images for 7 days
- Lazy loading prevents unnecessary network requests
- Images outside the viewport aren't downloaded until needed
