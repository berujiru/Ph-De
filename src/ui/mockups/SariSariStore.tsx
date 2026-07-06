import type { ReactNode } from 'react';
import { theme } from '../theme';
import { useState } from 'react';
import {
  HeroCardIcon,
  HopeCoinIcon,
  PlacardIcon,
  RaisedFistIcon,
  RallyPermitIcon,
  VictoryIcon,
} from '../icons';
import { BackButton } from '../components/BackButton';
import { RewardReveal, type RevealReward } from '../components/RewardReveal';
import type { DropRarity } from '../../game/core/GameEvents';

interface SariSariStoreProps {
  onBack: () => void;
}

const MARKER_FONT = '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive';

const MOCK_HOPE = 1250;

// Catalog per docs/PROGRESSION.md: Hero Cards, Hero unlocks, Rally Permits,
// Bayanihan Acts, Cosmetics — all priced in Hope Points.
type CatalogCategory = 'Hero Cards' | 'Hero Unlocks' | 'Rally Permits' | 'Bayanihan Acts' | 'Cosmetics';

interface CatalogItem {
  id: string;
  category: CatalogCategory;
  title: string;
  description: string;
  cost: number;
  icon: ReactNode;
}

const CATALOG: CatalogItem[] = [
  {
    id: 'card_pack',
    category: 'Hero Cards',
    title: 'Hero Card Pack',
    description: '3 random Hero Cards to level up the roster.',
    cost: 300,
    icon: <HeroCardIcon size={30} />,
  },
  {
    id: 'eden_bundle',
    category: 'Hero Cards',
    title: 'Eden Card Bundle',
    description: 'Guaranteed 5 Eden Cards for the organizer herself.',
    cost: 500,
    icon: <HeroCardIcon size={30} />,
  },
  {
    id: 'unlock_electrician',
    category: 'Hero Unlocks',
    title: 'Recruit: Electrician',
    description: 'A lineman answers the call. Lightning chain attacks.',
    cost: 1500,
    icon: (
      <img
        src="/assets/heroes/hero-placeholder.svg"
        alt=""
        style={{ width: 34, height: 34, filter: 'brightness(0.4)' }}
      />
    ),
  },
  {
    id: 'unlock_delivery_rider',
    category: 'Hero Unlocks',
    title: 'Recruit: Delivery Rider',
    description: 'Parcels that always come back. Wind boomerang.',
    cost: 1500,
    icon: (
      <img
        src="/assets/heroes/hero-placeholder.svg"
        alt=""
        style={{ width: 34, height: 34, filter: 'brightness(0.4)' }}
      />
    ),
  },
  {
    id: 'permit_single',
    category: 'Rally Permits',
    title: 'Rally Permit',
    description: 'Energy for 1 campaign run. Papers in order!',
    cost: 100,
    icon: <RallyPermitIcon size={30} />,
  },
  {
    id: 'permit_bundle',
    category: 'Rally Permits',
    title: 'Permit Bundle ×5',
    description: 'A whole week of marches, pre-approved.',
    cost: 450,
    icon: <RallyPermitIcon size={30} />,
  },
  {
    id: 'act_baha',
    category: 'Bayanihan Acts',
    title: 'Act: Baha ng Tulong',
    description: 'Flood of aid — large Barrier heal ultimate.',
    cost: 800,
    icon: <RaisedFistIcon size={30} />,
  },
  {
    id: 'act_salu',
    category: 'Bayanihan Acts',
    title: 'Act: Salu-Salo',
    description: 'Community feast — gold windfall ultimate.',
    cost: 800,
    icon: <RaisedFistIcon size={30} />,
  },
  {
    id: 'cosmetic_sinulog',
    category: 'Cosmetics',
    title: 'Sinulog Map Skin',
    description: 'Festival re-dress for Act 1 streets. Pit Senyor!',
    cost: 600,
    icon: <VictoryIcon size={30} />,
  },
  {
    id: 'cosmetic_voices',
    category: 'Cosmetics',
    title: 'Voice-Line Pack',
    description: 'New skill barks and chants for the squad.',
    cost: 400,
    icon: <PlacardIcon size={30} />,
  },
];

/** Corrugated-iron awning with scalloped edge. */
function Awning() {
  return (
    <div aria-hidden="true" style={{ position: 'relative', zIndex: 6 }}>
      <div
        style={{
          height: 30,
          backgroundImage: `repeating-linear-gradient(90deg, ${theme.materials.tarpRed}, ${theme.materials.tarpRed} 42px, ${theme.materials.paper} 42px, ${theme.materials.paper} 84px)`,
          boxShadow: '0 6px 16px rgba(0,0,0,0.6), inset 0 -6px 10px rgba(0,0,0,0.35)',
        }}
      />
      <div
        style={{
          height: 14,
          backgroundImage: `radial-gradient(circle at 21px -2px, ${theme.materials.tarpRed} 20px, transparent 21px), radial-gradient(circle at 63px -2px, ${theme.materials.paper} 20px, transparent 21px)`,
          backgroundSize: '84px 14px',
          filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.4))',
        }}
      />
    </div>
  );
}

/** One item hanging off the storefront wire. */
function HangingGood({ item, index, affordable, onBuy }: { item: CatalogItem; index: number; affordable: boolean; onBuy: (item: CatalogItem) => void }) {
  const swing = (index % 2 === 0 ? 1 : -1) * (1 + (index % 3));
  const tagTilt = index % 2 === 0 ? -5 : 4;

  return (
    <div
      className="rally-sway"
      style={{
        width: 'min(158px, 43vw)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        transformOrigin: 'top center',
        transform: `rotate(${swing}deg)`,
        marginTop: 30,
      }}
    >
      {/* Clothespin clip on the wire */}
      <div
        aria-hidden="true"
        style={{
          width: 14,
          height: 34,
          backgroundColor: theme.materials.metal,
          border: `1px solid ${theme.materials.metalDark}`,
          borderRadius: 7,
          position: 'absolute',
          top: -34,
          zIndex: 2,
          boxShadow: 'inset -2px -2px 5px rgba(0,0,0,0.3)',
        }}
      />

      {/* Plastic-wrapped goods */}
      <div
        style={{
          backgroundColor: 'rgba(248, 250, 252, 0.96)',
          border: '2px solid #e2e8f0',
          borderRadius: 8,
          padding: '12px 10px',
          width: '100%',
          minHeight: 118,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 20px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.5)',
          zIndex: 3,
          opacity: affordable ? 1 : 0.75,
        }}
      >
        <div
          style={{
            marginBottom: 6,
            color: theme.materials.ink,
            filter: affordable ? 'none' : 'grayscale(60%)',
            display: 'flex',
          }}
        >
          {item.icon}
        </div>
        <div
          style={{
            fontSize: 8.5,
            letterSpacing: 1,
            fontWeight: 900,
            color: theme.materials.tarpRed,
            textTransform: 'uppercase',
            marginBottom: 3,
          }}
        >
          {item.category}
        </div>
        <h3
          style={{
            margin: '0 0 5px 0',
            fontSize: 12.5,
            color: theme.materials.ink,
            textAlign: 'center',
            fontWeight: 900,
            textTransform: 'uppercase',
            lineHeight: 1.1,
          }}
        >
          {item.title}
        </h3>
        <p style={{ margin: 0, fontSize: 10, color: '#475569', textAlign: 'center', lineHeight: 1.35 }}>
          {item.description}
        </p>
      </div>

      {/* Handwritten cardboard price tag = the buy button */}
      <button
        disabled={!affordable}
        onClick={() => affordable && onBuy(item)}
        aria-label={
          affordable
            ? `Buy ${item.title} for ${item.cost} Hope Points`
            : `${item.title} costs ${item.cost} Hope Points — not enough Hope`
        }
        style={{
          position: 'relative',
          marginTop: -14,
          alignSelf: 'flex-end',
          marginRight: -6,
          minHeight: 44,
          minWidth: 84,
          backgroundColor: theme.materials.cardboard,
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
          color: theme.materials.ink,
          border: `1px solid ${theme.materials.cardboardEdge}`,
          padding: '6px 12px',
          borderRadius: 2,
          fontWeight: 900,
          fontFamily: MARKER_FONT,
          fontSize: 15,
          cursor: affordable ? 'pointer' : 'not-allowed',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          boxShadow: '2px 4px 10px rgba(0,0,0,0.5)',
          transform: `rotate(${tagTilt}deg)`,
          zIndex: 10,
          transition: 'transform 0.1s',
          opacity: affordable ? 1 : 0.5,
        }}
        onMouseOver={(e) => {
          if (affordable) e.currentTarget.style.transform = `rotate(${tagTilt}deg) scale(1.08)`;
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = `rotate(${tagTilt}deg) scale(1)`;
        }}
        onMouseDown={(e) => {
          if (affordable) e.currentTarget.style.transform = `rotate(${tagTilt}deg) scale(0.95)`;
        }}
        onMouseUp={(e) => {
          if (affordable) e.currentTarget.style.transform = `rotate(${tagTilt}deg) scale(1.08)`;
        }}
      >
        {/* Tape corner holding the tag */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -8,
            left: -10,
            width: 34,
            height: 12,
            backgroundColor: theme.materials.tape,
            transform: 'rotate(-40deg)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}
        />
        {/* String + punched hole */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -16,
            right: 14,
            width: 2,
            height: 18,
            backgroundColor: '#cbd5e1',
            transform: 'rotate(18deg)',
          }}
        />
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {item.cost.toLocaleString()}
          <span style={{ color: '#a16207', display: 'flex' }}>
            <HopeCoinIcon size={18} />
          </span>
        </span>
        {!affordable && (
          <span style={{ fontSize: 10, fontFamily: 'inherit', fontWeight: 700 }}>wala pang Hope!</span>
        )}
      </button>
    </div>
  );
}

const HERO_PLACEHOLDER_SRC = '/assets/heroes/hero-placeholder.svg';
const CARD_RARITIES: DropRarity[] = ['common', 'common', 'rare', 'common', 'epic', 'rare'];

/** Build the reveal payload for a purchase — hero unlocks and card packs
 *  share the same card-flip reveal (per owner request). */
function rewardsFor(item: CatalogItem): { heading: string; rewards: RevealReward[] } {
  switch (item.category) {
    case 'Hero Unlocks':
      return {
        heading: 'A Worker Joins!',
        rewards: [{
          id: item.id,
          title: item.title.replace(/^Recruit:\s*/, ''),
          subtitle: 'Answered the call — stationed in the roster.',
          rarity: 'epic',
          portraitSrc: HERO_PLACEHOLDER_SRC,
        }],
      };
    case 'Hero Cards': {
      const count = item.id === 'eden_bundle' ? 5 : 3;
      const fixedName = item.id === 'eden_bundle' ? 'Eden' : null;
      const rewards: RevealReward[] = Array.from({ length: count }, (_, i) => ({
        id: `${item.id}-${i}`,
        title: `${fixedName ?? 'Hero'} Card`,
        subtitle: 'Level up the roster.',
        rarity: fixedName ? 'rare' : CARD_RARITIES[i % CARD_RARITIES.length],
        icon: <HeroCardIcon size={44} />,
      }));
      return { heading: 'Cards Drawn!', rewards };
    }
    default:
      return {
        heading: 'Bought!',
        rewards: [{
          id: item.id,
          title: item.title,
          subtitle: item.description,
          rarity: 'rare',
          icon: item.icon,
        }],
      };
  }
}

export function SariSariStore({ onBack }: SariSariStoreProps) {
  const [reveal, setReveal] = useState<{ heading: string; rewards: RevealReward[] } | null>(null);

  const handleBuy = (item: CatalogItem) => {
    setReveal(rewardsFor(item));
  };

  return (
    <div
      className="rally-screen"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#12100e',
        backgroundImage: `repeating-linear-gradient(0deg, ${theme.materials.wood}, ${theme.materials.wood} 100px, ${theme.materials.woodDark} 100px, ${theme.materials.woodDark} 103px)`,
        display: 'flex',
        flexDirection: 'column',
        color: theme.colors.textPrimary,
        overflowY: 'auto',
        boxShadow: 'inset 0 0 150px rgba(0,0,0,0.9)',
        zIndex: 100,
      }}
    >
      <Awning />

      {/* Warm bulb glow over the counter */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '18%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 620,
          maxWidth: '100%',
          height: 400,
          background: 'radial-gradient(ellipse, rgba(253, 224, 71, 0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ padding: 'clamp(16px, 4vw, 36px)', position: 'relative', zIndex: 5 }}>
        {/* Header: back + wooden signboard + Hope jar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 36,
          }}
        >
          <div>
            <div style={{ marginBottom: 16 }}>
              <BackButton onClick={onBack} label="Back to the Street" tone="wood" />
            </div>

            {/* Hand-painted wooden signboard */}
            <div
              style={{
                backgroundColor: theme.materials.woodLight,
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 22px, rgba(0,0,0,0.15) 22px, rgba(0,0,0,0.15) 24px)',
                border: `6px solid ${theme.materials.woodDark}`,
                borderRadius: 4,
                padding: '14px clamp(16px, 5vw, 32px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.5), inset 0 0 24px rgba(0,0,0,0.35)',
                display: 'inline-block',
                position: 'relative',
                transform: 'rotate(-1deg)',
                maxWidth: '100%',
              }}
            >
              {/* Nail heads */}
              {[
                { top: 6, left: 6 },
                { top: 6, right: 6 },
                { bottom: 6, left: 6 },
                { bottom: 6, right: 6 },
              ].map((pos, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: theme.materials.metalDark,
                    boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.6)',
                    ...pos,
                  }}
                />
              ))}
              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(26px, 6vw, 40px)',
                  fontFamily: MARKER_FONT,
                  color: theme.materials.paper,
                  textShadow: `2px 2px 0 ${theme.materials.woodDark}`,
                  letterSpacing: 2,
                }}
              >
                Aling Nena's Sari-Sari
              </h1>
              <div
                style={{
                  color: '#fde68a',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                }}
              >
                The Movement's Supply Line
              </div>

              {/* Protest sticker slapped on the sign */}
              <div
                style={{
                  position: 'absolute',
                  top: -12,
                  right: -16,
                  backgroundColor: theme.materials.ink,
                  color: theme.materials.paper,
                  padding: '5px 10px',
                  transform: 'rotate(10deg)',
                  fontFamily: MARKER_FONT,
                  fontWeight: 700,
                  fontSize: 12,
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
                }}
              >
                GISING NA!
              </div>
            </div>
          </div>

          {/* Hope jar on the counter */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '14px 14px 18px 18px',
              padding: '12px 26px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              transform: 'rotate(1deg)',
              position: 'relative',
            }}
          >
            {/* jar lid */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '70%',
                height: 10,
                borderRadius: 4,
                backgroundColor: theme.materials.metalDark,
              }}
            />
            <div style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
              Hope Jar
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 28, color: theme.colors.gold, fontWeight: 900 }}>
                {MOCK_HOPE.toLocaleString()}
              </span>
              <span style={{ color: theme.colors.gold, display: 'flex' }}>
                <HopeCoinIcon size={24} />
              </span>
            </div>
          </div>
        </div>

        {/* Hanging wire with goods, behind a metal grille */}
        <div style={{ position: 'relative' }}>
          {/* security grille overlay */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: '-10px -6px',
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent, transparent 64px, rgba(148,163,184,0.16) 64px, rgba(148,163,184,0.16) 67px)',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          />

          {/* the wire */}
          <div
            aria-hidden="true"
            style={{
              width: '100%',
              height: 2,
              backgroundColor: theme.materials.metal,
              boxShadow: '0 5px 10px rgba(0,0,0,0.5)',
              position: 'relative',
              zIndex: 5,
            }}
          >
            <span style={{ position: 'absolute', left: -6, top: -4, width: 10, height: 10, borderRadius: '50%', backgroundColor: theme.materials.metalDark }} />
            <span style={{ position: 'absolute', right: -6, top: -4, width: 10, height: 10, borderRadius: '50%', backgroundColor: theme.materials.metalDark }} />
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px 14px',
              justifyContent: 'center',
              padding: '0 0 32px',
              position: 'relative',
              zIndex: 10,
            }}
          >
            {CATALOG.map((item, i) => (
              <HangingGood key={item.id} item={item} index={i} affordable={item.cost <= MOCK_HOPE} onBuy={handleBuy} />
            ))}
          </div>
        </div>

        {/* Shelf silhouettes at the bottom */}
        <div
          aria-hidden="true"
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'flex-end',
            opacity: 0.18,
            pointerEvents: 'none',
            marginTop: 8,
          }}
        >
          <div style={{ width: 70, height: 110, backgroundColor: '#000', clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 100%, 0% 100%, 0% 20%)' }} />
          <div style={{ width: 140, height: 74, backgroundColor: '#000', borderRadius: '10px 10px 0 0' }} />
          <div style={{ width: 54, height: 140, backgroundColor: '#000', borderRadius: '5px 5px 0 0' }} />
          <div style={{ width: 92, height: 92, backgroundColor: '#000', borderRadius: '10px 10px 0 0' }} />
        </div>

        <div
          style={{
            textAlign: 'center',
            fontFamily: MARKER_FONT,
            color: theme.colors.textMuted,
            fontSize: 13,
            paddingBottom: 12,
          }}
        >
          Heroes are never sold for money — only Hope, earned on the streets.
        </div>
      </div>

      {reveal && (
        <RewardReveal
          heading={reveal.heading}
          rewards={reveal.rewards}
          onClose={() => setReveal(null)}
        />
      )}
    </div>
  );
}
