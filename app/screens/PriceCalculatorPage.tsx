"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { api } from "../lib/api";
import type { Rates } from "./types";
import { money } from "./types";

export default function PriceCalculatorPage({ rates }: { rates: Rates }) {
  const [metal, setMetal] = useState("Gold");
  const [purity, setPurity] = useState("22K");
  const [weight, setWeight] = useState("");
  const [making, setMaking] = useState("");
  const [result, setResult] = useState<{ effectivePurityRate: number; metalAmount: number; makingChargeValue: number; finalPrice: number } | null>(null);
  const [error, setError] = useState("");

  const goldFactor: Record<string, number> = { "24K": 1, "22K": 22 / 24, "20K": 20 / 24, "18K": 0.75, "14K": 14 / 24 };
  const silverFactor: Record<string, number> = { "999 (Bullion)": 1, "925 (Sterling)": 0.925, "Payal (80%)": 0.8 };
  const base = metal === "Gold" ? rates.gold24K ?? 0 : rates.silverPerGram ?? 0;

  const calculate = async () => {
    setError("");

    try {
      const response = await api<{ effectivePurityRate: number; metalAmount: number; makingChargeValue: number; finalPrice: number }>("/calculator", {
        method: "POST",
        body: JSON.stringify({ metalType: metal, purityKey: purity, weight, makingChargePercentage: making, baseRate: base }),
      });
      setResult(response);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Calculation unavailable");
    }
  };

  return (
    <PageTop title="Price calculator" text="Estimate jewellery pricing using today’s live base rates.">
      <section className="calculator">
        <div className="card calc-form">
          <p className="eyebrow">CALCULATION PARAMETERS</p>
          <h2>Build a price estimate</h2>

          <div className="toggle">
            <button className={metal === "Gold" ? "on" : ""} onClick={() => { setMetal("Gold"); setPurity("22K"); setResult(null); }}>Gold</button>
            <button className={metal === "Silver" ? "on" : ""} onClick={() => { setMetal("Silver"); setPurity("999 (Bullion)"); setResult(null); }}>Silver</button>
          </div>

          <label>
            Purity
            <select value={purity} onChange={e => setPurity(e.target.value)}>
              {(metal === "Gold" ? Object.keys(goldFactor) : Object.keys(silverFactor)).map(key => <option key={key}>{key}</option>)}
            </select>
          </label>

          <label>
            Weight in grams
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 12.50" />
          </label>

          <label>
            Making charges (%)
            <input type="number" value={making} onChange={e => setMaking(e.target.value)} placeholder="e.g. 12" />
          </label>

          <button className="gold calc-button" onClick={calculate}>Calculate with live API</button>
          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="card calc-output">
          <p className="eyebrow">BACKEND CALCULATION</p>
          <h2>{money(result?.finalPrice)}</h2>
          <p>Final estimated jewellery value</p>
          <div>
            <span>
              <b>Effective {purity} rate</b>
              <em>{money(result?.effectivePurityRate)} / g</em>
            </span>
            <span>
              <b>Metal value</b>
              <em>{money(result?.metalAmount)}</em>
            </span>
            <span>
              <b>Making charges</b>
              <em>{money(result?.makingChargeValue)}</em>
            </span>
          </div>
          <small>{result ? "Calculated by /api/calculator. Taxes and stone charges are excluded." : "Enter values and calculate to receive a backend result."}</small>
        </div>
      </section>
    </PageTop>
  );
}

function PageTop({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <>
      <div className="welcome page-title">
        <div>
          <p className="eyebrow">STORE MANAGEMENT</p>
          <h1>{title}</h1>
          <p className="muted">{text}</p>
        </div>
      </div>
      {children}
    </>
  );
}
