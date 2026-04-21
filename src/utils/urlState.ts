import LZString from 'lz-string';
import type { LoanInputs } from './loanMath';
import type { SavedScenario } from '../hooks/useLoanCalculations';

export interface AppState {
  inputs: LoanInputs;
  scenarios: SavedScenario[];
}

export function encodeState(state: AppState): string {
  const json = JSON.stringify(state);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeState(hash: string): AppState | null {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(hash);
    if (!decompressed) return null;
    const parsed = JSON.parse(decompressed);
    
    // Revive Dates
    if (parsed.inputs && parsed.inputs.startDate) {
      parsed.inputs.startDate = new Date(parsed.inputs.startDate);
    }
    
    return parsed as AppState;
  } catch (e) {
    console.error('Failed to decode state from URL', e);
    return null;
  }
}

export function generateShareUrl(state: AppState): string {
  const hash = encodeState(state);
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('s', hash);
  return url.toString();
}
