import { useEffect, useReducer, useState } from 'react';
import type { ReactNode } from 'react';
import { theme } from '../theme';
import {
  HeroCardIcon,
  HopeCoinIcon,
  PlacardIcon,
  RallyPermitIcon,
  VictoryIcon,
  VoicesIcon,
} from '../icons';
import { BackButton } from '../components/BackButton';
import { Embers } from '../components/ApocalypseScenery';
import { HeroTcgCard } from '../components/HeroTcgCard';
import { RewardReveal, type RevealReward } from '../components/RewardReveal';
import type { DropRarity } from '../../game/core/GameEvents';
import { HERO_DEFINITIONS, type HeroId } from '../../game/data/heroes';
import { HERO_UNLOCK_STAGE, type RecruitableHeroId, availableHeroIds } from '../../game/data/heroUnlocks';
import { rollCardDrops } from '../../game/data/battleRewards';
import {
  getHope,
  spendHope,
  addPermits,
  addHeroCards,
  getStoreUnlockedHeroes,
  unlockHeroInStore,
  getHighestClearedStage,
  subscribeMetaState,
  canClaimDaily,
  claimDailyPermits,
  adsRemainingToday,
  grantAdReward,
  DAILY_CLAIM_PERMITS,
  AD_PERMIT_REWARD,
  MAX_AD_WATCHES_PER_DAY,
} from '../../game/data/metaState';
import { AdsManager } from '../../game/core/AdsManager';

interface SariSariStoreProps {
  onBack: () => void;
}

const MARKER_FONT = '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive';

// Catalog per docs/PROGRESSION.md: Hero Cards, Hero unlocks, Rally Permits, Cosmetics — all priced in Hope Points.
type CatalogCategory = 'Hero Cards' | 'Hero Unlocks' | 'Rally Permits' | 'Cosmetics';

interface CatalogItem {
  id: string;
  category: CatalogCategory;
  title: string;
  description: string;
  cost: number;
  icon: ReactNode;
}

const BASE_CATALOG: CatalogItem[] = [
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

/** Battered corrugated-iron awning — scorched, sagging, half its scallops torn. */
function Awning() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        zIndex: 6,
        transform: 'rotate(-0.8deg)', // one side sags off its bracket
        transformOrigin: 'left center',
      }}
    >
      <div
        style={{
          height: 22,
          // faded, soot-darkened stripes with charring streaks bleeding down
          backgroundImage: `repeating-linear-gradient(90deg, ${theme.materials.rustDark}, ${theme.materials.rustDark} 42px, rgba(120, 110, 100, 0.35) 42px, rgba(120, 110, 100, 0.35) 84px), repeating-linear-gradient(180deg, transparent, transparent 3px, rgba(0, 0, 0, 0.4) 3px, rgba(0, 0, 0, 0.4) 5px), linear-gradient(90deg, transparent 60%, rgba(0,0,0,0.5) 72%, transparent 80%)`,
          boxShadow: '0 6px 18px rgba(0,0,0,0.8), inset 0 -6px 10px rgba(0,0,0,0.6)',
        }}
      />
      <div
        style={{
          height: 10,
          // torn scalloped fringe — a mask punches gaps where the cloth is ripped away
          backgroundImage: `radial-gradient(circle at 21px -2px, ${theme.materials.rustDark} 20px, transparent 21px), radial-gradient(circle at 63px -2px, rgba(120, 110, 100, 0.35) 20px, transparent 21px)`,
          backgroundSize: '84px 14px',
          filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.7))',
          WebkitMaskImage: 'repeating-linear-gradient(90deg, #000 0 120px, transparent 120px 168px)',
          maskImage: 'repeating-linear-gradient(90deg, #000 0 120px, transparent 120px 168px)',
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
        width: 'min(100px, 20vw)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        transformOrigin: 'top center',
        transform: `rotate(${swing}deg)`,
        marginTop: 22,
      }}
    >
      {/* Clothespin clip on the wire */}
      <div
        aria-hidden="true"
        style={{
          width: 14,
          height: 34,
          backgroundColor: '#52433a',
          border: `1px solid ${theme.materials.woodDark}`,
          borderRadius: 7,
          position: 'absolute',
          top: -34,
          zIndex: 2,
          boxShadow: 'inset -2px -2px 5px rgba(0,0,0,0.5)',
          backgroundImage: 'linear-gradient(180deg, rgba(120,70,30,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
        }}
      />

      {/* Plastic-wrapped goods */}
      <div
        style={{
          backgroundColor: 'rgba(41, 37, 36, 0.95)',
          border: `2px solid ${theme.colors.border}`,
          borderRadius: 8,
          padding: '6px 5px',
          width: '100%',
          minHeight: 72,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 20px rgba(0,0,0,0.7), inset 0 0 20px rgba(234, 88, 12, 0.06)',
          zIndex: 3,
          opacity: affordable ? 1 : 0.75,
          transition: 'box-shadow 0.2s ease',
        }}
        onMouseOver={(e) => {
          if (affordable) {
            e.currentTarget.style.boxShadow = `0 10px 20px rgba(0,0,0,0.7), inset 0 0 20px rgba(234, 88, 12, 0.06), 0 0 15px ${theme.colors.accent}`;
          }
        }}
        onMouseOut={(e) => {
          if (affordable) {
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.7), inset 0 0 20px rgba(234, 88, 12, 0.06)';
          }
        }}
      >
        <div
          style={{
            marginBottom: 4,
            color: theme.colors.textSecondary,
            filter: affordable ? 'none' : 'grayscale(60%)',
            display: 'flex',
          }}
        >
          {item.icon}
        </div>
        <div
          style={{
            fontSize: 7,
            letterSpacing: 0.5,
            fontWeight: 900,
            color: theme.colors.accent,
            textTransform: 'uppercase',
            marginBottom: 2,
          }}
        >
          {item.category}
        </div>
        <h3
          style={{
            margin: '0 0 3px 0',
            fontSize: 10,
            color: theme.colors.textPrimary,
            textAlign: 'center',
            fontWeight: 900,
            textTransform: 'uppercase',
            lineHeight: 1.1,
          }}
        >
          {item.title}
        </h3>
        <p style={{ margin: 0, fontSize: 8, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 1.3 }}>
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
          minHeight: 38,
          minWidth: 72,
          backgroundColor: affordable ? theme.materials.cardboard : '#7f1d1d',
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)',
          color: theme.colors.textPrimary,
          border: `1px solid ${theme.materials.rustDark}`,
          padding: '5px 10px',
          borderRadius: 2,
          fontWeight: 900,
          fontFamily: MARKER_FONT,
          fontSize: 13,
          cursor: affordable ? 'pointer' : 'not-allowed',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          // scorched corners bleeding in from the edges of the cardboard
          boxShadow: '2px 4px 10px rgba(0,0,0,0.6), inset 0 0 14px rgba(0,0,0,0.5)',
          transform: `rotate(${tagTilt}deg)`,
          zIndex: 10,
          transition: 'transform 0.1s, box-shadow 0.15s',
          opacity: affordable ? 1 : 0.5,
        }}
        onMouseOver={(e) => {
          if (affordable) {
            e.currentTarget.style.transform = `rotate(${tagTilt}deg) scale(1.08)`;
            e.currentTarget.style.boxShadow = '2px 4px 10px rgba(0,0,0,0.6), inset 0 0 14px rgba(0,0,0,0.5), 0 0 16px rgba(234,88,12,0.5)';
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = `rotate(${tagTilt}deg) scale(1)`;
          e.currentTarget.style.boxShadow = '2px 4px 10px rgba(0,0,0,0.6), inset 0 0 14px rgba(0,0,0,0.5)';
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
            backgroundColor: 'rgba(120, 100, 70, 0.55)',
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
            backgroundColor: '#52524e',
            transform: 'rotate(18deg)',
          }}
        />
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {item.cost.toLocaleString()}
          <span style={{ color: theme.colors.gold, display: 'flex', filter: 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.4))' }}>
            <HopeCoinIcon size={18} />
          </span>
        </span>
      </button>
    </div>
  );
}

/**
 * A locked hero on the Recruitment Board — shown as their full Hero TCG card so
 * the player sees exactly who they're hiring, with a cardboard "Recruit" tag as
 * the buy button.
 */
function RecruitCard({ item, heroId, affordable, onBuy }: { item: CatalogItem; heroId: HeroId; affordable: boolean; onBuy: (item: CatalogItem) => void }) {
  const heroName = item.title.replace(/^Recruit:\s*/, '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: 300, maxWidth: '100%' }}>
      <div
        style={{
          position: 'relative',
          opacity: affordable ? 1 : 0.72,
          filter: affordable ? 'none' : 'grayscale(0.5)',
          transition: 'opacity 0.2s, filter 0.2s',
        }}
      >
        <HeroTcgCard heroId={heroId} />
        {/* "not yet recruited" ribbon slapped across the card */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 16,
            left: -6,
            zIndex: 60,
            backgroundColor: theme.colors.danger,
            color: theme.colors.textPrimary,
            fontFamily: MARKER_FONT,
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 2,
            textTransform: 'uppercase',
            padding: '4px 12px',
            transform: 'rotate(-6deg)',
            boxShadow: '2px 2px 8px rgba(0,0,0,0.7)',
          }}
        >
          Not yet recruited
        </div>
      </div>

      <button
        disabled={!affordable}
        onClick={() => affordable && onBuy(item)}
        aria-label={
          affordable
            ? `Recruit ${heroName} for ${item.cost} Hope Points`
            : `Recruit ${heroName} costs ${item.cost} Hope Points — not enough Hope`
        }
        style={{
          backgroundColor: affordable ? theme.materials.cardboard : '#7f1d1d',
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)',
          color: theme.colors.textPrimary,
          border: `1px solid ${theme.materials.rustDark}`,
          borderRadius: 2,
          padding: '8px 18px',
          fontFamily: MARKER_FONT,
          fontWeight: 900,
          fontSize: 15,
          cursor: affordable ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minHeight: 44,
          boxShadow: '2px 4px 10px rgba(0,0,0,0.6), inset 0 0 14px rgba(0,0,0,0.5)',
          transform: 'rotate(-1.5deg)',
          opacity: affordable ? 1 : 0.85,
          transition: 'transform 0.1s, box-shadow 0.15s',
        }}
        onMouseOver={(e) => {
          if (affordable) e.currentTarget.style.boxShadow = '2px 4px 10px rgba(0,0,0,0.6), inset 0 0 14px rgba(0,0,0,0.5), 0 0 16px rgba(234,88,12,0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = '2px 4px 10px rgba(0,0,0,0.6), inset 0 0 14px rgba(0,0,0,0.5)';
        }}
      >
        Recruit — {item.cost.toLocaleString()}
        <span style={{ color: theme.colors.gold, display: 'flex', filter: 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.4))' }}>
          <HopeCoinIcon size={20} />
        </span>
      </button>
    </div>
  );
}

const CARD_RARITIES: DropRarity[] = ['common', 'common', 'rare', 'common', 'epic', 'rare'];

/** Build the reveal payload for a purchase — hero unlocks and card packs
 *  share the same card-flip reveal (per owner request). `grantedCards` is the
 *  actual heroes the pack rolled, so the reveal names who leveled up. */
function rewardsFor(item: CatalogItem, grantedCards: HeroId[] = []): { heading: string; rewards: RevealReward[] } {
  switch (item.category) {
    case 'Hero Unlocks': {
      const heroId = item.id.replace('unlock_', '') as HeroId;
      return {
        heading: 'A Worker Joins!',
        rewards: [{
          id: item.id,
          title: item.title.replace(/^Recruit:\s*/, ''),
          subtitle: 'Answered the call — stationed in the roster.',
          rarity: 'epic',
          portraitSrc: `/assets/heroes/${heroId}_portrait.png`,
        }],
      };
    }
    case 'Hero Cards': {
      const rewards: RevealReward[] = grantedCards.map((heroId, i) => ({
        id: `${item.id}-${i}`,
        title: `${HERO_DEFINITIONS[heroId]?.name ?? heroId} Card`,
        subtitle: 'Level up the roster.',
        rarity: item.id === 'eden_bundle' ? 'rare' : CARD_RARITIES[i % CARD_RARITIES.length],
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

/** Reveal payload for a permit grant (daily claim / rewarded ad), reusing the
 *  shared card-flip modal. */
function permitReveal(count: number): { heading: string; rewards: RevealReward[] } {
  return {
    heading: 'Permits Granted!',
    rewards: [{
      id: `permits-${count}`,
      title: count === 1 ? 'Rally Permit' : `Rally Permits ×${count}`,
      subtitle: 'Papers in order — march on!',
      rarity: 'rare',
      icon: <RallyPermitIcon size={44} />,
    }],
  };
}

/**
 * A free "no Hope required" offer on Aling Nena's counter (daily pack / watch an
 * ad). Cardboard-tag aesthetic, sibling to HangingGood but with a counter/claimed
 * state and an in-flight busy state instead of a Hope price.
 */
function FreebieCard({
  title,
  description,
  buttonLabel,
  sublabel,
  icon,
  disabled,
  busy,
  onClick,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  sublabel?: string;
  icon: ReactNode;
  disabled: boolean;
  busy: boolean;
  onClick: () => void;
}) {
  const dead = disabled || busy;
  return (
    <div
      style={{
        width: 260,
        maxWidth: '100%',
        backgroundColor: theme.materials.cardboard,
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.10) 3px, rgba(0,0,0,0.10) 6px)',
        border: `1px solid ${theme.materials.cardboardEdge}`,
        borderRadius: 3,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        textAlign: 'center',
        boxShadow: '2px 4px 12px rgba(0,0,0,0.6), inset 0 0 18px rgba(0,0,0,0.4)',
        transform: 'rotate(-0.6deg)',
      }}
    >
      <span style={{ color: theme.colors.accent, display: 'flex', filter: 'drop-shadow(0 0 6px rgba(234,88,12,0.4))' }}>
        {icon}
      </span>
      <span style={{ fontFamily: MARKER_FONT, fontWeight: 900, fontSize: 17, color: theme.materials.paper }}>
        {title}
      </span>
      <span style={{ fontSize: 11, color: 'rgba(231, 229, 228, 0.85)', lineHeight: 1.35 }}>
        {description}
      </span>
      {sublabel && (
        <span style={{ fontSize: 11, fontWeight: 800, color: theme.colors.gold, letterSpacing: 0.5 }}>
          {sublabel}
        </span>
      )}
      <button
        type="button"
        disabled={dead}
        onClick={() => { if (!dead) onClick(); }}
        aria-label={buttonLabel}
        style={{
          marginTop: 4,
          backgroundColor: dead ? '#44403c' : '#166534',
          color: dead ? theme.colors.textMuted : theme.colors.textPrimary,
          border: `1px solid ${theme.materials.rustDark}`,
          borderRadius: 2,
          padding: '8px 16px',
          fontFamily: MARKER_FONT,
          fontWeight: 900,
          fontSize: 14,
          cursor: dead ? 'not-allowed' : 'pointer',
          minHeight: 44,
          width: '100%',
          boxShadow: 'inset 0 0 12px rgba(0,0,0,0.45)',
          transition: 'background-color 0.15s',
        }}
      >
        {busy ? 'Playing…' : buttonLabel}
      </button>
    </div>
  );
}

export function SariSariStore({ onBack }: SariSariStoreProps) {
  const [reveal, setReveal] = useState<{ heading: string; rewards: RevealReward[] } | null>(null);
  const [adBusy, setAdBusy] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => subscribeMetaState(forceUpdate), []);

  // Boot the ads engine (idempotent) and re-render on ad status changes so the
  // Watch-ad button reflects ready/unavailable.
  useEffect(() => {
    void AdsManager.init();
    return AdsManager.subscribe(forceUpdate);
  }, []);

  // Refresh the freebie labels across local midnight while the store sits open.
  // Purely cosmetic — claimDailyPermits/grantAdReward re-check the date, so this
  // can never over-grant.
  useEffect(() => {
    const id = setInterval(forceUpdate, 60_000);
    return () => clearInterval(id);
  }, []);

  const hope = getHope();
  const highestStage = getHighestClearedStage();
  const storeUnlocked = getStoreUnlockedHeroes();

  // Dynamically build the catalog: base items + locked heroes
  const lockedHeroes = (Object.keys(HERO_UNLOCK_STAGE) as RecruitableHeroId[]).filter((id) => {
    const unlockStage = HERO_UNLOCK_STAGE[id];
    return unlockStage > highestStage && !storeUnlocked.includes(id);
  });

  // Locked heroes get their own Recruitment Board (full Hero TCG cards); the
  // hanging wire only carries the consumable/cosmetic goods.
  const recruitItems: CatalogItem[] = lockedHeroes.map((heroId) => {
    const def = HERO_DEFINITIONS[heroId];
    return {
      id: `unlock_${heroId}`,
      category: 'Hero Unlocks' as CatalogCategory,
      title: `Recruit: ${def.name}`,
      description: `Hire ${def.name} early for the movement!`,
      cost: 5000,
      icon: <HeroCardIcon size={30} />,
    };
  });

  const handleBuy = (item: CatalogItem) => {
    if (spendHope(item.cost)) {
      let grantedCards: HeroId[] = [];
      if (item.category === 'Hero Unlocks') {
        const heroId = item.id.replace('unlock_', '') as HeroId;
        unlockHeroInStore(heroId);
      } else if (item.id === 'permit_single') {
        addPermits(1);
      } else if (item.id === 'permit_bundle') {
        addPermits(5);
      } else if (item.id === 'card_pack') {
        // 3 random cards from the heroes the player actually owns.
        grantedCards = rollCardDrops(3, availableHeroIds(highestStage, storeUnlocked), Math.random);
        for (const heroId of grantedCards) addHeroCards(heroId, 1);
      } else if (item.id === 'eden_bundle') {
        grantedCards = ['eden', 'eden', 'eden', 'eden', 'eden'];
        addHeroCards('eden', 5);
      }
      setReveal(rewardsFor(item, grantedCards));
    }
  };

  const handleDailyClaim = () => {
    if (claimDailyPermits()) setReveal(permitReveal(DAILY_CLAIM_PERMITS));
  };

  const handleWatchAd = async () => {
    if (adBusy || adsRemainingToday() <= 0) return;
    setAdBusy(true);
    try {
      const earned = await AdsManager.showRewarded();
      if (earned && grantAdReward()) setReveal(permitReveal(AD_PERMIT_REWARD));
    } finally {
      setAdBusy(false);
    }
  };

  const dailyClaimable = canClaimDaily();
  const adsLeft = adsRemainingToday();
  const adsUnavailable = AdsManager.getStatus() === 'unavailable';

  return (
    <div
      className="rally-screen"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#0a0806',
        backgroundImage: `repeating-linear-gradient(0deg, ${theme.materials.wood}, ${theme.materials.wood} 100px, ${theme.materials.woodDark} 100px, ${theme.materials.woodDark} 103px)`,
        display: 'flex',
        flexDirection: 'column',
        color: theme.colors.textPrimary,
        overflowY: 'auto',
        boxShadow: 'inset 0 0 200px rgba(0,0,0,0.95)',
        zIndex: 100,
      }}
    >
      <Awning />
      <Embers count={8} />

      {/* Boarded-up patch — a plank nailed over a smashed section of wall */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '30%',
          right: '6%',
          width: 96,
          height: 34,
          background: `linear-gradient(90deg, ${theme.materials.woodDark}, ${theme.materials.wood})`,
          border: `1px solid #000`,
          transform: 'rotate(-8deg)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
          zIndex: 1,
          opacity: 0.85,
        }}
      >
        {/* two crossed nails */}
        <span style={{ position: 'absolute', top: 5, left: 6, width: 5, height: 5, borderRadius: '50%', backgroundColor: '#5c3d2a' }} />
        <span style={{ position: 'absolute', bottom: 5, right: 6, width: 5, height: 5, borderRadius: '50%', backgroundColor: '#5c3d2a' }} />
      </div>

      {/* Warm bulb glow over the counter — the store is the one warm refuge */}
      <div
        aria-hidden="true"
        className="rally-flicker"
        style={{
          position: 'absolute',
          top: '18%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 620,
          maxWidth: '100%',
          height: 400,
          background: 'radial-gradient(ellipse, rgba(234, 88, 12, 0.2) 0%, rgba(234, 88, 12, 0.07) 40%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ padding: 'clamp(12px, 3vw, 24px)', position: 'relative', zIndex: 5 }}>
        {/* Header: back + wooden signboard + Hope jar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ marginBottom: 16 }}>
              <BackButton onClick={onBack} label="Back to the Street" tone="wood" />
            </div>

            {/* Hand-painted wooden signboard */}
            <div
              style={{
                backgroundColor: '#3d2a18',
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 22px, rgba(0,0,0,0.3) 22px, rgba(0,0,0,0.3) 24px), linear-gradient(135deg, rgba(0,0,0,0.2) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)',
                border: `6px solid ${theme.materials.woodDark}`,
                borderRadius: 4,
                padding: '14px clamp(16px, 5vw, 32px)',
                boxShadow: '0 10px 24px rgba(0,0,0,0.7), inset 0 0 30px rgba(0,0,0,0.5)',
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
                    backgroundColor: '#5c3d2a',
                    boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.7), 0 0 3px rgba(120,60,20,0.3)',
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
                  textShadow: `2px 2px 0 ${theme.materials.woodDark}, 0 0 12px rgba(234, 88, 12, 0.25)`,
                  letterSpacing: 2,
                }}
              >
                Aling Nena's Sari-Sari
              </h1>
              <div
                style={{
                  color: theme.colors.accent,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                  textShadow: '0 0 8px rgba(234, 88, 12, 0.35)',
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
                  backgroundColor: theme.colors.danger,
                  color: theme.colors.textPrimary,
                  padding: '5px 10px',
                  transform: 'rotate(10deg)',
                  fontFamily: MARKER_FONT,
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  boxShadow: '2px 2px 8px rgba(0,0,0,0.7), 0 0 10px rgba(220, 38, 38, 0.3)',
                }}
              >
                GISING NA!
              </div>
            </div>
          </div>

          {/* Hope jar on the counter */}
          <div
            style={{
              backgroundColor: 'rgba(41, 32, 24, 0.85)',
              border: '2px solid rgba(234, 88, 12, 0.35)',
              borderRadius: '14px 14px 18px 18px',
              padding: '12px 26px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.7), inset 0 2px 10px rgba(234, 88, 12, 0.08), 0 0 24px rgba(234, 88, 12, 0.12)',
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
                backgroundColor: '#5c3d2a',
                backgroundImage: 'linear-gradient(90deg, #4a3020, #6b4530, #4a3020)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            />
            <div style={{ fontSize: 11, color: theme.colors.textSecondary, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
              Hope Jar
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 28, color: theme.colors.gold, fontWeight: 900, textShadow: '0 0 10px rgba(250, 204, 21, 0.3)' }}>
                {hope.toLocaleString()}
              </span>
              <span style={{ color: theme.colors.gold, display: 'flex', filter: 'drop-shadow(0 0 5px rgba(250, 204, 21, 0.35))' }}>
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
                'repeating-linear-gradient(90deg, transparent, transparent 56px, rgba(63, 63, 70, 0.35) 56px, rgba(63, 63, 70, 0.35) 60px)',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          />

          {/* the wire */}
          <div
            aria-hidden="true"
            style={{
              width: '100%',
              height: 3,
              backgroundColor: '#52433a',
              boxShadow: '0 5px 12px rgba(0,0,0,0.6)',
              position: 'relative',
              zIndex: 5,
            }}
          >
            <span style={{ position: 'absolute', left: -6, top: -4, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#4a3020' }} />
            <span style={{ position: 'absolute', right: -6, top: -4, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#4a3020' }} />
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '34px 22px',
              justifyContent: 'center',
              padding: '8px 0 28px',
              position: 'relative',
              zIndex: 10,
            }}
          >
            {BASE_CATALOG.map((item, i) => (
              <HangingGood key={item.id} item={item} index={i} affordable={item.cost <= hope} onBuy={handleBuy} />
            ))}
          </div>
        </div>

        {/* Freebies — no Hope required: daily pack + watch-an-ad permits */}
        <div style={{ marginTop: 36, position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <span
              style={{
                fontFamily: MARKER_FONT,
                fontSize: 24,
                color: theme.materials.paper,
                letterSpacing: 2,
                textShadow: '2px 2px 0 rgba(0,0,0,0.6), 0 0 12px rgba(234,88,12,0.25)',
              }}
            >
              Aling Nena's Freebies
            </span>
            <div style={{ fontSize: 11, color: theme.colors.textMuted, letterSpacing: 1, marginTop: 6 }}>
              No Hope required — the movement provides.
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, justifyContent: 'center' }}>
            <FreebieCard
              title="Daily Ration"
              description={`Aling Nena's gift — ${DAILY_CLAIM_PERMITS} permits, once a day.`}
              icon={<RallyPermitIcon size={34} />}
              disabled={!dailyClaimable}
              busy={false}
              buttonLabel={dailyClaimable ? `Claim ${DAILY_CLAIM_PERMITS} Free Permits` : 'Claimed — back tomorrow'}
              onClick={handleDailyClaim}
            />
            <FreebieCard
              title="Watch a Sponsor"
              description={`Sit through a message for +${AD_PERMIT_REWARD} permits.${AdsManager.isSimulated() ? ' (simulated in dev)' : ''}`}
              icon={<VoicesIcon size={34} />}
              disabled={adsUnavailable || adsLeft <= 0}
              busy={adBusy}
              sublabel={
                adsUnavailable
                  ? 'Ads unavailable right now'
                  : `${adsLeft}/${MAX_AD_WATCHES_PER_DAY} left today`
              }
              buttonLabel={
                adsUnavailable
                  ? 'Ads unavailable'
                  : adsLeft <= 0
                    ? 'All watched — back tomorrow'
                    : `Watch Ad (+${AD_PERMIT_REWARD})`
              }
              onClick={handleWatchAd}
            />
          </div>
        </div>

        {/* Recruitment Board — locked heroes shown as full Hero TCG cards */}
        {recruitItems.length > 0 && (
          <div style={{ marginTop: 40, position: 'relative', zIndex: 10 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span
                style={{
                  fontFamily: MARKER_FONT,
                  fontSize: 24,
                  color: theme.materials.paper,
                  letterSpacing: 2,
                  textShadow: '2px 2px 0 rgba(0,0,0,0.6), 0 0 12px rgba(234,88,12,0.25)',
                }}
              >
                Recruitment Board
              </span>
              <div style={{ fontSize: 11, color: theme.colors.textMuted, letterSpacing: 1, marginTop: 6 }}>
                Hire a worker early — they join the roster and start dropping in battle.
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, justifyContent: 'center' }}>
              {recruitItems.map((item) => (
                <RecruitCard
                  key={item.id}
                  item={item}
                  heroId={item.id.replace('unlock_', '') as HeroId}
                  affordable={item.cost <= hope}
                  onBuy={handleBuy}
                />
              ))}
            </div>
          </div>
        )}

        {/* Shelf silhouettes at the bottom */}
        <div
          aria-hidden="true"
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'flex-end',
            opacity: 0.25,
            pointerEvents: 'none',
            marginTop: 8,
          }}
        >
          <div style={{ width: 60, height: 80, backgroundColor: theme.materials.woodDark, clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 100%, 0% 100%, 0% 20%)' }} />
          <div style={{ width: 120, height: 56, backgroundColor: theme.materials.woodDark, borderRadius: '10px 10px 0 0' }} />
          <div style={{ width: 44, height: 100, backgroundColor: theme.materials.woodDark, borderRadius: '5px 5px 0 0' }} />
          <div style={{ width: 76, height: 72, backgroundColor: theme.materials.woodDark, borderRadius: '10px 10px 0 0' }} />
        </div>

        <div
          style={{
            textAlign: 'center',
            fontFamily: MARKER_FONT,
            color: theme.colors.textMuted,
            fontSize: 13,
            paddingBottom: 12,
            textShadow: '0 0 8px rgba(234, 88, 12, 0.18)',
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
