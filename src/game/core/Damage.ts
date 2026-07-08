export type DamageType = 'Physical' | 'Magic' | 'Wind' | 'Water' | 'Earth' | 'Frost' | 'Fire' | 'Holy' | 'Lightning' | 'Dark';

export const DAMAGE_TYPE_COLORS: Record<DamageType, number> = {
  'Physical': 0x9ca3af,
  'Magic': 0x38bdf8,
  'Fire': 0xef4444,
  'Frost': 0x7dd3fc,
  'Lightning': 0xeab308,
  'Water': 0x2563eb,
  'Wind': 0x14b8a6,
  'Earth': 0x78350f,
  'Holy': 0xfcd34d,
  'Dark': 0x7e22ce
};
