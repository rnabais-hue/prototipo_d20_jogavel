export const EXPLORATION_VISUAL_COLORS = {
  // Base Palette
  charcoal: 0x15181f,
  slate: 0x283548,
  moss: 0x587a4d,
  earth: 0x8a6846,
  cyan: 0x4fb3d9,
  violet: 0xb983ff,
  amber: 0xf2c14e,
  dangerCoral: 0xe85d5d,

  // Ground and wall colors
  groundBase: 0x28382c,      // Mossy green base
  groundAccent: 0x202d23,    // Darker mossy green accent
  wallBase: 0x403024,        // Earthy dark brown base
  wallHighlight: 0x564131,   // Lighter earth bevel highlight
  wallShadow: 0x2a1f17,      // Dark earth shadow
  wallMortar: 0x1a130e,      // Mortar line color

  // Actor colors
  playerFill: 0x65c98c,      // Adventurous green
  playerBorder: 0xf2c14e,    // Gold rim
  playerEmblem: 0xf4f0e8,    // Ivory shield

  // POI specific colors
  surveyFill: 0xf28f3b,      // Amber orange
  surveyBorder: 0xffd6a5,    // Light orange highlight
  switchActiveFill: 0x4fb3d9, // Active cyan
  switchInactiveFill: 0x283548, // Off slate
  exitFill: 0xb983ff,        // Purple
  exitBorder: 0xe7c8ff,      // Lilac highlight
  combatTriggerFill: 0xe63946, // Danger red
  combatTriggerBorder: 0xffb7b2, // Light coral outline

  // Overlays
  reachableFill: 0x4fb3d9,
  reachableStroke: 0x6ed8ff,
  selectedFill: 0xf2c14e,
  selectedStroke: 0xffd166,
  targetFill: 0x65c98c,
  targetStroke: 0x7ee2a8,
  pathFill: 0xb983ff,
  pathStroke: 0xd8b4ff,
} as const;

export const EXPLORATION_DEPTHS = {
  terrain: 0,
  overlays: 10,
  pointsOfInterest: 20,
  actors: 30,
  ui: 100,
} as const;
