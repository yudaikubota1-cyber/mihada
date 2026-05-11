import React from 'react';

export function shade(hex, pct) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * pct / 100)));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * pct / 100)));
  const b = Math.max(0, Math.min(255, (num & 0xff) + Math.round(255 * pct / 100)));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function SkinrLogo({ size = 16, color = '#111' }) {
  return (
    <span style={{
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 300,
      letterSpacing: '0.36em',
      fontSize: size,
      color,
      paddingLeft: '0.36em',
    }}>miHada</span>
  );
}

export function SkinrEyebrow({ children, color = '#7A7A7A', size = 10 }) {
  return (
    <span style={{
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: size,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color,
      fontWeight: 500,
    }}>{children}</span>
  );
}

// ProductImage — used in detail pages (xl/lg size)
export function ProductImage({ product, size = 'md', label = true }) {
  const [imgError, setImgError] = React.useState(false);
  const dims = {
    sm: { w: 64,    h: 64,  fs: 9 },
    md: { w: 140,   h: 168, fs: 10 },
    lg: { w: '100%', h: 280, fs: 11 },
    xl: { w: '100%', h: 360, fs: 12 },
  }[size];

  if (product.image && !imgError) {
    return (
      <div style={{
        width: dims.w, height: dims.h,
        position: 'relative', overflow: 'hidden',
        borderRadius: size === 'xl' || size === 'lg' ? 0 : 8,
        flexShrink: 0,
        background: '#F5F5F5',
      }}>
        <img
          src={product.image}
          alt={product.nameJa || product.brand}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {label && (
          <div style={{
            position: 'absolute', left: 10, bottom: 10,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 8,
            letterSpacing: '0.16em', color: '#fff',
            background: 'rgba(0,0,0,0.38)', padding: '3px 7px', borderRadius: 3,
            backdropFilter: 'blur(4px)',
          }}>{(product.categoryLabel || '').toUpperCase()}</div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      width: dims.w, height: dims.h,
      background: product.swatch,
      position: 'relative',
      overflow: 'hidden',
      borderRadius: size === 'xl' || size === 'lg' ? 0 : 8,
      flexShrink: 0,
      backgroundImage: `repeating-linear-gradient(135deg, ${product.swatch} 0px, ${product.swatch} 14px, ${shade(product.swatch, -3)} 14px, ${shade(product.swatch, -3)} 15px)`,
    }}>
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '38%', height: '62%',
        background: shade(product.swatch, -8),
        borderRadius: 2,
      }} />
      <div style={{
        position: 'absolute',
        left: '50%', top: '14%',
        transform: 'translateX(-50%)',
        width: '14%', height: '12%',
        background: shade(product.swatch, -14),
        borderRadius: 1,
      }} />
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: dims.fs,
        letterSpacing: '0.16em',
        color: product.accent,
        opacity: 0.8,
      }}>{product.brand.split(' ')[0]}</div>
      {label && (
        <div style={{
          position: 'absolute',
          left: 8, bottom: 8,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 8,
          letterSpacing: '0.14em',
          color: product.accent,
          opacity: 0.55,
        }}>{(product.categoryLabel || '').toUpperCase()}</div>
      )}
    </div>
  );
}

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.25 }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'search':
      return (<svg {...props}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>);
    case 'send':
      return (<svg {...props}><path d="M4 12l16-8-6 16-2-7-8-1z"/></svg>);
    case 'arrowRight':
      return (<svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
    case 'arrowLeft':
      return (<svg {...props}><path d="M19 12H5M11 18l-6-6 6-6"/></svg>);
    case 'close':
      return (<svg {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>);
    case 'sun':
      return (<svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2"/></svg>);
    case 'moon':
      return (<svg {...props}><path d="M20 14.5A8 8 0 1 1 9.5 4 6 6 0 0 0 20 14.5z"/></svg>);
    case 'check':
      return (<svg {...props}><path d="M5 12l5 5L20 7"/></svg>);
    case 'warn':
      return (<svg {...props}><path d="M12 4l9 16H3l9-16z"/><path d="M12 10v5M12 18v.01"/></svg>);
    case 'plus':
      return (<svg {...props}><path d="M12 5v14M5 12h14"/></svg>);
    case 'star':
      return (<svg {...props}><path d="M12 3l2.6 5.6 6.4.6-4.8 4.4 1.4 6.4L12 17l-5.6 3 1.4-6.4L3 9.2l6.4-.6L12 3z"/></svg>);
    case 'sparkle':
      return (<svg {...props}><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z"/></svg>);
    case 'flask':
      return (<svg {...props}><path d="M9 3h6M9 3v8l-4 9h14l-4-9V3"/><path d="M6.8 15h10.4"/></svg>);
    case 'leaf':
      return (<svg {...props}><path d="M17 8C8 10 5.9 16.17 3.82 19.82A1 1 0 0 0 5 21C9 21 16 14 18 10"/><path d="M17 8C17 8 17 14 13 19"/></svg>);
    default: return null;
  }
}

export function Chip({ children, active = false, onClick, size = 'md' }) {
  const [pressed, setPressed] = React.useState(false);
  const pad = size === 'sm' ? '5px 11px' : '8px 14px';
  const fs = size === 'sm' ? 11 : 12;
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        padding: pad,
        borderRadius: 999,
        border: '1px solid ' + (active ? '#111' : pressed ? 'var(--border-strong)' : 'var(--border)'),
        background: active ? '#111' : pressed ? 'var(--bg-warm)' : 'var(--bg)',
        color: active ? '#fff' : '#111',
        fontSize: fs,
        fontFamily: 'inherit',
        fontWeight: 500,
        letterSpacing: '0.02em',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transform: pressed && !active ? 'scale(0.95)' : 'scale(1)',
        transition: 'all 0.1s ease',
        flexShrink: 0,
      }}
    >{children}</button>
  );
}

export function Divider({ label }) {
  if (!label) return <div style={{ height: 1, background: 'var(--border)' }} />;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <SkinrEyebrow size={9}>{label}</SkinrEyebrow>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

export function PrimaryButton({ children, onClick, full = false, icon = null }) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        width: full ? '100%' : 'auto',
        padding: '16px 22px',
        borderRadius: 6,
        border: 'none',
        background: pressed ? '#000' : '#111',
        color: '#fff',
        fontFamily: 'inherit',
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: '0.04em',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.1s ease',
        boxShadow: pressed ? 'none' : '0 4px 16px rgba(50,30,20,0.22)',
      }}
    >
      {children}
      {icon}
    </button>
  );
}

// ─── ProductCard — redesigned, image-forward ───────────────────────────────
export function ProductCard({ product, onClick }) {
  const [pressed, setPressed] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const showImg = product.image && !imgError;

  return (
    <div
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        cursor: 'pointer',
        transform: pressed ? 'scale(0.955)' : 'scale(1)',
        transition: 'transform 0.16s ease',
      }}
    >
      {/* Full-width image — 4:5 aspect ratio */}
      <div style={{
        position: 'relative',
        paddingTop: '125%',
        borderRadius: 12,
        overflow: 'hidden',
        background: showImg ? 'var(--bg)' : (product.swatch || '#EDE5DA'),
        boxShadow: pressed
          ? '0 1px 6px rgba(80,60,40,0.07)'
          : '0 4px 20px rgba(80,60,40,0.09)',
        transition: 'box-shadow 0.16s ease',
        marginBottom: 10,
      }}>
        {showImg ? (
          <img
            src={product.image}
            alt={product.nameJa}
            onError={() => setImgError(true)}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'contain',
              padding: '5%',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(150deg, ${product.swatch || '#EDE5DA'} 0%, ${shade(product.swatch || '#EDE5DA', -6)} 100%)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 10,
          }}>
            <span style={{
              fontSize: 44, fontWeight: 100, lineHeight: 1,
              color: product.accent || '#555',
              opacity: 0.18,
              letterSpacing: '-0.04em',
              userSelect: 'none',
            }}>
              {(product.brand || '?').charAt(0)}
            </span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 7, letterSpacing: '0.22em',
              color: product.accent || '#555', opacity: 0.35,
              textTransform: 'uppercase',
            }}>
              {(product.brand || '').split(' ')[0]}
            </span>
          </div>
        )}

        {/* Category badge — frosted glass */}
        {product.categoryLabel && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '3px 8px', borderRadius: 6,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9, letterSpacing: '0.14em',
            color: '#333', fontWeight: 500,
          }}>
            {product.categoryLabel}
          </div>
        )}

        {/* Rating badge — top right */}
        {product.review?.score && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '4px 7px', borderRadius: 6,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 9, color: '#E8A020' }}>★</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#333', letterSpacing: '0.04em', fontWeight: 600 }}>
                {product.review.score}
              </span>
            </div>
            {product.review.count && product.review.count !== '—' && (
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, color: '#AAA', letterSpacing: '0.04em' }}>
                {product.review.count}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product info */}
      <div>
        {/* Brand */}
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9, letterSpacing: '0.12em',
          color: '#C0B8B0', marginBottom: 4,
          textTransform: 'uppercase',
        }}>
          {product.brand}
        </div>

        {/* Product name */}
        <div style={{
          fontSize: 12, fontWeight: 500,
          lineHeight: 1.5, color: '#1A1814',
          marginBottom: 7,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '36px',
        }}>
          {product.nameJa}
        </div>

        {/* Key ingredients — first 2 */}
        {Array.isArray(product.ingredients) && product.ingredients.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            {product.ingredients.slice(0, 2).map(ing => (
              <span key={ing} style={{
                fontSize: 9, padding: '2px 6px',
                background: 'var(--bg-soft)',
                borderRadius: 3,
                color: '#888',
                fontWeight: 500,
                letterSpacing: '0.01em',
                lineHeight: 1.6,
              }}>{ing}</span>
            ))}
          </div>
        )}

        {/* Price + 購入ボタン */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <div style={{
            fontSize: 13, fontWeight: 700,
            letterSpacing: '-0.02em', color: '#1A1814',
          }}>
            {product.price || '—'}
          </div>
          {product.url ? (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                display: 'flex', alignItems: 'center', gap: 3,
                padding: '5px 10px', borderRadius: 99,
                background: '#1DAB6A', color: '#fff',
                fontSize: 10, fontWeight: 600,
                textDecoration: 'none', letterSpacing: '0.03em',
                whiteSpace: 'nowrap', flexShrink: 0,
                boxShadow: '0 2px 8px rgba(29,171,106,0.28)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              楽天 →
            </a>
          ) : (
            <span style={{ fontSize: 9, color: '#CCC', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
              準備中
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
