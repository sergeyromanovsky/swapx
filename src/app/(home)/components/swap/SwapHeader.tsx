import { SettingsModal } from "../SettingsModal";

export function SwapHeader() {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold">Swap</h2>
      <div className="flex items-center gap-1">
        <SettingsModal />
      </div>
    </div>
  );
}
