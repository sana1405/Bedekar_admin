"use client";

import { useEffect, useState } from "react";
import type { Rates } from "./types";

type RateFormDialogProps = {
  open: boolean;
  loading?: boolean;
  initialValues?: Rates;
  onClose: () => void;
  onSubmit: (rates: Rates) => void;
};

const emptyValues = (): Rates => ({ gold24K: 0, silverPerGram: 0 });

export default function RateFormDialog({ open, loading = false, initialValues, onClose, onSubmit }: RateFormDialogProps) {
  const [rates, setRates] = useState<Rates>(emptyValues());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setRates({
      gold24K: Number(initialValues?.gold24K ?? 0),
      silverPerGram: Number(initialValues?.silverPerGram ?? 0),
    });
  }, [open, initialValues]);

  const handleChange = (field: keyof Rates, value: string) => {
    setRates(prev => ({ ...prev, [field]: Number(value) }));
    if (error) setError("");
  };

  const submit = () => {
    const gold = Number(rates.gold24K);
    const silver = Number(rates.silverPerGram);

    if (!Number.isFinite(gold) || gold <= 0 || !Number.isFinite(silver) || silver <= 0) {
      setError("Please enter valid positive values for both metal rates.");
      return;
    }

    onSubmit({ gold24K: gold, silverPerGram: silver });
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card confirm-card" onClick={event => event.stopPropagation()}>
        <div className="modal-header compact-header">
          <div>
            <p className="eyebrow">METAL RATES</p>
            <h2>Edit today’s rates</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="modal-body confirm-body">
          <div className="form-grid">
            <label className="field field-span-2">
              <span>24K Gold Rate (₹ / gram)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={rates.gold24K ?? ""}
                onChange={event => handleChange("gold24K", event.target.value)}
                disabled={loading}
                placeholder="7412"
              />
            </label>

            <label className="field field-span-2">
              <span>Silver Rate (₹ / gram)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={rates.silverPerGram ?? ""}
                onChange={event => handleChange("silverPerGram", event.target.value)}
                disabled={loading}
                placeholder="92.4"
              />
            </label>
          </div>

          {error && <small className="form-error">{error}</small>}
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="gold" onClick={submit} disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
