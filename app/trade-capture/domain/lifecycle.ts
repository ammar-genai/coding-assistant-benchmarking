import type { LifecycleContext, Trade, TradeDraft } from "./types.ts";

function scaffold(): never {
  throw new Error("Terra domain worker has not implemented lifecycle behavior");
}

export function saveDraft(
  _existing: Trade | null,
  _draft: TradeDraft,
  _context: LifecycleContext,
): Trade {
  void _existing;
  void _draft;
  void _context;
  return scaffold();
}

export function validateTradeRecord(
  _existing: Trade | null,
  _draft: TradeDraft,
  _context: LifecycleContext,
): Trade {
  void _existing;
  void _draft;
  void _context;
  return scaffold();
}

export function bookTrade(
  _existing: Trade | null,
  _draft: TradeDraft,
  _context: LifecycleContext,
): Trade {
  void _existing;
  void _draft;
  void _context;
  return scaffold();
}

export function cancelTrade(_trade: Trade, _context: LifecycleContext): Trade {
  void _trade;
  void _context;
  return scaffold();
}
